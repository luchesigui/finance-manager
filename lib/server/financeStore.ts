import "server-only";

import { dayjs, getAccountingYearMonthUtc, parseDateStringUtc } from "@/lib/dateUtils";
import { createClient } from "@/lib/supabase/server";
import type {
  BulkTransactionPatch,
  Category,
  CategoryPatch,
  CategoryRow,
  CategoryStatistics,
  Person,
  PersonPatch,
  PersonRow,
  Transaction,
  TransactionPatch,
  TransactionRow,
} from "@/lib/types";

// ============================================================================
// Database Row Mappers (snake_case -> camelCase)
// ============================================================================

/**
 * Maps a person database row to the Person domain type.
 */
function mapPersonRow(row: PersonRow): Person {
  return {
    id: row.id,
    name: row.name,
    income: Number(row.income),
    householdId: row.household_id ?? undefined,
    linkedUserId: row.linked_user_id ?? undefined,
  };
}

/**
 * Maps a category database row to the Category domain type.
 * Handles both single object and array return from Supabase join.
 */
function mapCategoryRow(row: CategoryRow): Category {
  const categories = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  return {
    id: row.id, // Use PK, not FK
    name: categories?.name ?? "",
    targetPercent: Number(row.target_percent),
    householdId: row.household_id ?? undefined,
  };
}

/**
 * Maps a transaction database row to the Transaction domain type.
 */
function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    id: Number(row.id),
    description: row.description,
    amount: Number(row.amount),
    categoryId: row.category_id,
    paidBy: row.paid_by,
    isRecurring: row.is_recurring,
    isCreditCard: row.is_credit_card ?? false,
    excludeFromSplit: row.exclude_from_split ?? false,
    isForecast: row.is_forecast ?? false,
    date: row.date,
    createdAt: row.created_at,
    householdId: row.household_id,
    type: row.type ?? "expense",
    isIncrement: row.is_increment ?? true,
  };
}

// ============================================================================
// Patch Mappers (camelCase -> snake_case for DB updates)
// ============================================================================

/**
 * Converts a PersonPatch to database column format.
 */
function toPersonDbPatch(patch: PersonPatch): Record<string, unknown> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.income !== undefined) dbPatch.income = patch.income;
  return dbPatch;
}

/**
 * Converts a CategoryPatch to database column format.
 * Note: name updates are not supported in normalized schema (names are global).
 */
function toCategoryDbPatch(patch: CategoryPatch): Record<string, unknown> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.targetPercent !== undefined) dbPatch.target_percent = patch.targetPercent;
  return dbPatch;
}

/**
 * Converts a TransactionPatch to database column format.
 */
function toTransactionDbPatch(patch: TransactionPatch): Record<string, unknown> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.amount !== undefined) dbPatch.amount = patch.amount;
  if (patch.categoryId !== undefined) dbPatch.category_id = patch.categoryId;
  if (patch.paidBy !== undefined) dbPatch.paid_by = patch.paidBy;
  if (patch.isRecurring !== undefined) dbPatch.is_recurring = patch.isRecurring;
  if (patch.isCreditCard !== undefined) dbPatch.is_credit_card = patch.isCreditCard;
  if (patch.excludeFromSplit !== undefined) dbPatch.exclude_from_split = patch.excludeFromSplit;
  if (patch.isForecast !== undefined) dbPatch.is_forecast = patch.isForecast;
  if (patch.date !== undefined) dbPatch.date = patch.date;
  if (patch.type !== undefined) dbPatch.type = patch.type;
  if (patch.isIncrement !== undefined) dbPatch.is_increment = patch.isIncrement;
  return dbPatch;
}

/**
 * Converts a BulkTransactionPatch to database column format.
 */
