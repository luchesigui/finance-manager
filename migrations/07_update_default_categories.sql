-- Update default categories for new user signups
-- This replaces the default categories with the new set
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

  -- Create default categories with new percentages and additional categories
  INSERT INTO public.categories (name, target_percent, color, household_id) VALUES
  ('Liberdade Financeira', 30, 'text-purple-600', new_household_id),
  ('Custos Fixos', 25, 'text-blue-600', new_household_id),
  ('Conforto', 15, 'text-pink-600', new_household_id),
  ('Metas', 15, 'text-purple-700', new_household_id),
  ('Prazeres', 10, 'text-orange-600', new_household_id),
  ('Conhecimento', 5, 'text-yellow-600', new_household_id);

  return new;
end;
$$ language plpgsql security definer;
