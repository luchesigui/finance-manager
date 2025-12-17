-- Simplify schema by removing unused fields
-- 1. Remove household name (never used in application)
-- 2. Remove people email (invitation flow not needed)
-- 3. Simplify handle_new_user function (remove invitation logic)

-- Remove household name column
ALTER TABLE public.households
  DROP COLUMN IF EXISTS name;

-- Remove people email column
ALTER TABLE public.people
  DROP COLUMN IF EXISTS email;

-- Simplify handle_new_user function - remove invitation logic
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_household_id uuid;
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

  -- Create a default household for the user
  begin
    insert into public.households
    default values
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

  -- Create default person for the user
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
