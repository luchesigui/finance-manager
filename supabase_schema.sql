-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create people table
create table public.people (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  income numeric not null,
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create categories table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  target_percent numeric not null,
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table public.transactions (
  id bigint generated always as identity primary key,
  description text not null,
  amount numeric not null,
  category_id uuid references public.categories(id) on delete restrict,
  paid_by uuid references public.people(id) on delete restrict,
  is_recurring boolean default false,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Initial Data Seeding
-- We use DO block to declare variables for IDs
DO $$
DECLARE
  p_gui uuid := 'd0b3b4a0-0001-0000-0000-000000000001';
  p_amanda uuid := 'd0b3b4a0-0002-0000-0000-000000000002';
  
  c_fixed uuid := 'c0b3b4a0-0001-0000-0000-000000000001';
  c_comfort uuid := 'c0b3b4a0-0002-0000-0000-000000000002';
  c_goals uuid := 'c0b3b4a0-0003-0000-0000-000000000003';
  c_pleasure uuid := 'c0b3b4a0-0004-0000-0000-000000000004';
  c_financial uuid := 'c0b3b4a0-0005-0000-0000-000000000005';
  c_knowledge uuid := 'c0b3b4a0-0006-0000-0000-000000000006';
  
  today date := CURRENT_DATE;
  current_year int := extract(year from today);
  current_month int := extract(month from today);
BEGIN
  -- Insert People
  INSERT INTO public.people (id, name, income, color) VALUES
  (p_gui, 'Gui', 40000, 'bg-blue-500'),
  (p_amanda, 'Amanda', 12000, 'bg-pink-500')
  ON CONFLICT (id) DO NOTHING;

  -- Insert Categories
  INSERT INTO public.categories (id, name, target_percent, color) VALUES
  (c_fixed, 'Custos Fixos', 25, 'text-red-600'),
  (c_comfort, 'Conforto', 15, 'text-purple-600'),
  (c_goals, 'Metas', 15, 'text-green-600'),
  (c_pleasure, 'Prazeres', 10, 'text-yellow-600'),
  (c_financial, 'Liberdade Financeira', 30, 'text-indigo-600'),
  (c_knowledge, 'Conhecimento', 5, 'text-cyan-600')
  ON CONFLICT (id) DO NOTHING;

  -- Insert Transactions (Dynamic dates based on current date)
  -- Note: We can't easily do "new Date(year, month, 1)" logic in SQL as simply as JS, 
  -- but we can use make_date or string concatenation.
  
  -- Aluguel (1st of month)
  INSERT INTO public.transactions (description, amount, category_id, paid_by, is_recurring, date)
  VALUES ('Aluguel', 4100, c_fixed, p_gui, true, make_date(current_year, current_month, 1));
  
  -- Condomínio (5th of month)
  INSERT INTO public.transactions (description, amount, category_id, paid_by, is_recurring, date)
  VALUES ('Condomínio', 1025, c_fixed, p_gui, true, make_date(current_year, current_month, 5));
  
  -- Terapia Amanda (10th of month)
  INSERT INTO public.transactions (description, amount, category_id, paid_by, is_recurring, date)
  VALUES ('Terapia Amanda', 1200, c_fixed, p_amanda, true, make_date(current_year, current_month, 10));

  -- Escola da Chiara (15th of month)
  INSERT INTO public.transactions (description, amount, category_id, paid_by, is_recurring, date)
  VALUES ('Escola da Chiara', 500, c_comfort, p_gui, true, make_date(current_year, current_month, 15));
  
  -- Mercado Mensal (10th of previous month)
  -- Handle month rollover for previous month
  INSERT INTO public.transactions (description, amount, category_id, paid_by, is_recurring, date)
  VALUES ('Mercado Mensal', 800, c_fixed, p_gui, false, make_date(current_year, current_month, 10) - interval '1 month');

END $$;
