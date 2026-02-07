import { NextResponse } from "next/server";

import { getCategories } from "@/features/categories/server/store";
import { getPeople } from "@/features/people/server/store";
import { getOutlierStatistics, getTransactions } from "@/features/transactions/server/store";
import {
  calculateCategorySummary,
  calculateIncomeBreakdown,
  calculateTotalIncome,
  getExpenseTransactions,
} from "@/lib/server/calculations";
import { requireAuth } from "@/lib/server/requestBodyValidation";
import type { CategoryStatistics } from "@/lib/types";

export const dynamic = "force-dynamic";

const OUTLIER_THRESHOLD_MULTIPLIER = 2;

function countOutliers(
  transactions: Array<{
    amount: number;
    categoryId: string | null;
    type: string;
    isRecurring: boolean;
    excludeFromSplit: boolean;
  }>,
  statistics: CategoryStatistics[],
): number {
  const thresholds = new Map<string, number>();
  for (const stat of statistics) {
    const threshold = stat.mean + OUTLIER_THRESHOLD_MULTIPLIER * stat.standardDeviation;
    thresholds.set(stat.categoryId, threshold);
  }

  let count = 0;
  for (const transaction of transactions) {
    if (transaction.type === "income") continue;
    if (transaction.isRecurring) continue;
    if (transaction.excludeFromSplit) continue;
    if (!transaction.categoryId) continue;

    const threshold = thresholds.get(transaction.categoryId);
    if (threshold === undefined) continue;

    if (transaction.amount > threshold) {
      count++;
    }
  }

  return count;
}

/**
 * GET /api/dashboard/summary
 * Returns aggregated dashboard data for a period.
 * Query params: year, month (required)
 */
export async function GET(request: Request) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  try {
    const url = new URL(request.url);
    const yearParam = url.searchParams.get("year");
    const monthParam = url.searchParams.get("month");

    if (!yearParam || !monthParam) {
      return NextResponse.json(
        { error: "Missing required parameters: year and month" },
        { status: 400 },
      );
    }

    const year = Number.parseInt(yearParam, 10);
    const month = Number.parseInt(monthParam, 10);

    if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "Invalid year or month parameter" }, { status: 400 });
    }

    const [people, categories, transactions, outlierStatistics] = await Promise.all([
      getPeople(),
      getCategories(),
      getTransactions(year, month),
      getOutlierStatistics(year, month).catch(() => [] as CategoryStatistics[]),
    ]);

    const baseIncome = calculateTotalIncome(people);
    const incomeBreakdown = calculateIncomeBreakdown(transactions);
    const effectiveIncome = baseIncome + incomeBreakdown.netIncome;
    const expenseTransactions = getExpenseTransactions(transactions);
    const totalExpenses = expenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    );
    const categorySummary = calculateCategorySummary(categories, transactions, effectiveIncome);
    const outlierCount = countOutliers(transactions, outlierStatistics);

    return NextResponse.json({
      people,
      categories,
      transactions,
      baseIncome,
      incomeBreakdown,
      effectiveIncome,
      totalExpenses,
      categorySummary,
      outlierCount,
      expenseTransactions,
    });
  } catch (error) {
    console.error("Failed to compute dashboard summary:", error);
    return NextResponse.json({ error: "Failed to compute dashboard summary" }, { status: 500 });
  }
}
