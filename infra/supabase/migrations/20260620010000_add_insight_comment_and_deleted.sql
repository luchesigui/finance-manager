-- Alter ai_insights table to add comment and is_deleted
ALTER TABLE public.ai_insights
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Add UPDATE policy for public.ai_insights to allow users to comment and soft-delete/dismiss insights
CREATE POLICY "Users can update insights for analyses in their household" ON public.ai_insights
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.ai_analyses
      JOIN public.household_members ON household_members.household_id = ai_analyses.household_id
      WHERE ai_insights.analysis_id = ai_analyses.id
      AND household_members.user_id = auth.uid()
    )
  );
