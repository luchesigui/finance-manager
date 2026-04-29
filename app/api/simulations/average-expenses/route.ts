import { NextResponse } from "next/server";

import { getCategories } from "@/features/categories/server/store";
import { filterValidExpenseTransactions } from "@/features/simulation/server/expenseFilters";
import { getTransactions } from "@/features/transactions/server/store";
import { dayjs } from "@/lib/dateUtils";
import { getPrimaryHouseholdId } from "@/lib/server/household";
import { requireAuth } from "@/lib/server/requestBodyValidation";

export const dynamic = "force-dynamic";

const MAX_MONTHS = 12;

/**
 * GET /api/simulations/average-expenses
 * Returns the average monthly expense over the last 12 months (or fewer if less data exists).
 * Uses getTransactions(year, month) for each month so virtual recurring template
 * transactions are included for unclosed months — matching what the user sees per month.
 */
export async function GET() {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  try {
    const [categories, householdId] = await Promise.all([getCategories(), getPrimaryHouseholdId()]);

    const now = dayjs.utc();
    const monthsToFetch = Array.from({ length: MAX_MONTHS }, (_, i) => {
      const d = now.subtract(i, "month");
      return { year: d.year(), month: d.month() + 1 };
    });

    const monthlyTransactions = await Promise.all(
      monthsToFetch.map(({ year, month }) => getTransactions(year, month, householdId)),
    );

    const monthlyTotals = monthlyTransactions.map((transactions) =>
      filterValidExpenseTransactions(transactions, categories)
        .filter((t) => !t.isForecast)
        .reduce((sum, t) => sum + t.amount, 0),
    );

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
