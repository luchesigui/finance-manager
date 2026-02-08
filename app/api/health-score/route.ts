import { NextResponse } from "next/server";

import { getCategories } from "@/features/categories/server/store";
import {
  type HealthScoreResponse,
  calculateHealthScore,
} from "@/features/dashboard/server/healthScoreCalculation";
import { getPeople } from "@/features/people/server/store";
import { getOutlierStatistics, getTransactions } from "@/features/transactions/server/store";
import { requireAuth } from "@/lib/server/requestBodyValidation";

export const dynamic = "force-dynamic";

const MAX_PERIODS = 10;
const OUTLIER_THRESHOLD_MULTIPLIER = 2;

/**
 * Parses a period string (yyyy-mm) into year and month.
 * Returns null if invalid.
 */
function parsePeriod(period: string): { year: number; month: number } | null {
  const match = period.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);

  if (month < 1 || month > 12) return null;
  if (year < 2000 || year > 2100) return null;

  return { year, month };
}

/**
 * Calculates the effective day of month for health score.
 * - Current month: today's day
 * - Past month: 31 (complete)
 * - Future month: 1 (not started)
 */
function getEffectiveDayOfMonth(year: number, month: number): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  if (year === currentYear && month === currentMonth) {
    return currentDay;
  }

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 31;
  }

  return 1;
}

/**
 * Counts outlier transactions based on category statistics.
 */
function countOutliers(
  transactions: Array<{
    amount: number;
    categoryId: string | null;
    type: string;
    recurringTemplateId: number | null;
    excludeFromSplit: boolean;
  }>,
  statistics: Array<{ categoryId: string; mean: number; standardDeviation: number }>,
): number {
  const thresholds = new Map<string, number>();
  for (const stat of statistics) {
    const threshold = stat.mean + OUTLIER_THRESHOLD_MULTIPLIER * stat.standardDeviation;
    thresholds.set(stat.categoryId, threshold);
  }

  let count = 0;
  for (const t of transactions) {
    if (t.type === "income") continue;
    if (t.recurringTemplateId != null) continue;
    if (t.excludeFromSplit) continue;
    if (!t.categoryId) continue;

    const threshold = thresholds.get(t.categoryId);
    if (threshold === undefined) continue;

    if (t.amount > threshold) {
      count++;
    }
  }

  return count;
}

/**
 * GET /api/health-score
 * Calculates financial health scores for specified periods.
 *
 * Query Parameters:
 * - periods: Comma-separated list of periods in yyyy-mm format (required)
 *
 * Returns an array of health score responses.
 * Maximum 10 periods per request.
 */
export async function GET(request: Request) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  try {
    const url = new URL(request.url);
    const periodsParam = url.searchParams.get("periods");

    if (!periodsParam) {
      return NextResponse.json({ error: "Missing required parameter: periods" }, { status: 400 });
    }

    // Parse periods
    const periodStrings = periodsParam.split(",").map((p) => p.trim());

    if (periodStrings.length === 0) {
      return NextResponse.json({ error: "At least one period is required" }, { status: 400 });
    }

    if (periodStrings.length > MAX_PERIODS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PERIODS} periods allowed per request` },
        { status: 400 },
      );
    }

    // Validate and parse all periods
    const periods: Array<{ year: number; month: number; periodStr: string }> = [];
    for (const periodStr of periodStrings) {
      const parsed = parsePeriod(periodStr);
      if (!parsed) {
        return NextResponse.json(
          { error: `Invalid period format: ${periodStr}. Expected yyyy-mm` },
          { status: 400 },
        );
      }
      periods.push({ ...parsed, periodStr });
    }

    // Fetch shared data (people and categories don't change per month)
    const [people, categories] = await Promise.all([getPeople(), getCategories()]);

    // Calculate health score for each period
    const results: HealthScoreResponse[] = [];

    for (const { year, month, periodStr } of periods) {
      const [transactions, outlierStats] = await Promise.all([
        getTransactions(year, month),
        getOutlierStatistics(year, month).catch(() => []),
      ]);

      const outlierCount = countOutliers(transactions, outlierStats);
      const dayOfMonth = getEffectiveDayOfMonth(year, month);

      const { score, status, reason } = calculateHealthScore(
        people,
        categories,
        transactions,
        outlierCount,
        dayOfMonth,
      );

      const response: HealthScoreResponse = {
        period: periodStr,
        score,
        status,
      };
      if (reason) {
        response.reason = reason;
      }
      results.push(response);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to calculate health scores:", error);
    return NextResponse.json({ error: "Failed to calculate health scores" }, { status: 500 });
  }
}
