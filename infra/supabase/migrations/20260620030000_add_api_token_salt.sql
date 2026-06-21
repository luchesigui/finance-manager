-- Add api_token_salt to profiles to support token regeneration and invalidation
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS api_token_salt uuid DEFAULT gen_random_uuid() NOT NULL;
