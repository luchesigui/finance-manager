-- Rename "Custos Fixos" to "Gastos Essenciais"
-- This migration updates the category name in the categories table.

UPDATE public.categories
SET name = 'Gastos Essenciais'
WHERE name = 'Custos Fixos';
