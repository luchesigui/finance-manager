-- Seed recurring transactions so Phase 1 migration can be tested:
-- 1) "Testing": created two months ago -> template + past months linked, current-month row deleted
-- 2) "test 2": only in current month -> only template remains, transaction deleted
-- Requires dev user and household to exist (created here so trigger runs before Phase 1).

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  aud,
  role
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'dev@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Dev User"}',
  now(),
  now(),
  '',
  '',
  '',
  '',
  'authenticated',
  'authenticated'
);

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  '{"sub":"a0000000-0000-0000-0000-000000000001","email":"dev@example.com"}'::jsonb,
  'email',
  'a0000000-0000-0000-0000-000000000001',
  now(),
  now(),
  now()
);

DO $$
DECLARE
  v_household_id uuid;
  v_person_id uuid;
  v_hc_conforto uuid;
  v_date_2mo date;
  v_date_1mo date;
  v_date_cur date;
BEGIN
  SELECT household_id INTO v_household_id
  FROM public.household_members
  WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
  LIMIT 1;

  SELECT id INTO v_person_id
  FROM public.people
  WHERE linked_user_id = 'a0000000-0000-0000-0000-000000000001'
  LIMIT 1;

  SELECT hc.id INTO v_hc_conforto
  FROM public.household_categories hc
  JOIN public.categories c ON c.id = hc.category_id
  WHERE hc.household_id = v_household_id AND c.name = 'Conforto'
  LIMIT 1;

  v_date_2mo := (date_trunc('month', CURRENT_DATE) - interval '2 months')::date + 10;
  v_date_1mo := (date_trunc('month', CURRENT_DATE) - interval '1 month')::date + 10;
  v_date_cur := (date_trunc('month', CURRENT_DATE))::date + 5;

  -- Scenario 1: "Testing" – recurring created two months ago (2mo, 1mo, current).
  -- After Phase 1: template + Jan/Feb linked; March row deleted.
  INSERT INTO public.transactions (
    description, amount, category_id, paid_by, date, household_id, type, is_recurring
  ) VALUES
    ('Testing', 100, v_hc_conforto, v_person_id, v_date_2mo, v_household_id, 'expense', true),
    ('Testing', 100, v_hc_conforto, v_person_id, v_date_1mo, v_household_id, 'expense', true),
    ('Testing', 100, v_hc_conforto, v_person_id, v_date_cur, v_household_id, 'expense', true);

  -- Scenario 2: "test 2" – recurring only in current month.
  -- After Phase 1: only template remains; transaction deleted.
  INSERT INTO public.transactions (
    description, amount, category_id, paid_by, date, household_id, type, is_recurring
  ) VALUES
    ('test 2', 50, v_hc_conforto, v_person_id, v_date_cur, v_household_id, 'expense', true);
END $$;
