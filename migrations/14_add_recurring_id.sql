ALTER TABLE public.transactions ADD COLUMN recurring_id uuid;

CREATE INDEX idx_transactions_recurring_id ON public.transactions(recurring_id);
