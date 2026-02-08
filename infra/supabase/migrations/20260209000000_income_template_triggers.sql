-- Migration: Income Template Triggers and Cleanup
-- This migration:
-- 1. Drops the auto-template trigger on transactions (we no longer auto-create templates from is_recurring flag)
-- 2. Adds a column to people to track their income template
-- 3. Creates triggers to auto-create/update income recurring templates when people are added/updated

-- =============================================================================
-- 1. Drop the auto-template trigger on transactions
-- =============================================================================
DROP TRIGGER IF EXISTS trg_assign_recurring_template_on_transaction_write ON public.transactions;
DROP FUNCTION IF EXISTS public.assign_recurring_template_on_transaction_write();

-- Remove is_recurring column from transactions (no longer needed)
ALTER TABLE public.transactions DROP COLUMN IF EXISTS is_recurring;

-- =============================================================================
-- 2. Add income_template_id to people table
-- =============================================================================
ALTER TABLE public.people
  ADD COLUMN income_template_id bigint
  REFERENCES public.recurring_templates(id) ON DELETE SET NULL;

CREATE INDEX idx_people_income_template ON public.people(income_template_id)
  WHERE income_template_id IS NOT NULL;

-- =============================================================================
-- 3. Create trigger function for syncing income templates with people
-- =============================================================================
CREATE OR REPLACE FUNCTION public.sync_income_recurring_template()
RETURNS trigger AS $$
DECLARE
  v_template_id bigint;
  v_template_description text;
BEGIN
  -- Build description: "Salário - {person_name}"
  v_template_description := 'Salário - ' || NEW.name;

  -- INSERT: Create income template if income > 0
  IF TG_OP = 'INSERT' THEN
    IF NEW.income > 0 AND NEW.household_id IS NOT NULL THEN
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
        day_of_month,
        is_active
      ) VALUES (
        NEW.household_id,
        v_template_description,
        NEW.income,
        NULL, -- income has no category
        NEW.id,
        'income',
        true,
        false,
        false,
        1, -- default to 1st of month
        true
      )
      RETURNING id INTO v_template_id;

      -- Update the person with the template reference
      NEW.income_template_id := v_template_id;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE: Sync template when name or income changes
  IF TG_OP = 'UPDATE' THEN
    -- If income changed from 0 to > 0, create template
    IF OLD.income = 0 AND NEW.income > 0 AND NEW.household_id IS NOT NULL THEN
      IF NEW.income_template_id IS NULL THEN
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
          day_of_month,
          is_active
        ) VALUES (
          NEW.household_id,
          v_template_description,
          NEW.income,
          NULL,
          NEW.id,
          'income',
          true,
          false,
          false,
          1,
          true
        )
        RETURNING id INTO v_template_id;

        NEW.income_template_id := v_template_id;
      END IF;
    -- If income changed from > 0 to 0, deactivate template
    ELSIF OLD.income > 0 AND NEW.income = 0 THEN
      IF NEW.income_template_id IS NOT NULL THEN
        UPDATE public.recurring_templates
        SET is_active = false, updated_at = timezone('utc', now())
        WHERE id = NEW.income_template_id;
      END IF;
    -- If income or name changed and we have a template, update it
    ELSIF NEW.income_template_id IS NOT NULL AND (OLD.income <> NEW.income OR OLD.name <> NEW.name) THEN
      UPDATE public.recurring_templates
      SET
        amount = NEW.income,
        description = v_template_description,
        is_active = NEW.income > 0,
        updated_at = timezone('utc', now())
      WHERE id = NEW.income_template_id;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_income_template ON public.people;
CREATE TRIGGER trg_sync_income_template
BEFORE INSERT OR UPDATE OF name, income ON public.people
FOR EACH ROW
EXECUTE FUNCTION public.sync_income_recurring_template();

-- =============================================================================
-- 4. Backfill: Create income templates for existing people with income > 0
-- =============================================================================
DO $$
DECLARE
  person_record RECORD;
  v_template_id bigint;
  v_template_description text;
BEGIN
  FOR person_record IN
    SELECT id, name, income, household_id
    FROM public.people
    WHERE income > 0
      AND household_id IS NOT NULL
      AND income_template_id IS NULL
  LOOP
    v_template_description := 'Salário - ' || person_record.name;

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
      day_of_month,
      is_active
    ) VALUES (
      person_record.household_id,
      v_template_description,
      person_record.income,
      NULL,
      person_record.id,
      'income',
      true,
      false,
      false,
      1,
      true
    )
    RETURNING id INTO v_template_id;

    UPDATE public.people
    SET income_template_id = v_template_id
    WHERE id = person_record.id;
  END LOOP;
END $$;
