-- Create simulations table for storing saved simulation scenarios
create table if not exists public.simulations (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  name text not null,
  state jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.simulations enable row level security;

-- RLS Policies: scoped to household via household_members
create policy "Users can view simulations in their households" on public.simulations
  for select using (
    exists (
      select 1 from public.household_members
      where household_id = public.simulations.household_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert simulations in their households" on public.simulations
  for insert with check (
    exists (
      select 1 from public.household_members
      where household_id = public.simulations.household_id
      and user_id = auth.uid()
    )
  );

create policy "Users can update simulations in their households" on public.simulations
  for update using (
    exists (
      select 1 from public.household_members
      where household_id = public.simulations.household_id
      and user_id = auth.uid()
    )
  );

create policy "Users can delete simulations in their households" on public.simulations
  for delete using (
    exists (
      select 1 from public.household_members
      where household_id = public.simulations.household_id
      and user_id = auth.uid()
    )
  );
