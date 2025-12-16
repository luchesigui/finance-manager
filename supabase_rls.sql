-- Enable Row Level Security (RLS) on all tables
-- This implicitly denies all access to 'anon' and 'authenticated' roles
-- unless explicit policies are added.
-- The 'service_role' (used by our Next.js API) always bypasses RLS.

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
