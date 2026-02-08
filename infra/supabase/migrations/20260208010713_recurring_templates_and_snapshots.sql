-- Phase 1: recurring templates and monthly snapshots

CREATE TABLE public.recurring_templates (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  category_id uuid REFERENCES public.household_categories(id) ON DELETE RESTRICT,
  paid_by uuid REFERENCES public.people(id) ON DELETE RESTRICT NOT NULL,
  type transaction_type NOT NULL DEFAULT 'expense',
  is_increment boolean DEFAULT true,
  is_credit_card boolean NOT NULL DEFAULT false,
  exclude_from_split boolean NOT NULL DEFAULT false,
  day_of_month integer NOT NULL DEFAULT 1 CHECK (day_of_month >= 1 AND day_of_month <= 31),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX idx_recurring_templates_household_active
  ON public.recurring_templates(household_id) WHERE is_active = true;

CREATE TABLE public.monthly_snapshots (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  people_income jsonb NOT NULL DEFAULT '[]',
  category_targets jsonb NOT NULL DEFAULT '[]',
  total_income numeric NOT NULL DEFAULT 0,
  total_expenses numeric NOT NULL DEFAULT 0,
  net_income_adjustments numeric NOT NULL DEFAULT 0,
  effective_income numeric NOT NULL DEFAULT 0,
  health_score integer,
  health_status text,
  health_reason text,
  emergency_fund numeric NOT NULL DEFAULT 0,
  snapshot_source text NOT NULL DEFAULT 'cron',
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(household_id, year, month)
);

ALTER TABLE public.transactions
  ADD COLUMN recurring_template_id bigint
  REFERENCES public.recurring_templates(id) ON DELETE SET NULL;

CREATE INDEX idx_transactions_recurring_template
  ON public.transactions(recurring_template_id) WHERE recurring_template_id IS NOT NULL;

CREATE INDEX idx_transactions_household_date
  ON public.transactions(household_id, date);

CREATE OR REPLACE FUNCTION public.assign_recurring_template_on_transaction_write()
RETURNS trigger AS $$
DECLARE
  v_template_id bigint;
  v_effective_category_id uuid;
BEGIN
  IF NEW.is_recurring IS DISTINCT FROM true THEN
    RETURN NEW;
  END IF;

  IF NEW.recurring_template_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.household_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_effective_category_id := CASE WHEN NEW.type = 'income' THEN NULL ELSE NEW.category_id END;

  SELECT rt.id
  INTO v_template_id
  FROM public.recurring_templates rt
  WHERE rt.household_id = NEW.household_id
    AND rt.description = NEW.description
    AND rt.amount = NEW.amount
    AND rt.paid_by = NEW.paid_by
    AND COALESCE(rt.category_id::text, '') = COALESCE(v_effective_category_id::text, '')
  ORDER BY rt.created_at DESC
  LIMIT 1;

  IF v_template_id IS NULL THEN
    INSERT INTO public.recurring_templates (
      household_id,
      description,
      amount,
      category_id,
      paid_by,
      type,
      is_increment,
      is_credit_card,
      exclude_from_split,
      day_of_month
    ) VALUES (
      NEW.household_id,
      NEW.description,
      NEW.amount,
      v_effective_category_id,
      NEW.paid_by,
      NEW.type,
      COALESCE(NEW.is_increment, true),
      COALESCE(NEW.is_credit_card, false),
      COALESCE(NEW.exclude_from_split, false),
      EXTRACT(DAY FROM NEW.date)::integer
    )
    RETURNING id INTO v_template_id;
  END IF;

  NEW.recurring_template_id := v_template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_recurring_template_on_transaction_write ON public.transactions;
CREATE TRIGGER trg_assign_recurring_template_on_transaction_write
BEFORE INSERT OR UPDATE OF
  description,
  amount,
  category_id,
  paid_by,
  is_recurring,
  recurring_template_id,
  is_credit_card,
  exclude_from_split,
  date,
  household_id,
  type,
  is_increment
ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.assign_recurring_template_on_transaction_write();

ALTER TABLE public.recurring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recurring templates in their households" ON public.recurring_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.recurring_templates.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert recurring templates in their households" ON public.recurring_templates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.recurring_templates.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update recurring templates in their households" ON public.recurring_templates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.recurring_templates.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete recurring templates in their households" ON public.recurring_templates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.recurring_templates.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view monthly snapshots in their households" ON public.monthly_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.monthly_snapshots.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert monthly snapshots in their households" ON public.monthly_snapshots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.monthly_snapshots.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update monthly snapshots in their households" ON public.monthly_snapshots
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.monthly_snapshots.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete monthly snapshots in their households" ON public.monthly_snapshots
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.monthly_snapshots.household_id
      AND user_id = auth.uid()
    )
  );

