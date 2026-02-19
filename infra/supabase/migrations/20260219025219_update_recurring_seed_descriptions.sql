-- Update seed data from 20260208005000_seed_recurring_for_migration_test:
-- "Testing" -> "Streaming mensal", "test 2" -> "Academia".
-- Safe to run multiple times (idempotent).

UPDATE public.transactions
SET description = 'Streaming mensal'
WHERE description = 'Testing';

UPDATE public.transactions
SET description = 'Academia'
WHERE description = 'test 2';
