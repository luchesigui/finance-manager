import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Category, Person, Transaction } from "@/lib/types";

// Helper to convert snake_case DB result to camelCase
// biome-ignore lint/suspicious/noExplicitAny: DB row type is loose
const toPerson = (row: any): Person => ({
  id: row.id,
  name: row.name,
  income: Number(row.income),
  householdId: row.household_id,
  linkedUserId: row.linked_user_id,
});

// biome-ignore lint/suspicious/noExplicitAny: DB row type is loose
const toCategory = (row: any): Category => ({
  id: row.category_id,
  name: row.categories.name,
  targetPercent: Number(row.target_percent),
  householdId: row.household_id,
});

// biome-ignore lint/suspicious/noExplicitAny: DB row type is loose
const toTransaction = (row: any): Transaction => ({
  id: Number(row.id),
  description: row.description,
  amount: Number(row.amount),
  categoryId: row.category_id,
  paidBy: row.paid_by,
  isRecurring: row.is_recurring,
  isCreditCard: row.is_credit_card ?? false,
  excludeFromSplit: row.exclude_from_split ?? false,
  date: row.date,
  createdAt: row.created_at,
  householdId: row.household_id,
});

function parseDateUtc(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Adds months to a UTC date, clamping the day to the last day of the target month when needed.
 * Example: 2025-01-31 + 1 month -> 2025-02-28/29.
 */
function addMonthsClampedUtc(date: Date, monthsToAdd: number): Date {
  const year = date.getUTCFullYear();
  const monthIndex = date.getUTCMonth();
  const day = date.getUTCDate();

  const targetMonthIndex = monthIndex + monthsToAdd;
  const candidate = new Date(Date.UTC(year, targetMonthIndex, day));

  const expectedMonthIndex = ((targetMonthIndex % 12) + 12) % 12;
  if (candidate.getUTCMonth() !== expectedMonthIndex) {
    // Day overflowed; clamp to last day of target month.
    return new Date(Date.UTC(year, targetMonthIndex + 1, 0));
  }

  return candidate;
}

function getAccountingYearMonth(
  dateString: string,
  isCreditCard: boolean,
): { year: number; month: number } {
  const base = parseDateUtc(dateString);
  const accountingDate = isCreditCard ? addMonthsClampedUtc(base, 1) : base;
  return { year: accountingDate.getUTCFullYear(), month: accountingDate.getUTCMonth() + 1 };
}

type TransactionRow = {
  date: string;
  is_credit_card?: boolean;
  created_at?: string;
  id?: number | string;
  [key: string]: unknown;
};

async function getPrimaryHouseholdId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (error || !data) {
    // If no household found, maybe creation failed or race condition.
    // Return null or throw? Throwing ensures we don't write orphaned data.
    throw new Error("No household found for user");
  }
  return data.household_id;
}

export async function getPeople(): Promise<Person[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("people").select("*").order("name");
  if (error) throw error;
  return data.map(toPerson);
}

export async function updatePerson(id: string, patch: Partial<Person>): Promise<Person> {
  const supabase = await createClient();
  // biome-ignore lint/suspicious/noExplicitAny: constructing dynamic object
  const dbPatch: any = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.income !== undefined) dbPatch.income = patch.income;

  const { data, error } = await supabase
    .from("people")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return toPerson(data);
}

export async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  // Query household_categories with a join to categories (normalized schema)
  const { data, error } = await supabase
    .from("household_categories")
    .select(
      `
      category_id,
      target_percent,
      household_id,
      categories (
        name
      )
    `,
    )
    .order("categories(name)");
  if (error) throw error;
  return data.map(toCategory);
}