INSERT INTO public.recurring_templates (
  household_id,
  description,
  amount,
  category_id,
  paid_by,
  type,
  is_increment,
  is_credit_card,
  exclude_from_split,
  day_of_month
)
SELECT DISTINCT ON (t.household_id, t.description, t.amount, t.category_id, t.paid_by)
  t.household_id,
  t.description,
  t.amount,
  CASE WHEN t.type = 'income' THEN NULL ELSE t.category_id END,
  t.paid_by,
  t.type,
  COALESCE(t.is_increment, true),
  COALESCE(t.is_credit_card, false),
  COALESCE(t.exclude_from_split, false),
  EXTRACT(DAY FROM t.date)::integer
FROM public.transactions t
WHERE t.is_recurring = true
  AND t.recurring_template_id IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.recurring_templates rt
    WHERE rt.household_id = t.household_id
      AND rt.description = t.description
      AND rt.amount = t.amount
      AND rt.paid_by = t.paid_by
      AND COALESCE(rt.category_id::text, '') = COALESCE(
        (CASE WHEN t.type = 'income' THEN NULL ELSE t.category_id END)::text,
        ''
      )
  )
ORDER BY t.household_id, t.description, t.amount, t.category_id, t.paid_by, t.created_at DESC;

UPDATE public.transactions t
SET recurring_template_id = rt.id
FROM public.recurring_templates rt
WHERE t.is_recurring = true
  AND t.recurring_template_id IS NULL
  AND t.household_id = rt.household_id
  AND t.description = rt.description
  AND t.amount = rt.amount
  AND t.paid_by = rt.paid_by
  AND COALESCE((CASE WHEN t.type = 'income' THEN NULL ELSE t.category_id END)::text, '')
    = COALESCE(rt.category_id::text, '');

CREATE OR REPLACE FUNCTION public.bootstrap_historical_monthly_snapshots()
RETURNS void AS $$
DECLARE
  period_record RECORD;
  people_income_snapshot jsonb;
  category_targets_snapshot jsonb;
  emergency_fund_snapshot numeric;
  v_total_income numeric;
  v_total_expenses numeric;
  v_net_income_adjustments numeric;
  v_effective_income numeric;
BEGIN
  FOR period_record IN
    SELECT DISTINCT
      t.household_id,
      EXTRACT(YEAR FROM t.date)::integer AS year,
      EXTRACT(MONTH FROM t.date)::integer AS month
    FROM public.transactions t
    ORDER BY t.household_id, year, month
  LOOP
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'person_id', p.id,
          'person_name', p.name,
          'income', p.income
        )
        ORDER BY p.name
      ),
      '[]'::jsonb
    )
    INTO people_income_snapshot
    FROM public.people p
    WHERE p.household_id = period_record.household_id;

    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'category_id', hc.id,
          'category_name', c.name,
          'target_percent', hc.target_percent
        )
        ORDER BY c.name
      ),
      '[]'::jsonb
    )
    INTO category_targets_snapshot
    FROM public.household_categories hc
    JOIN public.categories c ON c.id = hc.category_id
    WHERE hc.household_id = period_record.household_id;

    SELECT COALESCE(h.emergency_fund, 0)
    INTO emergency_fund_snapshot
    FROM public.households h
    WHERE h.id = period_record.household_id;

    -- Compute aggregates from actual transactions (best-effort, ignores credit card month shift)
    SELECT
      COALESCE(SUM(CASE WHEN t.type = 'income' AND COALESCE(t.is_increment, true) THEN t.amount ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN t.type = 'income' AND NOT COALESCE(t.is_increment, true) THEN t.amount ELSE 0 END), 0)
    INTO v_total_income, v_total_expenses, v_net_income_adjustments
    FROM public.transactions t
    WHERE t.household_id = period_record.household_id
      AND EXTRACT(YEAR FROM t.date)::integer = period_record.year
      AND EXTRACT(MONTH FROM t.date)::integer = period_record.month
      AND NOT COALESCE(t.is_forecast, false);

    v_effective_income := v_total_income - v_net_income_adjustments - v_total_expenses;

    INSERT INTO public.monthly_snapshots (
      household_id,
      year,
      month,
      people_income,
      category_targets,
      total_income,
      total_expenses,
      net_income_adjustments,
      effective_income,
      emergency_fund,
      health_score,
      snapshot_source
    ) VALUES (
      period_record.household_id,
      period_record.year,
      period_record.month,
      people_income_snapshot,
      category_targets_snapshot,
      v_total_income,
      v_total_expenses,
      v_net_income_adjustments,
      v_effective_income,
      emergency_fund_snapshot,
      NULL,
      'migration_bootstrap'
    )
    ON CONFLICT (household_id, year, month) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT public.bootstrap_historical_monthly_snapshots();
DROP FUNCTION public.bootstrap_historical_monthly_snapshots();
