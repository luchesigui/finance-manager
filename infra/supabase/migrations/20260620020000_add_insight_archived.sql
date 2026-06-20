-- Alter public.ai_insights to add is_archived
ALTER TABLE public.ai_insights
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;
