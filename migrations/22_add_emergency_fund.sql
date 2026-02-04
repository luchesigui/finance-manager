-- Add emergency_fund column to households table
-- This stores the household's emergency reserve amount
alter table public.households
  add column if not exists emergency_fund numeric default 0;

-- Add comment for documentation
comment on column public.households.emergency_fund is 'The household emergency fund/reserve amount in BRL';
