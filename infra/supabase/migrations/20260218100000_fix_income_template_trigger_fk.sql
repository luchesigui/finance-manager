-- Fix FK violation when creating a person: the income template trigger ran
-- BEFORE INSERT, so recurring_templates.paid_by referenced a person row not
-- yet visible in people. Use AFTER INSERT for new people so the row exists
-- before inserting the template, then UPDATE people.income_template_id.

CREATE OR REPLACE FUNCTION public.sync_income_recurring_template_insert()
RETURNS trigger AS $$
DECLARE
  v_template_id bigint;
  v_template_description text;
BEGIN
  v_template_description := 'Salário - ' || NEW.name;

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

    UPDATE public.people
    SET income_template_id = v_template_id
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.sync_income_recurring_template_update()
RETURNS trigger AS $$
DECLARE
  v_template_id bigint;
  v_template_description text;
BEGIN
  v_template_description := 'Salário - ' || NEW.name;

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
  ELSIF OLD.income > 0 AND NEW.income = 0 THEN
    IF NEW.income_template_id IS NOT NULL THEN
      UPDATE public.recurring_templates
      SET is_active = false, updated_at = timezone('utc', now())
      WHERE id = NEW.income_template_id;
    END IF;
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
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_income_template ON public.people;

CREATE TRIGGER trg_sync_income_template_insert
  AFTER INSERT ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_income_recurring_template_insert();

CREATE TRIGGER trg_sync_income_template_update
  BEFORE UPDATE OF name, income ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_income_recurring_template_update();
