-- Migration: Change transactions.category_id to reference household_categories instead of categories
-- This ensures transactions are linked to household-specific category settings

-- Step 1: Add a new column for the household_category reference
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS household_category_id uuid REFERENCES public.household_categories(id) ON DELETE RESTRICT;

-- Step 2: Populate the new column by finding the matching household_category
-- For each transaction, find the household_categories entry where:
--   household_categories.household_id = transactions.household_id
--   household_categories.category_id = transactions.category_id (current global category)
UPDATE public.transactions t
SET household_category_id = hc.id
FROM public.household_categories hc
WHERE hc.household_id = t.household_id
  AND hc.category_id = t.category_id
  AND t.category_id IS NOT NULL;

-- Step 3: Verify all transactions with a category have been migrated
-- This will raise an error if any transactions couldn't be mapped
DO $$
DECLARE
  unmapped_count integer;
BEGIN
  SELECT COUNT(*) INTO unmapped_count
  FROM public.transactions
  WHERE category_id IS NOT NULL
    AND household_category_id IS NULL;

  IF unmapped_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % transactions could not be mapped to household_categories. Ensure all household_categories entries exist.', unmapped_count;
  END IF;
END $$;

-- Step 4: Drop the old category_id foreign key constraint
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_category_id_fkey;

-- Step 5: Drop the old category_id column
ALTER TABLE public.transactions
DROP COLUMN IF EXISTS category_id;

-- Step 6: Rename household_category_id to category_id for consistency
ALTER TABLE public.transactions
RENAME COLUMN household_category_id TO category_id;

-- Step 7: Update RLS policies if needed (they reference household_id, not category_id, so should be fine)

-- Step 8: Update the handle_new_user function to use household_categories when creating sample transactions (if any)
-- Note: The current handle_new_user doesn't create transactions, so no changes needed there
