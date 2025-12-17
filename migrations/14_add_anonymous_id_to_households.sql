-- Add anonymous_id to households to support cookie-based access
ALTER TABLE public.households
ADD COLUMN IF NOT EXISTS anonymous_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS households_anonymous_id_idx ON public.households(anonymous_id);

-- Update RLS policies to allow access via anonymous_id (if we were using RLS for anon)
-- However, we will likely use service_role with manual filtering for anonymous users
-- to avoid complex RLS hacks with cookies.

-- But, strictly speaking, we could add a policy:
-- CREATE POLICY "Anonymous access" ON public.households
-- FOR ALL USING (anonymous_id = current_setting('app.anonymous_id', true));

-- For now, just the column is enough for the service_role approach.
