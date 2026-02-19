-- Add is_next_billing column to transactions and recurring_templates
-- Splits the dual-purpose is_credit_card into two independent concepts:
--   is_credit_card: marks a transaction as credit card
--   is_next_billing: shifts transaction to next accounting month

-- 1. Add column to transactions
ALTER TABLE public.transactions
  ADD COLUMN is_next_billing boolean NOT NULL DEFAULT false;

-- 2. Add column to recurring_templates
ALTER TABLE public.recurring_templates
  ADD COLUMN is_next_billing boolean NOT NULL DEFAULT false;

-- 3. Data migration: existing credit card transactions get is_next_billing = true
UPDATE public.transactions SET is_next_billing = true WHERE is_credit_card = true;

-- 4. Same for recurring_templates
UPDATE public.recurring_templates SET is_next_billing = true WHERE is_credit_card = true;

-- 5. Update run_monthly_close to include is_next_billing
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

  -- Insert transactions from active recurring templates
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
      is_next_billing,
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
      CASE WHEN rt.type = 'income' THEN false ELSE COALESCE(rt.is_next_billing, false) END,
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

  -- Insert income transactions for people WITHOUT income_template_id (legacy fallback)
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
      is_next_billing,
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
      false,
      'income'::public.transaction_type,
      true,
      false,
      false
    FROM public.people p
    WHERE p.household_id = p_household_id
      AND p.income > 0
      AND p.income_template_id IS NULL
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
