-- Revert handle_new_user function to original version (without email invitation logic)
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

-- Optionally remove the email column (uncomment if you want to completely remove it)
-- Note: This will permanently delete any email data that might exist
-- alter table public.people drop column if exists email;
