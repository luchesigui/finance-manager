-- Improve handle_new_user function with better error handling
-- This will help identify and handle errors during user signup

create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_household_id uuid;
  existing_person_id uuid;
  existing_household_id uuid;
  owner_person_id uuid;
  error_message text;
begin
  -- Create a profile
  begin
    insert into public.profiles (id, email)
    values (new.id, new.email);
  exception
    when others then
      error_message := 'Failed to create profile: ' || SQLERRM;
      raise exception '%', error_message;
  end;

  -- Check if there's a pending invitation (person with this email but no linked_user_id)
  begin
    select id, household_id into existing_person_id, existing_household_id
    from public.people
    where email = new.email
    and linked_user_id is null
    limit 1;
  exception
    when others then
      -- Log but don't fail - this is optional logic
      raise warning 'Error checking for existing person: %', SQLERRM;
  end;

  if existing_person_id is not null then
    begin
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
    exception
      when others then
        raise warning 'Error linking existing person: %', SQLERRM;
        -- Continue with creating new household even if linking fails
    end;
  end if;

  -- Still create a default household for the user (they can have multiple households)
  begin
    insert into public.households (name)
    values ('Família ' || split_part(new.email, '@', 1))
    returning id into new_household_id;
  exception
    when others then
      error_message := 'Failed to create household: ' || SQLERRM;
      raise exception '%', error_message;
  end;

  -- Add user to their default household as owner
  begin
    insert into public.household_members (household_id, user_id, role)
    values (new_household_id, new.id, 'owner')
    on conflict (household_id, user_id) do nothing;
  exception
    when others then
      error_message := 'Failed to add user to household: ' || SQLERRM;
      raise exception '%', error_message;
  end;

  -- Only create default person if we didn't link to an existing one
  if existing_person_id is null then
    begin
      insert into public.people (name, income, household_id, linked_user_id)
      values (
        split_part(new.email, '@', 1),
        0,
        new_household_id,
        new.id
      )
      returning id into owner_person_id;

      -- Set default payer to the owner's person
      if owner_person_id is not null then
        update public.households
        set default_payer_id = owner_person_id
        where id = new_household_id;
      end if;
    exception
      when others then
        error_message := 'Failed to create default person: ' || SQLERRM;
        raise exception '%', error_message;
    end;
  end if;

  -- Create default categories for the new household (only if categories don't exist)
  begin
    IF NOT EXISTS (
      SELECT 1 FROM public.categories
      WHERE household_id = new_household_id
    ) THEN
      INSERT INTO public.categories (name, target_percent, household_id)
      SELECT name, target_percent, new_household_id
      FROM (VALUES
        ('Liberdade Financeira', 30),
        ('Custos Fixos', 25),
        ('Conforto', 15),
        ('Metas', 15),
        ('Prazeres', 10),
        ('Conhecimento', 5)
      ) AS v(name, target_percent);
    END IF;
  exception
    when others then
      -- Log but don't fail - categories are not critical
      raise warning 'Error creating default categories: %', SQLERRM;
  end;

  return new;
exception
  when others then
    -- Log the full error details
    raise exception 'Database error saving new user: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
end;
$$ language plpgsql security definer;
