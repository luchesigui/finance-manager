"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/apiClient";

// ============================================================================
// Types
// ============================================================================

export type HealthStatus = "healthy" | "warning" | "critical";

export type HealthScoreData = {
  period: string;
  score: number;
  status: HealthStatus;
  reason?: string;
};

// ============================================================================
// Constants
// ============================================================================

const STALE_TIME_MS = 2 * 60 * 1000; // 2 minutes

// ============================================================================
// Helper Functions
// ============================================================================

function buildHealthScoreUrl(periods: string[]): string {
  return `/api/health-score?periods=${encodeURIComponent(periods.join(","))}`;
}

/**
 * Formats year and month into period string (yyyy-mm)
 */
export function formatPeriod(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/**
 * Generates an array of period strings for the specified range.
 * @param centerYear - Center year
 * @param centerMonth - Center month (1-12)
 * @param monthsBefore - Number of months before center
 * @param monthsAfter - Number of months after center
 */
export function generatePeriodRange(
  centerYear: number,
  centerMonth: number,
  monthsBefore: number,
  monthsAfter: number,
): string[] {
  const periods: string[] = [];

  for (let offset = -monthsBefore; offset <= monthsAfter; offset++) {
    let m = centerMonth + offset;
    let y = centerYear;

    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    while (m > 12) {
      m -= 12;
      y += 1;
    }

    periods.push(formatPeriod(y, m));
  }

  return periods;
}

// ============================================================================
// Hook
// ============================================================================

type UseHealthScoreQueryParams = {
  periods: string[];
  enabled?: boolean;
};

type UseHealthScoreQueryResult = {
  data: HealthScoreData[] | undefined;
  isLoading: boolean;
  error: Error | null;
  /** Get score data for a specific period */
  getScoreForPeriod: (period: string) => HealthScoreData | undefined;
};

/**
 * Hook to fetch health scores for specified periods.
 * Maximum 10 periods per request.
 */
export function useHealthScoreQuery({
  periods,
  enabled = true,
}: UseHealthScoreQueryParams): UseHealthScoreQueryResult {
  const query = useQuery({
    queryKey: ["health-scores", periods.join(",")],
    queryFn: () => fetchJson<HealthScoreData[]>(buildHealthScoreUrl(periods)),
    staleTime: STALE_TIME_MS,
    enabled: enabled && periods.length > 0 && periods.length <= 10,
  });

  const getScoreForPeriod = (period: string): HealthScoreData | undefined => {
    return query.data?.find((d) => d.period === period);
  };

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    getScoreForPeriod,
  };
}
