// ============================================================================
// Core Entity Types
// ============================================================================

export type Person = {
  readonly id: string;
  name: string;
  income: number;
  householdId?: string;
  linkedUserId?: string;
  incomeTemplateId?: number | null;
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
  recurringTemplateId: number | null;
  /** Marks this as a credit card transaction. */
  isCreditCard: boolean;
  /** If true, transaction is accounted for in the next month (next billing cycle). */
  isNextBilling: boolean;
  /** If true, transaction should not be considered in fair split calculation. */
  excludeFromSplit: boolean;
  /** If true, transaction is a forecast entry. */
  isForecast: boolean;
  /** YYYY-MM-DD format */
  date: string;
  dayOfMonth?: number;
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
    | "isCreditCard"
    | "isNextBilling"
    | "excludeFromSplit"
    | "isForecast"
    | "date"
    | "type"
    | "isIncrement"
  >
> & {
  /** Client sends to turn recurring on/off; API sets recurringTemplateId when creating/unlinking template */
  isRecurring?: boolean;
  /** Set only by API when creating template or unlinking */
  recurringTemplateId?: number | null;
};

/** Fields that can be updated in bulk operations (excludes description, amount, date) */
export type BulkTransactionPatch = Partial<
  Pick<
    Transaction,
    | "categoryId"
    | "paidBy"
    | "isCreditCard"
    | "isNextBilling"
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
  dayOfMonth: number;
  /** Marks this as a credit card transaction. */
  isCreditCard: boolean;
  /** If true, transaction is accounted for in the next month (next billing cycle). */
  isNextBilling: boolean;
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
  income_template_id?: number | string | null;
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
  recurring_template_id?: number | string | null;
  is_credit_card?: boolean;
  is_next_billing?: boolean;
  exclude_from_split?: boolean;
  is_forecast?: boolean;
  date: string;
  created_at?: string;
  household_id?: string;
  type?: TransactionType;
  is_increment?: boolean;
};

export type RecurringTemplate = {
  readonly id: number;
  description: string;
  amount: number;
  categoryId: string | null;
  paidBy: string;
  type: TransactionType;
  isIncrement: boolean;
  isCreditCard: boolean;
  isNextBilling: boolean;
  excludeFromSplit: boolean;
  dayOfMonth: number;
  isActive: boolean;
  householdId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type RecurringTemplatePatch = Partial<
  Pick<
    RecurringTemplate,
    | "description"
    | "amount"
    | "categoryId"
    | "paidBy"
    | "type"
    | "isIncrement"
    | "isCreditCard"
    | "isNextBilling"
    | "excludeFromSplit"
    | "dayOfMonth"
    | "isActive"
  >
>;

export type RecurringTemplateRow = {
  id: number | string;
  household_id: string | null;
  description: string;
  amount: number | string;
  category_id: string | null;
  paid_by: string;
  type?: TransactionType;
  is_increment?: boolean;
  is_credit_card?: boolean;
  is_next_billing?: boolean;
  exclude_from_split?: boolean;
  day_of_month: number | string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

// ============================================================================
// API Response Types
// ============================================================================

export type ApiSuccessResponse = { success: boolean };
export type ApiErrorResponse = { error: string };

export type DefaultPayerResponse = { defaultPayerId: string | null };
export type CurrentUserResponse = { userId: string };
export type EmergencyFundResponse = { emergencyFund: number };

// ============================================================================
// Simulation Types
// ============================================================================

export type SavedSimulation = {
  readonly id: string;
  name: string;
  state: import("@/features/simulation/types").SimulationState;
  createdAt: string;
  updatedAt: string;
  householdId: string;
};

export type SimulationRow = {
  id: string;
  household_id: string;
  name: string;
  state: unknown;
  created_at: string;
  updated_at: string;
};

// ============================================================================
// Outlier Detection Types
// ============================================================================

export type CategoryStatistics = {
  readonly categoryId: string;
  mean: number;
  standardDeviation: number;
  transactionCount: number;
};
