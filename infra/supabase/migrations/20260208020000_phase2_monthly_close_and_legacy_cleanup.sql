-- Phase 2: closed_periods, run_monthly_close, legacy recurring cleanup (no auto-close; manual or cron)

CREATE UNIQUE INDEX IF NOT EXISTS uq_transactions_template_occurrence
  ON public.transactions(household_id, recurring_template_id, date)
  WHERE recurring_template_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_transactions_income_auto_occurrence
  ON public.transactions(household_id, paid_by, date, description)
  WHERE type = 'income' AND recurring_template_id IS NULL
    AND description LIKE 'Renda mensal automática:%';

-- Thin table to mark that monthly-close was run for a period (replaces "has snapshot" semantics)
CREATE TABLE IF NOT EXISTS public.closed_periods (
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  PRIMARY KEY (household_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_closed_periods_household
  ON public.closed_periods(household_id);

ALTER TABLE public.closed_periods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can read closed periods of their household" ON public.closed_periods;
CREATE POLICY "Members can read closed periods of their household"
  ON public.closed_periods
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = closed_periods.household_id
        AND hm.user_id = auth.uid()
    )
  );

-- Monthly close: only insert transactions (templates + auto income) and mark period closed
CREATE OR REPLACE FUNCTION public.run_monthly_close(
  p_household_id uuid,
  p_year integer,
  p_month integer,
  p_source text DEFAULT 'cron'
) RETURNS jsonb AS $$
DECLARE
  v_period_start date;
  v_inserted_recurring integer := 0;
  v_inserted_income integer := 0;
BEGIN
  IF p_month < 1 OR p_month > 12 THEN
    RAISE EXCEPTION 'Invalid month: %', p_month;
  END IF;

  v_period_start := make_date(p_year, p_month, 1);

  WITH inserted AS (
    INSERT INTO public.transactions (
      description,
      amount,
      category_id,
      paid_by,
      date,
      household_id,
      recurring_template_id,
      is_credit_card,
      exclude_from_split,
      type,
      is_increment,
      is_forecast,
      is_forecast_included
    )
    SELECT
      rt.description,
      rt.amount,
      CASE WHEN rt.type = 'income' THEN NULL ELSE rt.category_id END,
      rt.paid_by,
      make_date(
        p_year,
        p_month,
        LEAST(
          rt.day_of_month,
          EXTRACT(day FROM (date_trunc('month', make_date(p_year, p_month, 1)) + interval '1 month -1 day'))::integer
        )
      ),
      rt.household_id,
      rt.id,
      CASE WHEN rt.type = 'income' THEN false ELSE COALESCE(rt.is_credit_card, false) END,
      CASE WHEN rt.type = 'income' THEN false ELSE COALESCE(rt.exclude_from_split, false) END,
      rt.type,
      COALESCE(rt.is_increment, true),
      false,
      false
    FROM public.recurring_templates rt
    WHERE rt.household_id = p_household_id
      AND rt.is_active = true
    ON CONFLICT DO NOTHING
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_inserted_recurring FROM inserted;

  WITH inserted AS (
    INSERT INTO public.transactions (
      description,
      amount,
      category_id,
      paid_by,
      date,
      household_id,
      recurring_template_id,
      is_credit_card,
      exclude_from_split,
      type,
      is_increment,
      is_forecast,
      is_forecast_included
    )
    SELECT
      CONCAT('Renda mensal automática: ', p.name),
      p.income,
      NULL,
      p.id,
      v_period_start,
      p.household_id,
      NULL,
      false,
      false,
      'income'::public.transaction_type,
      true,
      false,
      false
    FROM public.people p
    WHERE p.household_id = p_household_id
      AND p.income > 0
      AND NOT EXISTS (
        SELECT 1
        FROM public.transactions t
        WHERE t.household_id = p_household_id
          AND t.type = 'income'
          AND t.paid_by = p.id
          AND t.date = v_period_start
          AND t.description = CONCAT('Renda mensal automática: ', p.name)
      )
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_inserted_income FROM inserted;

  INSERT INTO public.closed_periods (household_id, year, month)
  VALUES (p_household_id, p_year, p_month)
  ON CONFLICT (household_id, year, month) DO NOTHING;

  RETURN jsonb_build_object(
    'household_id', p_household_id,
    'year', p_year,
    'month', p_month,
    'inserted_recurring', v_inserted_recurring,
    'inserted_income', v_inserted_income,
    'source', COALESCE(NULLIF(TRIM(p_source), ''), 'cron')
  );
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_recurring_template_on_transaction_write ON public.transactions;
DROP FUNCTION IF EXISTS public.assign_recurring_template_on_transaction_write();

ALTER TABLE public.transactions DROP COLUMN IF EXISTS is_recurring;