function toBulkTransactionDbPatch(patch: BulkTransactionPatch): Record<string, unknown> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.categoryId !== undefined) dbPatch.category_id = patch.categoryId;
  if (patch.paidBy !== undefined) dbPatch.paid_by = patch.paidBy;
  if (patch.isRecurring !== undefined) dbPatch.is_recurring = patch.isRecurring;
  if (patch.isCreditCard !== undefined) dbPatch.is_credit_card = patch.isCreditCard;
  if (patch.excludeFromSplit !== undefined) dbPatch.exclude_from_split = patch.excludeFromSplit;
  if (patch.isForecast !== undefined) dbPatch.is_forecast = patch.isForecast;
  if (patch.type !== undefined) dbPatch.type = patch.type;
  if (patch.isIncrement !== undefined) dbPatch.is_increment = patch.isIncrement;
  return dbPatch;
}

// ============================================================================
// Authentication & Household Helpers
// ============================================================================

/**
 * Gets the primary household ID for the authenticated user.
 * @throws Error if not authenticated or no household found
 */
async function getPrimaryHouseholdId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error("No household found for user");
  }

  return data.household_id;
}

/**
 * Gets the current authenticated user's ID.
 * @throws Error if not authenticated
 */
export async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  return user.id;
}

// ============================================================================
// People CRUD Operations
// ============================================================================

export async function getPeople(): Promise<Person[]> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("household_id", householdId)
    .order("name");

  if (error) throw error;
  return (data as PersonRow[]).map(mapPersonRow);
}

export async function updatePerson(id: string, patch: PersonPatch): Promise<Person> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();
  const dbPatch = toPersonDbPatch(patch);

  const { data, error } = await supabase
    .from("people")
    .update(dbPatch)
    .eq("id", id)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) throw error;
  return mapPersonRow(data as PersonRow);
}

export async function createPerson(input: {
  name: string;
  income: number;
}): Promise<Person> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const dbRow = {
    name: input.name,
    income: input.income,
    household_id: householdId,
    linked_user_id: null,
  };

  const { data, error } = await supabase.from("people").insert(dbRow).select().single();

  if (error) throw error;
  return mapPersonRow(data as PersonRow);
}

export async function deletePerson(id: string): Promise<void> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  // Check if there are any transactions referencing this person
  const { data: transactions, error: checkError } = await supabase
    .from("transactions")
    .select("id")
    .eq("paid_by", id)
    .eq("household_id", householdId);

  if (checkError) throw checkError;

  // If there are transactions, reassign them to another person
  if (transactions && transactions.length > 0) {
    const replacementPersonId = await findReplacementPerson(id, householdId, supabase);

    if (!replacementPersonId) {
      const error = new Error(
        "Cannot delete person because they have transactions and there are no other people to reassign them to.",
      ) as Error & { code: string };
      error.code = "NO_REPLACEMENT_PERSON";
      throw error;
    }

    // Reassign all transactions to the replacement person
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ paid_by: replacementPersonId })
      .eq("paid_by", id);

    if (updateError) throw updateError;
  }

  // Now delete the person
  const { error } = await supabase
    .from("people")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);
  if (error) throw error;
}

/**
 * Finds a replacement person for transaction reassignment.
 * Prefers the default payer, falls back to first available person.
 */
async function findReplacementPerson(
  excludeId: string,
  householdId: string,
  // biome-ignore lint/suspicious/noExplicitAny: Supabase client type
  supabase: any,
): Promise<string | null> {
  // Try to get the default payer
  const defaultPayerId = await getDefaultPayerId();

  if (defaultPayerId && defaultPayerId !== excludeId) {
    const { data: defaultPayer } = await supabase
      .from("people")
      .select("id")
      .eq("id", defaultPayerId)
      .eq("household_id", householdId)
      .single();

    if (defaultPayer) {
      return defaultPayerId;
    }
  }

  // Get the first other person in the household
  const { data: otherPeople, error: peopleError } = await supabase
    .from("people")
    .select("id")
    .eq("household_id", householdId)
    .neq("id", excludeId)
    .limit(1);

  if (peopleError) throw peopleError;

  return otherPeople?.[0]?.id ?? null;
}

