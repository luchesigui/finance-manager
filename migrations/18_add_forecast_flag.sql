-- Add flag to mark forecast transactions excluded from calculations

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS is_forecast boolean NOT NULL DEFAULT false;

