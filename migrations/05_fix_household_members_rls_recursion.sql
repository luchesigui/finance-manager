-- Create a security definer function to check household membership without RLS recursion
create or replace function public.is_household_member(check_household_id uuid, check_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from public.household_members
    where household_id = check_household_id
    and user_id = check_user_id
  );
end;
$$ language plpgsql security definer;

-- Drop and recreate the policy to use the function instead
drop policy if exists "Users can view members of their households" on public.household_members;

create policy "Users can view members of their households" on public.household_members
  for select using (
    public.is_household_member(household_id, auth.uid())
  );
