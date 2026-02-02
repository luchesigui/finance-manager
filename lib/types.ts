// ============================================================================
// Core Entity Types
// ============================================================================

export type Person = {
  readonly id: string;
  name: string;
  income: number;
  householdId?: string;
  linkedUserId?: string;
};

export type Category = {
  readonly id: string;
  name: string;
  targetPercent: number;
  householdId?: string;
};

export type TransactionType = "expense" | "income";

export type Transaction = {
  readonly id: number;
  description: string;
  amount: number;
  /** Category ID. Required for expenses, null for income transactions. */
  categoryId: string | null;
  paidBy: string;
  isRecurring: boolean;
  /** If true, expense is accounted for in the next month (credit card billing cycle). */
  isCreditCard: boolean;
  /** If true, transaction should not be considered in fair split calculation. */
  excludeFromSplit: boolean;
  /** If true, transaction is a forecast entry. */
  isForecast: boolean;
  /** YYYY-MM-DD format */
  date: string;
  /** ISO timestamp from DB. Optional for backwards compatibility. */
  createdAt?: string;
  householdId?: string;
  /** Transaction type: 'expense' or 'income'. Defaults to 'expense'. */
  type: TransactionType;
  /** For income: true = added, false = deducted. Only applicable when type is 'income'. */
  isIncrement: boolean;
};

// ============================================================================
// Patch Types (for API operations)
// ============================================================================

/** Fields that can be updated on a single transaction */
export type TransactionPatch = Partial<
  Pick<
    Transaction,
    | "description"
    | "amount"
    | "categoryId"
    | "paidBy"
    | "isRecurring"
    | "isCreditCard"
    | "excludeFromSplit"
    | "isForecast"
    | "date"
    | "type"
    | "isIncrement"
  >
>;

/** Fields that can be updated in bulk operations (excludes description, amount, date) */
export type BulkTransactionPatch = Partial<
  Pick<
    Transaction,
    | "categoryId"
    | "paidBy"
    | "isRecurring"
    | "isCreditCard"
    | "excludeFromSplit"
    | "isForecast"
    | "type"
    | "isIncrement"
  >
>;

/** Fields that can be updated on a person */
export type PersonPatch = Partial<Pick<Person, "name" | "income">>;

/** Fields that can be updated on a category */
export type CategoryPatch = Partial<Pick<Category, "name" | "targetPercent">>;

// ============================================================================
// Form State Types
// ============================================================================

export type DateSelectionMode = "month" | "specific";

export type NewTransactionFormState = {
  description: string;
  amount: number | null;
  categoryId: string;
  paidBy: string;
  isRecurring: boolean;
  /** If true, expense is accounted for in the next month (credit card billing). */
  isCreditCard: boolean;
  /** 'month': date set to 1st of selected month, 'specific': user picks exact date */
  dateSelectionMode: DateSelectionMode;
  /** Selected month in YYYY-MM format (used when dateSelectionMode is 'month') */
  selectedMonth: string;
  /** YYYY-MM-DD format */
  date: string;
  isInstallment: boolean;
  installments: number;
  excludeFromSplit: boolean;
  isForecast: boolean;
  type: TransactionType;
  isIncrement: boolean;
};

// ============================================================================
// Database Row Types (for type-safe DB mapping)
// ============================================================================

/** Raw database row shape for persons table */
export type PersonRow = {
  id: string;
  name: string;
  income: number | string;
  household_id: string | null;
  linked_user_id: string | null;
};

/** Raw database row shape for household_categories join */
export type CategoryRow = {
  id: string; // PK of household_categories
  category_id: string;
  target_percent: number | string;
  household_id: string | null;
  categories: { name: string } | { name: string }[];
};

/** Raw database row shape for transactions table */
export type TransactionRow = {
  id: number | string;
  description: string;
  amount: number | string;
  category_id: string | null;
  paid_by: string;
  is_recurring: boolean;
  is_credit_card?: boolean;
  exclude_from_split?: boolean;
  is_forecast?: boolean;
  date: string;
  created_at?: string;
  household_id?: string;
  type?: TransactionType;
  is_increment?: boolean;
};

// ============================================================================
// API Response Types
// ============================================================================

export type ApiSuccessResponse = { success: boolean };
export type ApiErrorResponse = { error: string };

export type DefaultPayerResponse = { defaultPayerId: string | null };
export type CurrentUserResponse = { userId: string };

// ============================================================================
// Outlier Detection Types
// ============================================================================

export type CategoryStatistics = {
  readonly categoryId: string;
  mean: number;
  standardDeviation: number;
  transactionCount: number;
};
