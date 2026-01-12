-- Add flag to mark transactions that should be accounted for in the next month (credit card cycle)

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS is_credit_card boolean NOT NULL DEFAULT false;

