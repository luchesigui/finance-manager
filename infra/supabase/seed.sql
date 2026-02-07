-- Dev seed data
-- This file is run by `supabase db reset` to populate the local database.
-- The handle_new_user() trigger will automatically create:
--   - profile, household, household_member, person, household_categories

-- Insert a test user into auth.users (triggers handle_new_user).
-- Required: token columns must be '' not NULL (see supabase/auth#1940).
-- Required: also insert into auth.identities so the user can sign in with password.
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

-- Link identity so email/password login works (required in recent Supabase Auth).
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

-- Wait for trigger to complete, then add sample transactions
-- Fetch the household and household_categories created by the trigger
DO $$
DECLARE
  v_household_id uuid;
  v_person_id uuid;
  v_hc_custos uuid;
  v_hc_conforto uuid;
  v_hc_metas uuid;
  v_hc_prazeres uuid;
  v_hc_liberdade uuid;
  v_hc_conhecimento uuid;
  v_today date := CURRENT_DATE;
  v_year int := extract(year from v_today);
  v_month int := extract(month from v_today);
BEGIN
  -- Get the household and person created by the trigger
  SELECT household_id INTO v_household_id
  FROM public.household_members
  WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
  LIMIT 1;

  SELECT id INTO v_person_id
  FROM public.people
  WHERE linked_user_id = 'a0000000-0000-0000-0000-000000000001'
  LIMIT 1;

  -- Get household_category IDs by name
  SELECT hc.id INTO v_hc_custos
  FROM public.household_categories hc
  JOIN public.categories c ON c.id = hc.category_id
  WHERE hc.household_id = v_household_id AND c.name = 'Custos Fixos';

  SELECT hc.id INTO v_hc_conforto
  FROM public.household_categories hc
  JOIN public.categories c ON c.id = hc.category_id
  WHERE hc.household_id = v_household_id AND c.name = 'Conforto';

  SELECT hc.id INTO v_hc_metas
  FROM public.household_categories hc
  JOIN public.categories c ON c.id = hc.category_id
  WHERE hc.household_id = v_household_id AND c.name = 'Planejamento';

  SELECT hc.id INTO v_hc_prazeres
  FROM public.household_categories hc
  JOIN public.categories c ON c.id = hc.category_id
  WHERE hc.household_id = v_household_id AND c.name = 'Prazeres';

  SELECT hc.id INTO v_hc_liberdade
  FROM public.household_categories hc
  JOIN public.categories c ON c.id = hc.category_id
  WHERE hc.household_id = v_household_id AND c.name = 'Liberdade Financeira';

  SELECT hc.id INTO v_hc_conhecimento
  FROM public.household_categories hc
  JOIN public.categories c ON c.id = hc.category_id
  WHERE hc.household_id = v_household_id AND c.name = 'Conhecimento';

  -- Update person income
  UPDATE public.people SET income = 10000 WHERE id = v_person_id;

  -- Insert sample transactions
  INSERT INTO public.transactions (description, amount, category_id, paid_by, is_recurring, date, household_id, type) VALUES
    ('Aluguel',       4100, v_hc_custos,    v_person_id, true,  make_date(v_year, v_month, 1),  v_household_id, 'expense'),
    ('Condominio',    1025, v_hc_custos,    v_person_id, true,  make_date(v_year, v_month, 5),  v_household_id, 'expense'),
    ('Internet',       120, v_hc_custos,    v_person_id, true,  make_date(v_year, v_month, 10), v_household_id, 'expense'),
    ('Supermercado',   800, v_hc_conforto,  v_person_id, false, make_date(v_year, v_month, 10), v_household_id, 'expense'),
    ('Curso online',   200, v_hc_conhecimento, v_person_id, false, make_date(v_year, v_month, 15), v_household_id, 'expense'),
    ('Investimento',  1500, v_hc_liberdade, v_person_id, true,  make_date(v_year, v_month, 1),  v_household_id, 'expense'),
    ('Comissão',     1300,  v_hc_custos,    v_person_id, true,  make_date(v_year, v_month, 5),  v_household_id, 'income');
END $$;
