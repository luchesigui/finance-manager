-- Add default_payer_id column to households table
alter table public.households
  add column if not exists default_payer_id uuid references public.people(id) on delete set null;

-- Add UPDATE policy for households so members can update default_payer_id
-- This is needed because RLS was blocking updates to the households table
-- Drop the policy if it exists first to make this migration idempotent
drop policy if exists "Users can update households they belong to" on public.households;

create policy "Users can update households they belong to" on public.households
  for update using (
    exists (
      select 1 from public.household_members
      where household_id = public.households.id
      and user_id = auth.uid()
    )
  );

-- Update handle_new_user function to set default payer to owner's person
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_household_id uuid;
  existing_person_id uuid;
  existing_household_id uuid;
  owner_person_id uuid;
begin
  -- Create a profile
  insert into public.profiles (id, email)
  values (new.id, new.email);

  -- Check if there's a pending invitation (person with this email but no linked_user_id)
  select id, household_id into existing_person_id, existing_household_id
  from public.people
  where email = new.email
  and linked_user_id is null
  limit 1;

  if existing_person_id is not null then
    -- Link the person to the new user
    update public.people
    set linked_user_id = new.id
    where id = existing_person_id;

    -- Add user to the existing household
    insert into public.household_members (household_id, user_id, role)
    values (existing_household_id, new.id, 'member')
    on conflict (household_id, user_id) do nothing;

    -- Set default payer to the owner's person in the existing household
    select p.id into owner_person_id
    from public.people p
    inner join public.household_members hm on p.household_id = hm.household_id
    where hm.household_id = existing_household_id
    and hm.role = 'owner'
    and p.linked_user_id = hm.user_id
    limit 1;

    -- Update default payer if we found the owner's person
    if owner_person_id is not null then
      update public.households
      set default_payer_id = owner_person_id
      where id = existing_household_id
      and default_payer_id is null;
    end if;
  end if;

  -- Still create a default household for the user (they can have multiple households)
  insert into public.households (name)
  values ('Família ' || split_part(new.email, '@', 1))
  returning id into new_household_id;

  -- Add user to their default household as owner
  insert into public.household_members (household_id, user_id, role)
  values (new_household_id, new.id, 'owner')
  on conflict (household_id, user_id) do nothing;

  -- Only create default person if we didn't link to an existing one
  if existing_person_id is null then
    insert into public.people (name, income, color, household_id, linked_user_id)
    values (
      split_part(new.email, '@', 1),
      0,
      'bg-blue-500',
      new_household_id,
      new.id
    )
    returning id into owner_person_id;

    -- Set default payer to the owner's person
    update public.households
    set default_payer_id = owner_person_id
    where id = new_household_id;
  end if;

  -- Create default categories for the new household (only if categories don't exist)
  INSERT INTO public.categories (name, target_percent, color, household_id)
  SELECT * FROM (VALUES
    ('Liberdade Financeira', 30, 'text-purple-600'),
    ('Custos Fixos', 25, 'text-blue-600'),
    ('Conforto', 15, 'text-pink-600'),
    ('Metas', 15, 'text-purple-700'),
    ('Prazeres', 10, 'text-orange-600'),
    ('Conhecimento', 5, 'text-yellow-600')
  ) AS v(name, target_percent, color)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.categories
    WHERE household_id = new_household_id
  );

  return new;
end;
$$ language plpgsql security definer;

-- Set default payer for existing households that don't have one
-- This sets it to the owner's person
update public.households h
set default_payer_id = (
  select p.id
  from public.people p
  inner join public.household_members hm on p.household_id = hm.household_id
  where hm.household_id = h.id
  and hm.role = 'owner'
  and p.linked_user_id = hm.user_id
  limit 1
)
where default_payer_id is null;
