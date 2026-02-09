-- Baseline migration: consolidated schema from 24 original migrations
-- Original migration history preserved in /migrations-archive/

-- =============================================================================
-- 1. Extensions
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 2. Enums
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('expense', 'income');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 3. Tables (in FK-dependency order)
-- =============================================================================

-- households (default_payer_id added later via ALTER to resolve circular dep with people)
CREATE TABLE public.households (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  emergency_fund numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- household_members (composite PK)
CREATE TABLE public.household_members (
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (household_id, user_id)
);

-- people
CREATE TABLE public.people (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  income numeric NOT NULL,
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE,
  linked_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- categories (global, no household_id after normalization in migration 16)
CREATE TABLE public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- household_categories (household-specific category settings)
CREATE TABLE public.household_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  target_percent numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(household_id, category_id)
);

-- transactions (category_id references household_categories per migration 21)
CREATE TABLE public.transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  description text NOT NULL,
  amount numeric NOT NULL,
  category_id uuid REFERENCES public.household_categories(id) ON DELETE RESTRICT,
  paid_by uuid REFERENCES public.people(id) ON DELETE RESTRICT,
  is_recurring boolean DEFAULT false,
  date date NOT NULL,
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE,
  exclude_from_split boolean NOT NULL DEFAULT false,
  is_credit_card boolean NOT NULL DEFAULT false,
  type transaction_type NOT NULL DEFAULT 'expense',
  is_increment boolean DEFAULT true,
  is_forecast boolean NOT NULL DEFAULT false,
  is_forecast_included boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on transaction type for faster filtering
CREATE INDEX idx_transactions_type ON public.transactions(type);

-- simulations
CREATE TABLE public.simulations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  state jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Deferred ALTER: add default_payer_id to households (resolves circular dep with people)
ALTER TABLE public.households
  ADD COLUMN default_payer_id uuid REFERENCES public.people(id) ON DELETE SET NULL;

-- =============================================================================
-- 4. Row Level Security
-- =============================================================================
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 5. Functions
-- =============================================================================

-- is_household_member: security definer to avoid RLS recursion on household_members
CREATE OR REPLACE FUNCTION public.is_household_member(check_household_id uuid, check_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.household_members
    WHERE household_id = check_household_id
    AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- handle_new_user: triggered on auth.users insert (final version from migration 16)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_household_id uuid;
  owner_person_id uuid;
  error_message text;
  cat_record RECORD;
BEGIN
  -- Create a profile
  BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
  EXCEPTION
    WHEN others THEN
      error_message := 'Failed to create profile: ' || SQLERRM;
      RAISE EXCEPTION '%', error_message;
  END;

  -- Create a default household for the user
  BEGIN
    INSERT INTO public.households
    DEFAULT VALUES
    RETURNING id INTO new_household_id;
  EXCEPTION
    WHEN others THEN
      error_message := 'Failed to create household: ' || SQLERRM;
      RAISE EXCEPTION '%', error_message;
  END;

  -- Add user to their default household as owner
  BEGIN
    INSERT INTO public.household_members (household_id, user_id, role)
    VALUES (new_household_id, new.id, 'owner')
    ON CONFLICT (household_id, user_id) DO NOTHING;
  EXCEPTION
    WHEN others THEN
      error_message := 'Failed to add user to household: ' || SQLERRM;
      RAISE EXCEPTION '%', error_message;
  END;

  -- Create default person for the user
  BEGIN
    INSERT INTO public.people (name, income, household_id, linked_user_id)
    VALUES (
      split_part(new.email, '@', 1),
      0,
      new_household_id,
      new.id
    )
    RETURNING id INTO owner_person_id;

    -- Set default payer to the owner's person
    IF owner_person_id IS NOT NULL THEN
      UPDATE public.households
      SET default_payer_id = owner_person_id
      WHERE id = new_household_id;
    END IF;
  EXCEPTION
    WHEN others THEN
      error_message := 'Failed to create default person: ' || SQLERRM;
      RAISE EXCEPTION '%', error_message;
  END;

  -- Link household to all global categories with default percentages
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM public.household_categories
      WHERE household_id = new_household_id
    ) THEN
      FOR cat_record IN
        SELECT id, name FROM public.categories
      LOOP
        INSERT INTO public.household_categories (household_id, category_id, target_percent)
        VALUES (
          new_household_id,
          cat_record.id,
          CASE cat_record.name
            WHEN 'Liberdade Financeira' THEN 30
            WHEN 'Gastos Essenciais' THEN 25
            WHEN 'Conforto' THEN 15
            WHEN 'Planejamento' THEN 15
            WHEN 'Prazeres' THEN 10
            WHEN 'Conhecimento' THEN 5
            ELSE 0
          END
        );
      END LOOP;
    END IF;
  EXCEPTION
    WHEN others THEN
      -- Log but don't fail - categories are not critical
      RAISE WARNING 'Error creating default household_categories: %', SQLERRM;
  END;

  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION 'Database error saving new user: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 6. Trigger
-- =============================================================================
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================================================
-- 7. RLS Policies
-- =============================================================================

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- households
CREATE POLICY "Users can view households they belong to" ON public.households
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.households.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert households" ON public.households
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update households they belong to" ON public.households
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.households.id
      AND user_id = auth.uid()
    )
  );

-- household_members (uses is_household_member to avoid RLS recursion)
CREATE POLICY "Users can view members of their households" ON public.household_members
  FOR SELECT USING (
    public.is_household_member(household_id, auth.uid())
  );

-- people
CREATE POLICY "Users can view people in their households" ON public.people
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.people.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert people in their households" ON public.people
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update people in their households" ON public.people
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.people.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete people in their households" ON public.people
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.people.household_id
      AND user_id = auth.uid()
    )
  );

-- categories (global, authenticated users can view)
CREATE POLICY "Authenticated users can view categories" ON public.categories
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- household_categories
CREATE POLICY "Users can view household_categories in their households" ON public.household_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.household_categories.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert household_categories in their households" ON public.household_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.household_categories.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update household_categories in their households" ON public.household_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.household_categories.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete household_categories in their households" ON public.household_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.household_categories.household_id
      AND user_id = auth.uid()
    )
  );

-- transactions
CREATE POLICY "Users can view transactions in their households" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.transactions.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert transactions in their households" ON public.transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update transactions in their households" ON public.transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.transactions.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete transactions in their households" ON public.transactions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.transactions.household_id
      AND user_id = auth.uid()
    )
  );

-- simulations
CREATE POLICY "Users can view simulations in their households" ON public.simulations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.simulations.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert simulations in their households" ON public.simulations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.simulations.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update simulations in their households" ON public.simulations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.simulations.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete simulations in their households" ON public.simulations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.simulations.household_id
      AND user_id = auth.uid()
    )
  );

-- =============================================================================
-- 8. Seed global categories
-- =============================================================================
INSERT INTO public.categories (name) VALUES
  ('Liberdade Financeira'),
  ('Gastos Essenciais'),
  ('Conforto'),
  ('Planejamento'),
  ('Prazeres'),
  ('Conhecimento');
