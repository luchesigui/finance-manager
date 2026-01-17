-- Add transaction type column to support both expenses and income
-- Transaction types:
-- 'expense' - Regular expense (default, backward compatible)
-- 'income' - Income transaction (can be positive for increment or negative for decrement)

-- Step 1: Create the transaction_type enum
DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('expense', 'income');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add the type column with default 'expense' for backward compatibility
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS type transaction_type NOT NULL DEFAULT 'expense';

-- Step 3: Add is_increment column for income transactions
-- true = income increment (e.g., salary received)
-- false = income decrement (e.g., salary deduction, bonus reversal)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS is_increment boolean DEFAULT true;

-- Step 4: Create an index on the type column for faster filtering
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- Step 5: Add comment for documentation
COMMENT ON COLUMN public.transactions.type IS 'Transaction type: expense (regular expense) or income (income entry)';
COMMENT ON COLUMN public.transactions.is_increment IS 'For income transactions: true = income added, false = income deducted';
