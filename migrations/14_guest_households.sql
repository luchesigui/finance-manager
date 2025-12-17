-- Allow using the app without registering by tying data to a guest cookie id.
-- We associate that cookie id to a household via households.guest_id.

ALTER TABLE public.households
  ADD COLUMN IF NOT EXISTS guest_id text;

-- Ensure a guest_id can only map to one household
CREATE UNIQUE INDEX IF NOT EXISTS households_guest_id_unique
  ON public.households (guest_id)
  WHERE guest_id IS NOT NULL;

