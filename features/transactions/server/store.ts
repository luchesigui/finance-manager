import "server-only";

import { getRecurringTemplates } from "@/features/recurring-templates/server/store";
import { isMonthClosed } from "@/features/snapshots/server/store";
import { dayjs, getAccountingYearMonthUtc, toDateString } from "@/lib/dateUtils";
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
  RecurringTemplate,
  Transaction,
  TransactionPatch,
  TransactionRow,
} from "@/lib/types";

function recurringTemplateToTransaction(
  template: RecurringTemplate,
  date: string,
  id = -template.id,
): Transaction {
  return {
    id,
    description: template.description,
    amount: template.amount,
    categoryId: template.type === "income" ? null : template.categoryId,
    paidBy: template.paidBy,
    recurringTemplateId: template.id,
    isCreditCard: template.type === "income" ? false : template.isCreditCard,
    excludeFromSplit: template.type === "income" ? false : template.excludeFromSplit,
    isForecast: false,
    date,
    createdAt: template.createdAt,
    householdId: template.householdId,
    type: template.type,
    isIncrement: template.isIncrement,
  };
}

export async function getTransactions(
  year?: number,
  month?: number,
  householdIdOverride?: string,
): Promise<Transaction[]> {
  const supabase = await createClient();
  const householdId = householdIdOverride ?? (await getPrimaryHouseholdId());
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
  const { templates, total } = await getRecurringTemplates({
    activeOnly: true,
    limit: options?.limit,
    offset: options?.offset,
  });

  const todayDate = toDateString(new Date());
  const transactions = templates.map((template) =>
    recurringTemplateToTransaction(template, todayDate),
  );
  return { transactions, total };
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

function clampDay(year: number, month: number, day: number): number {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Math.min(day, lastDay);
}

function toVirtualId(templateId: number, year: number, month: number): number {
  return -(templateId * 100_000 + year * 100 + month);
}

/** True if (year, month) is >= template's creation month (from createdAt). */
function templateAppliesToMonth(tpl: RecurringTemplate, year: number, month: number): boolean {
  if (!tpl.createdAt) return true;
  const d = new Date(tpl.createdAt);
  const createdYear = d.getUTCFullYear();
  const createdMonth = d.getUTCMonth() + 1;
  return year > createdYear || (year === createdYear && month >= createdMonth);
}

async function materializeRecurringTemplates(year: number, month: number): Promise<Transaction[]> {
  const { templates } = await getRecurringTemplates({
    activeOnly: true,
    limit: 500,
  });

  const applicable = templates.filter((tpl) => templateAppliesToMonth(tpl, year, month));
  if (applicable.length === 0) return [];

  const results: Transaction[] = [];

  for (const tpl of applicable) {
    // Current month: regular templates
    const day = clampDay(year, month, tpl.dayOfMonth);
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    if (!tpl.isCreditCard) {
      results.push(recurringTemplateToTransaction(tpl, dateStr, toVirtualId(tpl.id, year, month)));
    }

    // Credit card: transaction from previous month appears in current accounting month
    if (tpl.isCreditCard) {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevDay = clampDay(prevYear, prevMonth, tpl.dayOfMonth);
      const prevDateStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(prevDay).padStart(2, "0")}`;
      results.push(
        recurringTemplateToTransaction(tpl, prevDateStr, toVirtualId(tpl.id, year, month)),
      );
    }
  }

  return results;
}

async function getTransactionsForMonth(
  // biome-ignore lint/suspicious/noExplicitAny: Supabase client type
  supabase: any,
  householdId: string,
  year: number,
  month: number,
): Promise<Transaction[]> {
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

  const filteredRows = filterByAccountingMonth(rawData ?? [], year, month);
  const realTransactions = filteredRows.map(mapTransactionRow);

  const closed = await isMonthClosed(householdId, year, month);
  if (closed) {
    realTransactions.sort((a, b) => {
      const ca = a.createdAt ?? "";
      const cb = b.createdAt ?? "";
      const createdAtCompare = cb.localeCompare(ca);
      return createdAtCompare !== 0 ? createdAtCompare : b.id - a.id;
    });
    return realTransactions;
  }

  // Materialize recurring templates as virtual transactions (only for open months)
  const virtualTransactions = await materializeRecurringTemplates(year, month);

  // Deduplicate: exclude virtual transactions whose template already has a real row this month
  const realTemplateIds = new Set(
    realTransactions.filter((t) => t.recurringTemplateId != null).map((t) => t.recurringTemplateId),
  );

  const deduped = virtualTransactions.filter((vt) => !realTemplateIds.has(vt.recurringTemplateId));

  const allTransactions = [...realTransactions, ...deduped];

  allTransactions.sort((a, b) => {
    const ca = a.createdAt ?? "";
    const cb = b.createdAt ?? "";
    const createdAtCompare = cb.localeCompare(ca);
    return createdAtCompare !== 0 ? createdAtCompare : b.id - a.id;
  });

  return allTransactions;
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

export async function createTransaction(
  t: Omit<Transaction, "id" | "recurringTemplateId"> & {
    recurringTemplateId?: number | null;
  },
): Promise<Transaction> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  // Only use recurringTemplateId if explicitly passed (e.g., from monthly close)
  // Templates are now created separately via the recurring-templates API
  const recurringTemplateId = t.recurringTemplateId ?? null;

  const isIncome = t.type === "income";
  const isForecast = t.isForecast ?? false;

  const dbRow = {
    description: t.description,
    amount: t.amount,
    category_id: isIncome ? null : t.categoryId,
    paid_by: t.paidBy,
    recurring_template_id: recurringTemplateId,
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
  householdIdOverride?: string,
): Promise<CategoryStatistics[]> {
  const supabase = await createClient();
  const householdId = householdIdOverride ?? (await getPrimaryHouseholdId());

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
    .is("recurring_template_id", null)
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
