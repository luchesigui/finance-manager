export type Person = {
  id: string;
  name: string;
  income: number;
  householdId?: string;
  linkedUserId?: string;
};

export type Category = {
  id: string;
  name: string;
  targetPercent: number;
  householdId?: string;
};

export type TransactionType = "expense" | "income";

export type Transaction = {
  id: number;
  description: string;
  amount: number;
  /**
   * Category ID. Required for expenses, optional (null) for income transactions.
   */
  categoryId: string | null;
  paidBy: string;
  isRecurring: boolean;
  /**
   * If true, this expense is accounted for in the next month (credit card billing cycle),
   * while keeping `date` as the original purchase/expense date.
   */
  isCreditCard: boolean;
  /** If true, this transaction should not be considered in the fair split calculation. */
  excludeFromSplit: boolean;
  /** YYYY-MM-DD */
  date: string;
  /** ISO timestamp (from DB `created_at`). Optional for backwards compatibility. */
  createdAt?: string;
  householdId?: string;
  /**
   * Transaction type: 'expense' for regular expenses, 'income' for income entries.
   * Defaults to 'expense' for backward compatibility.
   */
  type: TransactionType;
  /**
   * For income transactions: true = income added (increment), false = income deducted (decrement).
   * Only applicable when type is 'income'.
   */
  isIncrement: boolean;
};

export type NewTransactionFormState = {
  description: string;
  amount: number | null;
  categoryId: string;
  paidBy: string;
  isRecurring: boolean;
  /**
   * If true, this expense should be accounted for in the next month (credit card billing cycle).
   */
  isCreditCard: boolean;
  /** YYYY-MM-DD */
  date: string;
  isInstallment: boolean;
  installments: number;
  excludeFromSplit: boolean;
  /**
   * Transaction type: 'expense' for regular expenses, 'income' for income entries.
   */
  type: TransactionType;
  /**
   * For income transactions: true = income added (increment), false = income deducted (decrement).
   */
  isIncrement: boolean;
};
