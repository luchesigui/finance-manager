import "server-only";

import { dayjs, getAccountingYearMonthUtc, parseDateStringUtc } from "@/lib/dateUtils";
import {
  mapTransactionRow,
  toBulkTransactionDbPatch,
  toTransactionDbPatch,
} from "@/lib/server/dbMappers";
import { getPrimaryHouseholdId } from "@/lib/server/household";
import { createClient } from "@/lib/supabase/server";
import type {
  BulkTransactionPatch,
  CategoryStatistics,
  Transaction,
  TransactionPatch,
  TransactionRow,
} from "@/lib/types";

export async function getTransactions(year?: number, month?: number): Promise<Transaction[]> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();
  const query = supabase.from("transactions").select("*").eq("household_id", householdId);

  if (year === undefined || month === undefined) {
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return (data as TransactionRow[]).map(mapTransactionRow);
  }

  return getTransactionsForMonth(supabase, householdId, year, month);
}

export async function getRecurringTransactions(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ transactions: Transaction[]; total: number }> {
  const limit = Math.min(options?.limit ?? 100, 100);
  const offset = options?.offset ?? 0;
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data, error, count } = await supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .eq("household_id", householdId)
    .eq("is_recurring", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  const transactions = (data as TransactionRow[]).map(mapTransactionRow);
  return { transactions, total: count ?? 0 };
}

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

        if (targetDate.getUTCMonth() !== targetMonth.month - 1) {
          targetDate = new Date(Date.UTC(targetMonth.year, targetMonth.month, 0));
        }

        return {
          ...recurringTransaction,
          date: targetDate.toISOString().split("T")[0],
        };
      });
    }) ?? [];

  return filterByAccountingMonth(virtualTransactions, year, month);
}

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

  const { data: rawData, error: currentError } = await supabase
    .from("transactions")
    .select("*")
    .eq("household_id", householdId)
    .gte("date", prevMonthStartDate)
    .lte("date", endDate)
    .order("created_at", { ascending: false });

  if (currentError) throw currentError;

  const currentMonthData = filterByAccountingMonth(rawData ?? [], year, month);

  const virtualTransactions = await materializeRecurringTransactions(
    supabase,
    householdId,
    startDate,
    year,
    month,
  );

  const existingIds = new Set(currentMonthData.map((t: TransactionRow) => t.id));
  const uniqueVirtualTransactions = virtualTransactions.filter(
    (transaction) => !existingIds.has(transaction.id),
  );

  const allTransactions = [...currentMonthData, ...uniqueVirtualTransactions];

  allTransactions.sort((a, b) => {
    const createdAtCompare = String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""));
    return createdAtCompare !== 0 ? createdAtCompare : Number(b.id ?? 0) - Number(a.id ?? 0);
  });

  return allTransactions.map(mapTransactionRow);
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

export async function getOutlierStatistics(
  referenceYear: number,
  referenceMonth: number,
): Promise<CategoryStatistics[]> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const referenceDate = dayjs.utc(`${referenceYear}-${referenceMonth}-01`);
  const prevMonth = referenceDate.subtract(1, "month");
  const endDate = prevMonth.endOf("month");
  const startDate = endDate.subtract(11, "month").startOf("month");

  const startDateStr = startDate.format("YYYY-MM-DD");
  const endDateStr = endDate.format("YYYY-MM-DD");
  const prevMonthStr = prevMonth.format("YYYY-MM");

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

  const categoryAmounts = new Map<string, number[]>();
  for (const row of data ?? []) {
    if (!row.category_id) continue;

    if (row.is_credit_card && row.date?.startsWith(prevMonthStr)) {
      continue;
    }

    const amounts = categoryAmounts.get(row.category_id) ?? [];
    amounts.push(Number(row.amount));
    categoryAmounts.set(row.category_id, amounts);
  }

  const statistics: CategoryStatistics[] = [];
  for (const [categoryId, amounts] of categoryAmounts) {
    if (amounts.length === 0) continue;

    const count = amounts.length;
    const mean = amounts.reduce((sum, val) => sum + val, 0) / count;

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
