-- Ensure forecast transactions are excluded by default

UPDATE public.transactions
SET exclude_from_split = true
WHERE is_forecast = true AND exclude_from_split = false;

