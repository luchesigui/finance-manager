import { NextResponse } from "next/server";

import { getOutlierStatistics } from "@/features/transactions/server/store";
import { requireAuth } from "@/lib/server/requestBodyValidation";

export const dynamic = "force-dynamic";

/**
 * GET /api/outlier-statistics
 * Fetches category statistics for outlier detection.
 * Requires year and month query parameters.
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

    const statistics = await getOutlierStatistics(year, month);
    return NextResponse.json(statistics);
  } catch (error) {
    console.error("Failed to fetch outlier statistics:", error);
    return NextResponse.json({ error: "Failed to fetch outlier statistics" }, { status: 500 });
  }
}
