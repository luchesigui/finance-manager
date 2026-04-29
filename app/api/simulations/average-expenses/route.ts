import { NextResponse } from "next/server";

import { getCategories } from "@/features/categories/server/store";
import { getTransactions } from "@/features/transactions/server/store";
import { getAccountingYearMonthUtc } from "@/lib/dateUtils";
import { getExpenseTransactions } from "@/lib/server/calculations";
import { requireAuth } from "@/lib/server/requestBodyValidation";

export const dynamic = "force-dynamic";

const LIBERDADE_FINANCEIRA = "Liberdade Financeira";
const MAX_MONTHS = 12;

/**
 * GET /api/simulations/average-expenses
 * Returns the average monthly expense over the last 12 months (or fewer if less data exists).
 * Excludes income, transfers, and "Liberdade Financeira" category.
 */
export async function GET() {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  try {
    const [transactions, categories] = await Promise.all([getTransactions(), getCategories()]);

    const liberdadeCategoryId = categories.find((c) => c.name === LIBERDADE_FINANCEIRA)?.id;

    const expenses = getExpenseTransactions(transactions).filter(
      (t) => !liberdadeCategoryId || t.categoryId !== liberdadeCategoryId,
    );

    const monthlyTotals = new Map<string, number>();
    for (const t of expenses) {
      const { year, month } = getAccountingYearMonthUtc(t.date, t.isNextBilling);
      const key = `${year}-${String(month).padStart(2, "0")}`;
      monthlyTotals.set(key, (monthlyTotals.get(key) ?? 0) + t.amount);
    }

    const sortedKeys = [...monthlyTotals.keys()].sort().slice(-MAX_MONTHS);
    if (sortedKeys.length === 0) {
      return NextResponse.json({ averageExpenses: 0 });
    }

    const total = sortedKeys.reduce((sum, key) => sum + (monthlyTotals.get(key) ?? 0), 0);
    return NextResponse.json({ averageExpenses: total / sortedKeys.length });
  } catch (error) {
    console.error("Failed to compute average expenses:", error);
    return NextResponse.json({ error: "Failed to compute average expenses" }, { status: 500 });
  }
}
