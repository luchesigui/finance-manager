-- Phase 1: recurring templates (no monthly_snapshots; closing is manual or via cron)

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

-- Link only past months: recurring_template_id set only for transactions before current month
UPDATE public.transactions t
SET recurring_template_id = rt.id
FROM public.recurring_templates rt
WHERE t.is_recurring = true
  AND t.recurring_template_id IS NULL
  AND t.date < date_trunc('month', CURRENT_DATE)::date
  AND t.household_id = rt.household_id
  AND t.description = rt.description
  AND t.amount = rt.amount
  AND t.paid_by = rt.paid_by
  AND COALESCE((CASE WHEN t.type = 'income' THEN NULL ELSE t.category_id END)::text, '')
    = COALESCE(rt.category_id::text, '');

-- Remove current-month and future recurring transactions; only the template remains (materialized on demand)
DELETE FROM public.transactions t
USING public.recurring_templates rt
WHERE t.is_recurring = true
  AND t.date >= date_trunc('month', CURRENT_DATE)::date
  AND t.household_id = rt.household_id
  AND t.description = rt.description
  AND t.amount = rt.amount
  AND t.paid_by = rt.paid_by
  AND COALESCE((CASE WHEN t.type = 'income' THEN NULL ELSE t.category_id END)::text, '')
    = COALESCE(rt.category_id::text, '');
