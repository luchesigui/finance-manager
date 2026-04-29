import { NextResponse } from "next/server";

import { getCategories } from "@/features/categories/server/store";
import { filterValidExpenseTransactions } from "@/features/simulation/server/expenseFilters";
import { getTransactions } from "@/features/transactions/server/store";
import { dayjs, transactionMatchesAccountingPeriod } from "@/lib/dateUtils";
import { getPrimaryHouseholdId } from "@/lib/server/household";
import { requireAuth } from "@/lib/server/requestBodyValidation";

export const dynamic = "force-dynamic";

const MAX_MONTHS = 12;

/**
 * GET /api/simulations/average-expenses
 * Returns the average monthly expense over the last 12 complete months.
 * Starts from the previous month (excludes current partial month).
 * Uses getTransactions(year, month) so virtual recurring template transactions
 * are included for unclosed months — matching what the user sees per month.
 * Applies transactionMatchesAccountingPeriod to exclude display-only isNextBilling
 * rows that getTransactionsForMonth includes for UI purposes but that account for
 * the following month.
 */
export async function GET() {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  try {
    const [categories, householdId] = await Promise.all([getCategories(), getPrimaryHouseholdId()]);

    const now = dayjs.utc();
    // Start from last month (i+1) to only include complete months
    const monthsToFetch = Array.from({ length: MAX_MONTHS }, (_, i) => {
      const d = now.subtract(i + 1, "month");
      return { year: d.year(), month: d.month() + 1 };
    });

    const monthlyTransactions = await Promise.all(
      monthsToFetch.map(({ year, month }) => getTransactions(year, month, householdId)),
    );

    const monthlyTotals = monthlyTransactions.map((transactions, i) => {
      const { year, month } = monthsToFetch[i];
      return filterValidExpenseTransactions(transactions, categories)
        .filter((t) => !t.isForecast)
        .filter((t) => transactionMatchesAccountingPeriod(t, year, month))
        .reduce((sum, t) => sum + t.amount, 0);
    });

    const nonZeroTotals = monthlyTotals.filter((total) => total > 0);
    if (nonZeroTotals.length === 0) {
      return NextResponse.json({ averageExpenses: 0 });
    }

    const average = nonZeroTotals.reduce((sum, t) => sum + t, 0) / nonZeroTotals.length;
    return NextResponse.json({ averageExpenses: average });
  } catch (error) {
    console.error("Failed to compute average expenses:", error);
    return NextResponse.json({ error: "Failed to compute average expenses" }, { status: 500 });
  }
}