export async function updateCategory(id: string, patch: Partial<Category>): Promise<Category> {
  const supabase = await createClient();
  // biome-ignore lint/suspicious/noExplicitAny: constructing dynamic object
  const dbPatch: any = {};
  // Note: name updates are not supported in normalized schema (names are global)
  if (patch.targetPercent !== undefined) dbPatch.target_percent = patch.targetPercent;

  // Update household_categories by category_id (id is the global category ID)
  const { data, error } = await supabase
    .from("household_categories")
    .update(dbPatch)
    .eq("category_id", id)
    .select(
      `
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
  return toCategory(data);
}

export async function getTransactions(year?: number, month?: number): Promise<Transaction[]> {
  const supabase = await createClient();
  const query = supabase.from("transactions").select("*");

  if (year !== undefined && month !== undefined) {
    const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString().split("T")[0];
    const endDate = new Date(Date.UTC(year, month, 0)).toISOString().split("T")[0];
    const prevMonthStartDate = new Date(Date.UTC(year, month - 2, 1)).toISOString().split("T")[0];

    // 1. Fetch transactions from previous month start through current month end.
    // We need the previous month because credit-card expenses from the previous month
    // are accounted for in the current month.
    const { data: rawData, error: currentError } = await query
      .gte("date", prevMonthStartDate)
      .lte("date", endDate)
      .order("created_at", {
        ascending: false,
      });
    if (currentError) throw currentError;

    // Filter to only those whose *accounting month* matches the requested month/year.
    const currentMonthData =
      (rawData as TransactionRow[] | null | undefined)?.filter((row) => {
        const accounting = getAccountingYearMonth(row.date, row.is_credit_card ?? false);
        return accounting.year === year && accounting.month === month;
      }) ?? [];

    // 2. Fetch recurring transactions created BEFORE this month (used as templates).
    // We'll materialize both the selected month and the previous month and then apply the same
    // accounting-month filter. This supports credit-card recurring expenses showing up in the
    // month after their occurrence.
    const { data: recurringData, error: recurringError } = await supabase
      .from("transactions")
      .select("*")
      .eq("is_recurring", true)
      .lt("date", startDate)
      .order("created_at", { ascending: false });

    if (recurringError) throw recurringError;

    const monthsToMaterialize = [
      { year, month },
      (() => {
        const prev = new Date(Date.UTC(year, month - 2, 1));
        return { year: prev.getUTCFullYear(), month: prev.getUTCMonth() + 1 };
      })(),
    ];

    // 3. Process recurring transactions
    const virtualTransactions =
      (recurringData as TransactionRow[] | null | undefined)
        ?.flatMap((t) => {
          const originalDate = parseDateUtc(t.date);
          const day = originalDate.getUTCDate();

          return monthsToMaterialize.map((m) => {
            const targetDate = new Date(Date.UTC(m.year, m.month - 1, day));

            // If the month rolled over (e.g. Feb 31 -> Mar 3), roll back to last day of target month
            if (targetDate.getUTCMonth() !== m.month - 1) {
              const lastDayOfMonth = new Date(Date.UTC(m.year, m.month, 0));
              targetDate.setUTCFullYear(lastDayOfMonth.getUTCFullYear());
              targetDate.setUTCMonth(lastDayOfMonth.getUTCMonth());
              targetDate.setUTCDate(lastDayOfMonth.getUTCDate());
            }

            return {
              ...t,
              date: targetDate.toISOString().split("T")[0],
            };
          });
        })
        .filter((t) => {
          const accounting = getAccountingYearMonth(t.date, t.is_credit_card ?? false);
          return accounting.year === year && accounting.month === month;
        }) ?? [];

    // Deduplicate: recurring transactions from the previous month that are also credit card
    // can appear both in currentMonthData (fetched directly) and in virtualTransactions
    // (materialized from template). We keep the one from currentMonthData and filter out
    // duplicates from virtualTransactions.
    const existingIds = new Set(currentMonthData.map((t) => t.id));
    const uniqueVirtualTransactions = virtualTransactions.filter((t) => !existingIds.has(t.id));

    const allTransactions = [...currentMonthData, ...uniqueVirtualTransactions];

    // Re-sort by creation time (most recent first)
    allTransactions.sort(
      (a, b) =>
        String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")) ||
        Number(b.id ?? 0) - Number(a.id ?? 0),
    );

    return allTransactions.map(toTransaction);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toTransaction);
}

export async function createTransaction(t: Omit<Transaction, "id">): Promise<Transaction> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const dbRow = {
    description: t.description,
    amount: t.amount,
    category_id: t.categoryId,
    paid_by: t.paidBy,
    is_recurring: t.isRecurring,
    is_credit_card: t.isCreditCard ?? false,
    exclude_from_split: t.excludeFromSplit ?? false,
    date: t.date,
    household_id: householdId,
  };

  const { data, error } = await supabase.from("transactions").insert(dbRow).select().single();

  if (error) throw error;
  return toTransaction(data);
}

export async function updateTransaction(
  id: number,
  patch: Partial<
    Pick<
      Transaction,
      | "description"
      | "amount"
      | "categoryId"
      | "paidBy"
      | "isRecurring"
      | "isCreditCard"
      | "excludeFromSplit"
      | "date"
    >
  >,
): Promise<Transaction> {
  const supabase = await createClient();
  // biome-ignore lint/suspicious/noExplicitAny: constructing dynamic object
  const dbPatch: any = {};
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.amount !== undefined) dbPatch.amount = patch.amount;
  if (patch.categoryId !== undefined) dbPatch.category_id = patch.categoryId;
  if (patch.paidBy !== undefined) dbPatch.paid_by = patch.paidBy;
  if (patch.isRecurring !== undefined) dbPatch.is_recurring = patch.isRecurring;
  if (patch.isCreditCard !== undefined) dbPatch.is_credit_card = patch.isCreditCard;
  if (patch.excludeFromSplit !== undefined) dbPatch.exclude_from_split = patch.excludeFromSplit;
  if (patch.date !== undefined) dbPatch.date = patch.date;

  const { data, error } = await supabase
    .from("transactions")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return toTransaction(data);
}

export async function deleteTransaction(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

export async function getTransaction(id: number): Promise<Transaction | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("transactions").select("*").eq("id", id).single();
  if (error) return null;
  return toTransaction(data);
}

export async function bulkUpdateTransactions(
  ids: number[],
  patch: Partial<
    Pick<Transaction, "categoryId" | "paidBy" | "isRecurring" | "isCreditCard" | "excludeFromSplit">
  >,
): Promise<Transaction[]> {
  const supabase = await createClient();
  // biome-ignore lint/suspicious/noExplicitAny: constructing dynamic object
  const dbPatch: any = {};
  if (patch.categoryId !== undefined) dbPatch.category_id = patch.categoryId;
  if (patch.paidBy !== undefined) dbPatch.paid_by = patch.paidBy;
  if (patch.isRecurring !== undefined) dbPatch.is_recurring = patch.isRecurring;
  if (patch.isCreditCard !== undefined) dbPatch.is_credit_card = patch.isCreditCard;
  if (patch.excludeFromSplit !== undefined) dbPatch.exclude_from_split = patch.excludeFromSplit;

  const { data, error } = await supabase
    .from("transactions")
    .update(dbPatch)
    .in("id", ids)
    .select();

  if (error) throw error;
  return data.map(toTransaction);
}

export async function bulkDeleteTransactions(ids: number[]): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().in("id", ids);
  if (error) throw error;
}

export async function createPerson(data: {
  name: string;
  income: number;
}): Promise<Person> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  // Create the person record
  const dbRow = {
    name: data.name,
    income: data.income,
    household_id: householdId,
    linked_user_id: null,
  };

  const { data: personData, error: personError } = await supabase
    .from("people")
    .insert(dbRow)
    .select()
    .single();

  if (personError) throw personError;
  return toPerson(personData);
}

export async function deletePerson(id: string): Promise<void> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  // Check if there are any transactions referencing this person
  const { data: transactions, error: checkError } = await supabase
    .from("transactions")
    .select("id")
    .eq("paid_by", id);

  if (checkError) throw checkError;

  // If there are transactions, reassign them to another person
  if (transactions && transactions.length > 0) {
    // Get the default payer for the household
    const defaultPayerId = await getDefaultPayerId();

    // Find a replacement person (default payer or first other person in household)
    let replacementPersonId: string | null = null;

    if (defaultPayerId && defaultPayerId !== id) {
      // Verify the default payer still exists
      const { data: defaultPayer } = await supabase
        .from("people")
        .select("id")
        .eq("id", defaultPayerId)
        .eq("household_id", householdId)
        .single();

      if (defaultPayer) {
        replacementPersonId = defaultPayerId;
      }
    }

    // If no valid default payer, get the first other person in the household
    if (!replacementPersonId) {
      const { data: otherPeople, error: peopleError } = await supabase
        .from("people")
        .select("id")
        .eq("household_id", householdId)
        .neq("id", id)
        .limit(1);

      if (peopleError) throw peopleError;

      if (!otherPeople || otherPeople.length === 0) {
        const error = new Error(
          "Cannot delete person because they have transactions and there are no other people to reassign them to.",
        );
        // @ts-expect-error - Adding error code for API route handling
        error.code = "NO_REPLACEMENT_PERSON";
        throw error;
      }

      replacementPersonId = otherPeople[0].id;
    }

    // Reassign all transactions to the replacement person
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ paid_by: replacementPersonId })
      .eq("paid_by", id);

    if (updateError) throw updateError;
  }

  // Now delete the person
  const { error } = await supabase.from("people").delete().eq("id", id);
  if (error) throw error;
}

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
    console.error("Person validation error:", personError);
    throw new Error("Person not found in household");
  }

  const { data: updateData, error } = await supabase
    .from("households")
    .update({ default_payer_id: personId })
    .eq("id", householdId)
    .select();

  if (error) {
    console.error("Failed to update default_payer_id:", error);
    throw error;
  }

  if (!updateData || updateData.length === 0) {
    console.error("Update returned no rows. RLS might be blocking the update.");
    throw new Error("Failed to update default payer - no rows updated");
  }

  console.log("Successfully updated default_payer_id:", updateData);
}
