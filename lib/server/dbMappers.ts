import type {
  BulkTransactionPatch,
  Category,
  CategoryPatch,
  CategoryRow,
  Person,
  PersonPatch,
  PersonRow,
  RecurringTemplate,
  RecurringTemplatePatch,
  RecurringTemplateRow,
  SavedSimulation,
  SimulationRow,
  Transaction,
  TransactionPatch,
  TransactionRow,
} from "@/lib/types";

// ============================================================================
// Database Row Mappers (snake_case -> camelCase)
// ============================================================================

export function mapPersonRow(row: PersonRow): Person {
  const incomeTemplateId =
    row.income_template_id === null || row.income_template_id === undefined
      ? null
      : Number(row.income_template_id);

  return {
    id: row.id,
    name: row.name,
    income: Number(row.income),
    householdId: row.household_id ?? undefined,
    linkedUserId: row.linked_user_id ?? undefined,
    incomeTemplateId,
  };
}

export function mapCategoryRow(row: CategoryRow): Category {
  const categories = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  return {
    id: row.id,
    name: categories?.name ?? "",
    targetPercent: Number(row.target_percent),
    householdId: row.household_id ?? undefined,
  };
}

export function mapTransactionRow(row: TransactionRow): Transaction {
  const recurringTemplateId =
    row.recurring_template_id === null || row.recurring_template_id === undefined
      ? null
      : Number(row.recurring_template_id);

  return {
    id: Number(row.id),
    description: row.description,
    amount: Number(row.amount),
    categoryId: row.category_id,
    paidBy: row.paid_by,
    recurringTemplateId,
    isCreditCard: row.is_credit_card ?? false,
    isNextBilling: row.is_next_billing ?? false,
    excludeFromSplit: row.exclude_from_split ?? false,
    isForecast: row.is_forecast ?? false,
    date: row.date,
    createdAt: row.created_at,
    householdId: row.household_id,
    type: row.type ?? "expense",
    isIncrement: row.is_increment ?? true,
  };
}

export function mapRecurringTemplateRow(row: RecurringTemplateRow): RecurringTemplate {
  return {
    id: Number(row.id),
    description: row.description,
    amount: Number(row.amount),
    categoryId: row.category_id,
    paidBy: row.paid_by,
    type: row.type ?? "expense",
    isIncrement: row.is_increment ?? true,
    isCreditCard: row.is_credit_card ?? false,
    isNextBilling: row.is_next_billing ?? false,
    excludeFromSplit: row.exclude_from_split ?? false,
    dayOfMonth: Number(row.day_of_month),
    isActive: row.is_active ?? true,
    householdId: row.household_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSimulationRow(row: SimulationRow): SavedSimulation {
  return {
    id: row.id,
    name: row.name,
    state: row.state as SavedSimulation["state"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    householdId: row.household_id,
  };
}

// ============================================================================
// Patch Mappers (camelCase -> snake_case for DB updates)
// ============================================================================

export function toPersonDbPatch(patch: PersonPatch): Record<string, unknown> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.income !== undefined) dbPatch.income = patch.income;
  return dbPatch;
}

export function toCategoryDbPatch(patch: CategoryPatch): Record<string, unknown> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.targetPercent !== undefined) dbPatch.target_percent = patch.targetPercent;
  return dbPatch;
}

export function toTransactionDbPatch(patch: TransactionPatch): Record<string, unknown> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.amount !== undefined) dbPatch.amount = patch.amount;
  if (patch.categoryId !== undefined) dbPatch.category_id = patch.categoryId;
  if (patch.paidBy !== undefined) dbPatch.paid_by = patch.paidBy;
  if (patch.isCreditCard !== undefined) dbPatch.is_credit_card = patch.isCreditCard;
  if (patch.isNextBilling !== undefined) dbPatch.is_next_billing = patch.isNextBilling;
  if (patch.excludeFromSplit !== undefined) dbPatch.exclude_from_split = patch.excludeFromSplit;
  if (patch.isForecast !== undefined) dbPatch.is_forecast = patch.isForecast;
  if (patch.date !== undefined) dbPatch.date = patch.date;
  if (patch.type !== undefined) dbPatch.type = patch.type;
  if (patch.isIncrement !== undefined) dbPatch.is_increment = patch.isIncrement;
  return dbPatch;
}

export function toBulkTransactionDbPatch(patch: BulkTransactionPatch): Record<string, unknown> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.categoryId !== undefined) dbPatch.category_id = patch.categoryId;
  if (patch.paidBy !== undefined) dbPatch.paid_by = patch.paidBy;
  if (patch.isCreditCard !== undefined) dbPatch.is_credit_card = patch.isCreditCard;
  if (patch.isNextBilling !== undefined) dbPatch.is_next_billing = patch.isNextBilling;
  if (patch.excludeFromSplit !== undefined) dbPatch.exclude_from_split = patch.excludeFromSplit;
  if (patch.isForecast !== undefined) dbPatch.is_forecast = patch.isForecast;
  if (patch.type !== undefined) dbPatch.type = patch.type;
  if (patch.isIncrement !== undefined) dbPatch.is_increment = patch.isIncrement;
  return dbPatch;
}

export function toRecurringTemplateDbPatch(patch: RecurringTemplatePatch): Record<string, unknown> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.amount !== undefined) dbPatch.amount = patch.amount;
  if (patch.categoryId !== undefined) dbPatch.category_id = patch.categoryId;
  if (patch.paidBy !== undefined) dbPatch.paid_by = patch.paidBy;
  if (patch.type !== undefined) dbPatch.type = patch.type;
  if (patch.isIncrement !== undefined) dbPatch.is_increment = patch.isIncrement;
  if (patch.isCreditCard !== undefined) dbPatch.is_credit_card = patch.isCreditCard;
  if (patch.isNextBilling !== undefined) dbPatch.is_next_billing = patch.isNextBilling;
  if (patch.excludeFromSplit !== undefined) dbPatch.exclude_from_split = patch.excludeFromSplit;
  if (patch.dayOfMonth !== undefined) dbPatch.day_of_month = patch.dayOfMonth;
  if (patch.isActive !== undefined) dbPatch.is_active = patch.isActive;
  if (Object.keys(dbPatch).length > 0) {
    dbPatch.updated_at = new Date().toISOString();
  }
  return dbPatch;
}
