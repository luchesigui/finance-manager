-- Add flag to mark transactions that should not be included in the fair split

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS exclude_from_split boolean NOT NULL DEFAULT false;

