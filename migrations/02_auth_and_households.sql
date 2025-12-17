-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create Households table
create table if not exists public.households (
  id uuid default gen_random_uuid() primary key,
  name text default 'My Household',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on households
alter table public.households enable row level security;

-- Create Profiles table (links to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create Household Members table
create table if not exists public.household_members (
  household_id uuid references public.households(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member', -- 'owner', 'member'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (household_id, user_id)
);

-- Enable RLS on household_members
alter table public.household_members enable row level security;

-- Update existing tables to add household_id
-- We add columns as nullable first, then we can enforce not null after data migration if needed
-- But for new app usage, we will enforce it via RLS.

alter table public.people
  add column if not exists household_id uuid references public.households(id) on delete cascade,
  add column if not exists linked_user_id uuid references public.profiles(id) on delete set null;

alter table public.categories
  add column if not exists household_id uuid references public.households(id) on delete cascade;

alter table public.transactions
  add column if not exists household_id uuid references public.households(id) on delete cascade;

-- RLS Policies

-- Profiles: Users can view/update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Households: Users can view households they are members of
create policy "Users can view households they belong to" on public.households
  for select using (
    exists (
      select 1 from public.household_members
      where household_id = public.households.id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert households" on public.households
  for insert with check (true); -- Logic to add member on insert needed via trigger or app logic

-- Household Members: Users can view members of their households
create policy "Users can view members of their households" on public.household_members
  for select using (
    exists (
      select 1 from public.household_members as hm
      where hm.household_id = public.household_members.household_id
      and hm.user_id = auth.uid()
    )
  );

-- People: Users can view people in their households
create policy "Users can view people in their households" on public.people
  for select using (
    exists (
      select 1 from public.household_members
      where household_id = public.people.household_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert people in their households" on public.people
  for insert with check (
    exists (
      select 1 from public.household_members
      where household_id = household_id
      and user_id = auth.uid()
    )
  );

create policy "Users can update people in their households" on public.people
  for update using (
    exists (
      select 1 from public.household_members
      where household_id = public.people.household_id
      and user_id = auth.uid()
    )
  );

create policy "Users can delete people in their households" on public.people
  for delete using (
    exists (
      select 1 from public.household_members
      where household_id = public.people.household_id
      and user_id = auth.uid()
    )
  );

-- Categories: Users can view/edit categories in their households
create policy "Users can view categories in their households" on public.categories
  for select using (
    exists (
      select 1 from public.household_members
      where household_id = public.categories.household_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert categories in their households" on public.categories
  for insert with check (
    exists (
      select 1 from public.household_members
      where household_id = household_id
      and user_id = auth.uid()
    )
  );

create policy "Users can update categories in their households" on public.categories
  for update using (
    exists (
      select 1 from public.household_members
      where household_id = public.categories.household_id
      and user_id = auth.uid()
    )
  );

-- Transactions: Users can view/edit transactions in their households
create policy "Users can view transactions in their households" on public.transactions
  for select using (
    exists (
      select 1 from public.household_members
      where household_id = public.transactions.household_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert transactions in their households" on public.transactions
  for insert with check (
    exists (
      select 1 from public.household_members
      where household_id = household_id
      and user_id = auth.uid()
    )
  );

create policy "Users can update transactions in their households" on public.transactions
  for update using (
    exists (
      select 1 from public.household_members
      where household_id = public.transactions.household_id
      and user_id = auth.uid()
    )
  );

create policy "Users can delete transactions in their households" on public.transactions
  for delete using (
    exists (
      select 1 from public.household_members
      where household_id = public.transactions.household_id
      and user_id = auth.uid()
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_household_id uuid;
begin
  -- Create a profile
  insert into public.profiles (id, email)
  values (new.id, new.email);

  -- Create a default household
  insert into public.households (name)
  values ('Família ' || split_part(new.email, '@', 1))
  returning id into new_household_id;

  -- Add user to household
  insert into public.household_members (household_id, user_id, role)
  values (new_household_id, new.id, 'owner');

  -- Create default person for the user
  insert into public.people (name, income, color, household_id, linked_user_id)
  values (
    split_part(new.email, '@', 1),
    0,
    'bg-blue-500',
    new_household_id,
    new.id
  );

  -- Create default categories
  INSERT INTO public.categories (name, target_percent, color, household_id) VALUES
  ('Custos Fixos', 50, 'text-red-600', new_household_id),
  ('Conforto', 30, 'text-purple-600', new_household_id),
  ('Metas', 20, 'text-green-600', new_household_id);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user on auth.users insert
-- Note: In some Supabase setups, you need to be careful with permissions on auth.users triggers.
-- Assuming standard setup:
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

