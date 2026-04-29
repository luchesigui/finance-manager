-- Remote one-off cleanup script.
-- Keeps only auth account: gui.olhenrique@gmail.com
-- Preserves global reference tables (for example: public.categories).
-- WARNING: irreversible. Run only on the intended remote project.

BEGIN;

DO $$
DECLARE
  v_target_email constant text := 'gui.olhenrique@gmail.com';
  v_target_user_id uuid;
  v_target_count integer;
  v_household_id uuid;
  v_owner_person_id uuid;
  v_deleted_count integer;
BEGIN
  SELECT count(*)
  INTO v_target_count
  FROM auth.users
  WHERE lower(email) = lower(v_target_email);

  SELECT id
  INTO v_target_user_id
  FROM auth.users
  WHERE lower(email) = lower(v_target_email)
  LIMIT 1;

  IF v_target_count <> 1 THEN
    RAISE EXCEPTION
      'Safety check failed: expected exactly 1 auth.users row for %, found %',
      v_target_email, v_target_count;
  END IF;

  RAISE NOTICE 'Target auth user id: %', v_target_user_id;

  DELETE FROM public.transactions;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted transactions: %', v_deleted_count;

  DELETE FROM public.simulations;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted simulations: %', v_deleted_count;

  DELETE FROM public.recurring_templates;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted recurring_templates: %', v_deleted_count;

  DELETE FROM public.household_categories;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted household_categories: %', v_deleted_count;

  DELETE FROM public.people;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted people: %', v_deleted_count;

  DELETE FROM public.household_members;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted household_members: %', v_deleted_count;

  DELETE FROM public.households;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted households: %', v_deleted_count;

  DELETE FROM public.profiles
  WHERE id <> v_target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted non-target profiles: %', v_deleted_count;

  INSERT INTO public.profiles (id, email)
  VALUES (v_target_user_id, v_target_email)
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;

  DELETE FROM auth.users
  WHERE id <> v_target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted non-target auth.users: %', v_deleted_count;

  INSERT INTO public.households DEFAULT VALUES
  RETURNING id INTO v_household_id;

  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (v_household_id, v_target_user_id, 'owner');

  INSERT INTO public.people (name, income, household_id, linked_user_id)
  VALUES (
    split_part(v_target_email, '@', 1),
    0,
    v_household_id,
    v_target_user_id
  )
  RETURNING id INTO v_owner_person_id;

  UPDATE public.households
  SET default_payer_id = v_owner_person_id
  WHERE id = v_household_id;

  INSERT INTO public.household_categories (household_id, category_id, target_percent)
  SELECT
    v_household_id,
    c.id,
    CASE c.name
      WHEN 'Liberdade Financeira' THEN 30
      WHEN 'Gastos Essenciais' THEN 25
      WHEN 'Conforto' THEN 15
      WHEN 'Planejamento' THEN 15
      WHEN 'Prazeres' THEN 10
      WHEN 'Conhecimento' THEN 5
      ELSE 0
    END
  FROM public.categories c;

  RAISE NOTICE 'Cleanup completed. Preserved account: %', v_target_email;
END $$;

COMMIT;
