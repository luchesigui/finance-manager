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

export type Transaction = {
  id: number;
  description: string;
  amount: number;
  categoryId: string;
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
  /**
   * Date selection mode:
   * - 'month': User selects a month, transaction date is set to the 1st of that month
   * - 'specific': User selects a specific date using the date picker
   */
  dateSelectionMode: "month" | "specific";
  /**
   * Selected month in YYYY-MM format (used when dateSelectionMode is 'month')
   */
  selectedMonth: string;
  /** YYYY-MM-DD */
  date: string;
  isInstallment: boolean;
  installments: number;
  excludeFromSplit: boolean;
};
