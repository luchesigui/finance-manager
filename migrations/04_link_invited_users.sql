-- Update handle_new_user function to check for pending invitations
-- If a person with the new user's email exists (and no linked_user_id), link them
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_household_id uuid;
  existing_person_id uuid;
  existing_household_id uuid;
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
    );
  end if;

  -- Create default categories for the new household (only if categories don't exist)
  INSERT INTO public.categories (name, target_percent, color, household_id)
  SELECT * FROM (VALUES
    ('Custos Fixos', 50, 'text-red-600'),
    ('Conforto', 30, 'text-purple-600'),
    ('Metas', 20, 'text-green-600')
  ) AS v(name, target_percent, color)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.categories WHERE household_id = new_household_id
  );

  return new;
end;
$$ language plpgsql security definer;
