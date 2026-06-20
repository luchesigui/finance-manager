-- Alter profiles table to add AI configurations
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS openrouter_api_key TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis_months INT DEFAULT 3 CONSTRAINT check_months CHECK (ai_analysis_months IN (3, 6, 12)),
ADD COLUMN IF NOT EXISTS ai_custom_context TEXT;

-- Create ai_analyses table
CREATE TABLE public.ai_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id uuid REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
  reference_month text NOT NULL, -- Format 'YYYY-MM'
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_household_month UNIQUE (household_id, reference_month)
);

-- Create ai_insights table
CREATE TABLE public.ai_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id uuid REFERENCES public.ai_analyses(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CONSTRAINT check_insight_type CHECK (type IN ('positive', 'negative', 'warning', 'info')),
  title text NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public.ai_analyses
CREATE POLICY "Users can view analyses in their household" ON public.ai_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = ai_analyses.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analyses in their household" ON public.ai_analyses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = ai_analyses.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update analyses in their household" ON public.ai_analyses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = ai_analyses.household_id
      AND household_members.user_id = auth.uid()
    )
  );

-- RLS Policies for public.ai_insights
CREATE POLICY "Users can view insights for analyses in their household" ON public.ai_insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ai_analyses
      JOIN public.household_members ON household_members.household_id = ai_analyses.household_id
      WHERE ai_insights.analysis_id = ai_analyses.id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert insights for analyses in their household" ON public.ai_insights
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_analyses
      JOIN public.household_members ON household_members.household_id = ai_analyses.household_id
      WHERE ai_insights.analysis_id = ai_analyses.id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete insights for analyses in their household" ON public.ai_insights
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.ai_analyses
      JOIN public.household_members ON household_members.household_id = ai_analyses.household_id
      WHERE ai_insights.analysis_id = ai_analyses.id
      AND household_members.user_id = auth.uid()
    )
  );
