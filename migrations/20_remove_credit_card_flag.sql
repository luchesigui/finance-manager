-- Remove the is_credit_card column from transactions table
-- This column is no longer used as the credit card functionality has been removed

ALTER TABLE public.transactions
  DROP COLUMN IF EXISTS is_credit_card;
