-- Add flag to include forecast transactions in calculations

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS is_forecast_included boolean NOT NULL DEFAULT false;