// ============================================================================
// Categories CRUD Operations
// ============================================================================

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data, error } = await supabase
    .from("household_categories")
    .select(
      `
      id,
      category_id,
      target_percent,
      household_id,
      categories (
        name
      )
    `,
    )
    .eq("household_id", householdId)
    .order("categories(name)");

  if (error) throw error;
  return (data as CategoryRow[]).map(mapCategoryRow);
}

export async function updateCategory(id: string, patch: CategoryPatch): Promise<Category> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();
  const dbPatch = toCategoryDbPatch(patch);

  const { data, error } = await supabase
    .from("household_categories")
    .update(dbPatch)
    .eq("id", id) // Use PK, not FK
    .eq("household_id", householdId)
    .select(
      `
      id,
      category_id,
      target_percent,
      household_id,
      categories (
        name
      )
    `,
    )
    .single();

  if (error) throw error;
  return mapCategoryRow(data as CategoryRow);
}

// ============================================================================
// Transactions CRUD Operations
// ============================================================================

export async function getTransactions(year?: number, month?: number): Promise<Transaction[]> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();
  const query = supabase.from("transactions").select("*").eq("household_id", householdId);

  // Return all transactions if no date filter
  if (year === undefined || month === undefined) {
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return (data as TransactionRow[]).map(mapTransactionRow);
  }

  // Filtered by month with credit card offset handling
  return getTransactionsForMonth(supabase, householdId, year, month);
}

/**
 * Gets transactions for a specific month, handling credit card date offsets and recurring transactions.
 */
async function getTransactionsForMonth(
  // biome-ignore lint/suspicious/noExplicitAny: Supabase client type
  supabase: any,
  householdId: string,
  year: number,
  month: number,
): Promise<Transaction[]> {
  const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString().split("T")[0];
  const endDate = new Date(Date.UTC(year, month, 0)).toISOString().split("T")[0];
  const prevMonthStartDate = new Date(Date.UTC(year, month - 2, 1)).toISOString().split("T")[0];

  // Fetch transactions from previous month through current month
  // (needed because credit-card expenses from previous month appear in current month)
  const { data: rawData, error: currentError } = await supabase
    .from("transactions")
    .select("*")
    .eq("household_id", householdId)
    .gte("date", prevMonthStartDate)
    .lte("date", endDate)
    .order("created_at", { ascending: false });

  if (currentError) throw currentError;

  // Filter to transactions whose accounting month matches the requested month
  const currentMonthData = filterByAccountingMonth(rawData ?? [], year, month);

  // Fetch and materialize recurring transactions
  const virtualTransactions = await materializeRecurringTransactions(
    supabase,
    householdId,
    startDate,
    year,
    month,
  );

  // Deduplicate: keep transactions from currentMonthData over virtual ones
  const existingIds = new Set(currentMonthData.map((t: TransactionRow) => t.id));
  const uniqueVirtualTransactions = virtualTransactions.filter(
    (transaction) => !existingIds.has(transaction.id),
  );

  const allTransactions = [...currentMonthData, ...uniqueVirtualTransactions];

  // Sort by creation time (most recent first)
  allTransactions.sort((a, b) => {
    const createdAtCompare = String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""));
    return createdAtCompare !== 0 ? createdAtCompare : Number(b.id ?? 0) - Number(a.id ?? 0);
  });

  return allTransactions.map(mapTransactionRow);
}

/**
 * Filters transactions by their accounting month.
 */
function filterByAccountingMonth(
  rows: TransactionRow[],
  year: number,
  month: number,
): TransactionRow[] {
  return rows.filter((row) => {
    const accounting = getAccountingYearMonthUtc(row.date, row.is_credit_card ?? false);
    return accounting.year === year && accounting.month === month;
  });
}

/**
 * Materializes recurring transactions for the given month.
 */
