-- Revert "Metas" category to be treated as a regular expense category
-- This reverts the change made in 17_auto_exclude_metas_liberdade_from_split.sql for Metas only
-- "Liberdade Financeira" remains as an investment/savings category

-- Set exclude_from_split = false for transactions in "Metas" category
-- so they are included in the fair bill splitting again
UPDATE public.transactions t
SET exclude_from_split = false
FROM public.categories c
WHERE t.category_id = c.id
  AND LOWER(TRIM(c.name)) = 'metas'
  AND t.exclude_from_split = true;
