-- Add email column to people table for invitations
alter table public.people
  add column if not exists email text;
