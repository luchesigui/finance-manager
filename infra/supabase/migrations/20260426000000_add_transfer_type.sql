ALTER TYPE transaction_type ADD VALUE 'transfer';

ALTER TABLE public.transactions
  ADD COLUMN transfer_to_person_id uuid REFERENCES public.people(id) ON DELETE RESTRICT;