async function materializeRecurringTransactions(
  // biome-ignore lint/suspicious/noExplicitAny: Supabase client type
  supabase: any,
  householdId: string,
  startDate: string,
  year: number,
  month: number,
): Promise<TransactionRow[]> {
  const { data: recurringData, error: recurringError } = await supabase
    .from("transactions")
    .select("*")
    .eq("household_id", householdId)
    .eq("is_recurring", true)
    .lt("date", startDate)
    .order("created_at", { ascending: false });

  if (recurringError) throw recurringError;

  const monthsToMaterialize = [
    { year, month },
    {
      year: month === 1 ? year - 1 : year,
      month: month === 1 ? 12 : month - 1,
    },
  ];

  const virtualTransactions =
    (recurringData as TransactionRow[] | null)?.flatMap((recurringTransaction) => {
      const originalDate = parseDateStringUtc(recurringTransaction.date);
      const day = originalDate.getUTCDate();

      return monthsToMaterialize.map((targetMonth) => {
        let targetDate = new Date(Date.UTC(targetMonth.year, targetMonth.month - 1, day));

        // Clamp to last day of month if day overflowed
        if (targetDate.getUTCMonth() !== targetMonth.month - 1) {
          targetDate = new Date(Date.UTC(targetMonth.year, targetMonth.month, 0));
        }

        return {
          ...recurringTransaction,
          date: targetDate.toISOString().split("T")[0],
        };
      });
    }) ?? [];

  // Filter to transactions whose accounting month matches
  return filterByAccountingMonth(virtualTransactions, year, month);
}

export async function getTransaction(id: number): Promise<Transaction | null> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("household_id", householdId)
    .single();

  if (error) return null;
  return mapTransactionRow(data as TransactionRow);
}

export async function createTransaction(t: Omit<Transaction, "id">): Promise<Transaction> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const isIncome = t.type === "income";
  const isForecast = t.isForecast ?? false;

  const dbRow = {
    description: t.description,
    amount: t.amount,
    category_id: isIncome ? null : t.categoryId,
    paid_by: t.paidBy,
    is_recurring: t.isRecurring,
    is_credit_card: isIncome ? false : (t.isCreditCard ?? false),
    exclude_from_split: isIncome ? false : (t.excludeFromSplit ?? false),
    is_forecast: isForecast,
    date: t.date,
    household_id: householdId,
    type: t.type ?? "expense",
    is_increment: t.isIncrement ?? true,
  };

  const { data, error } = await supabase.from("transactions").insert(dbRow).select().single();

  if (error) throw error;
  return mapTransactionRow(data as TransactionRow);
}

export async function updateTransaction(id: number, patch: TransactionPatch): Promise<Transaction> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();
  const dbPatch = toTransactionDbPatch(patch);

  const { data, error } = await supabase
    .from("transactions")
    .update(dbPatch)
    .eq("id", id)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) throw error;
  return mapTransactionRow(data as TransactionRow);
}

export async function deleteTransaction(id: number): Promise<void> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);
  if (error) throw error;
}

export async function bulkUpdateTransactions(
  ids: number[],
  patch: BulkTransactionPatch,
): Promise<Transaction[]> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();
  const dbPatch = toBulkTransactionDbPatch(patch);

  const { data, error } = await supabase
    .from("transactions")
    .update(dbPatch)
    .in("id", ids)
    .eq("household_id", householdId)
    .select();

  if (error) throw error;
  return (data as TransactionRow[]).map(mapTransactionRow);
}

export async function bulkDeleteTransactions(ids: number[]): Promise<void> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();
  const { error } = await supabase
    .from("transactions")
    .delete()
    .in("id", ids)
    .eq("household_id", householdId);
  if (error) throw error;
}

// ============================================================================
// Default Payer Operations
// ============================================================================

