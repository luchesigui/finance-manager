-- Auto-exclude transactions from "Metas" and "Liberdade Financeira" categories from split
-- These are savings/goals categories that should not be included in the fair bill splitting

-- Update existing transactions to set exclude_from_split = true
-- for transactions in "Metas" or "Liberdade Financeira" categories
UPDATE public.transactions t
SET exclude_from_split = true
FROM public.categories c
WHERE t.category_id = c.id
  AND (
    LOWER(TRIM(c.name)) = 'metas'
    OR LOWER(TRIM(c.name)) = 'liberdade financeira'
  )
  AND t.exclude_from_split = false;
