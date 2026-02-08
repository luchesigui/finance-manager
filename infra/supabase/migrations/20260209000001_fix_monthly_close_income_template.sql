-- Fix run_monthly_close to link income transactions to income_template_id from people

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

  -- Insert income transactions for people WITHOUT income_template_id (legacy fallback)
  -- People WITH income_template_id are handled in the recurring templates insert above
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
      NULL, -- No template for legacy people without income_template_id
      false,
      false,
      'income'::public.transaction_type,
      true,
      false,
      false
    FROM public.people p
    WHERE p.household_id = p_household_id
      AND p.income > 0
      AND p.income_template_id IS NULL -- Only for people without linked income templates
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
