-- Normalize categories schema
-- Split categories into:
-- 1. categories: Abstract category definitions (id, name)
-- 2. household_categories: Household-specific settings (household_id, category_id, target_percent)

-- Step 1: Create the new household_categories table
CREATE TABLE IF NOT EXISTS public.household_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  target_percent numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(household_id, category_id)
);

-- Enable RLS on household_categories
ALTER TABLE public.household_categories ENABLE ROW LEVEL SECURITY;

-- Step 2: Migrate existing data from categories to household_categories
-- This preserves each household's target_percent values
INSERT INTO public.household_categories (household_id, category_id, target_percent, created_at)
SELECT 
  c.household_id,
  c.id,
  c.target_percent,
  c.created_at
FROM public.categories c
WHERE c.household_id IS NOT NULL
ON CONFLICT (household_id, category_id) DO NOTHING;

-- Step 3: Create the canonical categories (one entry per unique name)
-- We'll create a temporary table to hold the mapping
CREATE TEMP TABLE category_name_mapping AS
SELECT DISTINCT ON (name) id, name
FROM public.categories
ORDER BY name, created_at;

-- Step 4: Update household_categories to point to canonical category IDs
-- First, we need to update the category_id in household_categories to use canonical IDs
UPDATE public.household_categories hc
SET category_id = cnm.id
FROM category_name_mapping cnm
JOIN public.categories c ON c.name = cnm.name
WHERE hc.category_id = c.id AND c.id != cnm.id;

-- Step 5: Update transactions to point to canonical category IDs
UPDATE public.transactions t
SET category_id = cnm.id
FROM category_name_mapping cnm
JOIN public.categories c ON c.name = cnm.name
WHERE t.category_id = c.id AND c.id != cnm.id;

-- Step 6: Delete duplicate categories (keep only canonical ones)
DELETE FROM public.categories c
WHERE NOT EXISTS (
  SELECT 1 FROM category_name_mapping cnm WHERE cnm.id = c.id
);

-- Step 7: Remove household_id and target_percent from categories table
-- (they are now in household_categories)
ALTER TABLE public.categories DROP COLUMN IF EXISTS household_id;
ALTER TABLE public.categories DROP COLUMN IF EXISTS target_percent;

-- Drop temporary table
DROP TABLE IF EXISTS category_name_mapping;

-- Step 8: Create RLS policies for household_categories
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

-- Step 9: Update categories RLS policies (now categories are global/shared)
-- Drop old household-based policies
DROP POLICY IF EXISTS "Users can view categories in their households" ON public.categories;
DROP POLICY IF EXISTS "Users can insert categories in their households" ON public.categories;
DROP POLICY IF EXISTS "Users can update categories in their households" ON public.categories;

-- Create new policies - authenticated users can view all categories
CREATE POLICY "Authenticated users can view categories" ON public.categories
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only allow inserts/updates through service role (system-managed)
-- No direct user insert/update policies for global categories

-- Step 10: Update handle_new_user function to use new schema
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
      -- Insert household_categories for each global category
      FOR cat_record IN 
        SELECT id, name FROM public.categories
      LOOP
        INSERT INTO public.household_categories (household_id, category_id, target_percent)
        VALUES (
          new_household_id,
          cat_record.id,
          CASE cat_record.name
            WHEN 'Liberdade Financeira' THEN 30
            WHEN 'Custos Fixos' THEN 25
            WHEN 'Conforto' THEN 15
            WHEN 'Metas' THEN 15
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
    -- Log the full error details
    RAISE EXCEPTION 'Database error saving new user: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Insert the default global categories if they don't exist
INSERT INTO public.categories (name)
SELECT name FROM (VALUES
  ('Liberdade Financeira'),
  ('Custos Fixos'),
  ('Conforto'),
  ('Metas'),
  ('Prazeres'),
  ('Conhecimento')
) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories WHERE categories.name = v.name
);
