ALTER TABLE public.recurring_templates
  ADD COLUMN transfer_to_person_id uuid REFERENCES public.people(id) ON DELETE RESTRICT;