export async function getDefaultPayerId(): Promise<string | null> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data, error } = await supabase
    .from("households")
    .select("default_payer_id")
    .eq("id", householdId)
    .single();

  if (error) throw error;
  return data?.default_payer_id ?? null;
}

export async function updateDefaultPayerId(personId: string): Promise<void> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  // Verify that the person belongs to the household
  const { data: personData, error: personError } = await supabase
    .from("people")
    .select("id, household_id")
    .eq("id", personId)
    .eq("household_id", householdId)
    .single();

  if (personError || !personData) {
    throw new Error("Person not found in household");
  }

  const { data: updateData, error } = await supabase
    .from("households")
    .update({ default_payer_id: personId })
    .eq("id", householdId)
    .select();

  if (error) throw error;

  if (!updateData || updateData.length === 0) {
    throw new Error("Failed to update default payer - no rows updated");
  }
}

// ============================================================================
// Emergency Fund Operations
// ============================================================================

export async function getEmergencyFund(): Promise<number> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data, error } = await supabase
    .from("households")
    .select("emergency_fund")
    .eq("id", householdId)
    .single();

  if (error) throw error;
  return Number(data?.emergency_fund ?? 0);
}

export async function updateEmergencyFund(amount: number): Promise<void> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data: updateData, error } = await supabase
    .from("households")
    .update({ emergency_fund: amount })
    .eq("id", householdId)
    .select();

  if (error) throw error;

  if (!updateData || updateData.length === 0) {
    throw new Error("Failed to update emergency fund - no rows updated");
  }
}

// ============================================================================
// Outlier Statistics
// ============================================================================

/**
 * Calculates mean and standard deviation of expense amounts per category
 * from the 12 months preceding the reference month.
 * Used to detect outlier expenses.
 */
export async function getOutlierStatistics(
  referenceYear: number,
  referenceMonth: number,
): Promise<CategoryStatistics[]> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  // Calculate the date range: 12 months before the reference month
  const referenceDate = dayjs.utc(`${referenceYear}-${referenceMonth}-01`);
  const prevMonth = referenceDate.subtract(1, "month");
  const endDate = prevMonth.endOf("month");
  const startDate = endDate.subtract(11, "month").startOf("month");

  const startDateStr = startDate.format("YYYY-MM-DD");
  const endDateStr = endDate.format("YYYY-MM-DD");
  const prevMonthStr = prevMonth.format("YYYY-MM");

  // Fetch expense transactions (non-recurring, not excluded from split) from the 12-month period
  const { data, error } = await supabase
    .from("transactions")
    .select("category_id, amount, date, is_credit_card")
    .eq("household_id", householdId)
    .eq("type", "expense")
    .eq("is_recurring", false)
    .eq("exclude_from_split", false)
    .not("category_id", "is", null)
    .gte("date", startDateStr)
    .lte("date", endDateStr);

  if (error) throw error;

  // Group amounts by category, excluding credit card transactions from previous month
  const categoryAmounts = new Map<string, number[]>();
  for (const row of data ?? []) {
    if (!row.category_id) continue;

    // Skip credit card transactions from the previous month
    if (row.is_credit_card && row.date?.startsWith(prevMonthStr)) {
      continue;
    }

    const amounts = categoryAmounts.get(row.category_id) ?? [];
    amounts.push(Number(row.amount));
    categoryAmounts.set(row.category_id, amounts);
  }

  // Calculate statistics per category
  const statistics: CategoryStatistics[] = [];
  for (const [categoryId, amounts] of categoryAmounts) {
    if (amounts.length === 0) continue;

    const count = amounts.length;
    const mean = amounts.reduce((sum, val) => sum + val, 0) / count;

    // Calculate standard deviation
    const squaredDiffs = amounts.map((val) => (val - mean) ** 2);
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / count;
    const standardDeviation = Math.sqrt(variance);

    statistics.push({
      categoryId,
      mean,
      standardDeviation,
      transactionCount: count,
    });
  }

  return statistics;
}
