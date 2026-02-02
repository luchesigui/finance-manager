"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchJson } from "@/lib/apiClient";
import type { CategoryStatistics, Transaction } from "@/lib/types";

const OUTLIER_THRESHOLD_MULTIPLIER = 1;
const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

function buildOutlierStatisticsUrl(year: number, month: number): string {
  return `/api/outlier-statistics?year=${encodeURIComponent(
    year
  )}&month=${encodeURIComponent(month)}`;
}

/**
 * Hook for detecting outlier expenses based on historical category statistics.
 * An expense is an outlier if: amount > mean + (2 * standardDeviation)
 */
export function useOutlierDetection(year: number, month: number) {
  const query = useQuery({
    queryKey: ["outlier-statistics", year, month],
    queryFn: () =>
      fetchJson<CategoryStatistics[]>(buildOutlierStatisticsUrl(year, month)),
    staleTime: STALE_TIME_MS,
  });

  // Pre-compute thresholds per category for O(1) lookup
  const thresholds = useMemo(() => {
    const map = new Map<string, number>();
    for (const stat of query.data ?? []) {
      const threshold =
        stat.mean + OUTLIER_THRESHOLD_MULTIPLIER * stat.standardDeviation;
      map.set(stat.categoryId, threshold);
    }
    return map;
  }, [query.data]);

  /**
   * Checks if a transaction is an outlier based on category statistics.
   * Returns false for income, recurring, and excluded-from-split transactions.
   */
  const isOutlier = (transaction: Transaction): boolean => {
    // Only flag expenses
    if (transaction.type === "income") return false;

    // Exclude recurring transactions
    if (transaction.isRecurring) return false;

    // Exclude transactions excluded from split
    if (transaction.excludeFromSplit) return false;

    // Must have a category
    if (!transaction.categoryId) return false;

    console.log({ transaction, thresholds });
    const threshold = thresholds.get(transaction.categoryId);
    // No historical data for this category
    if (threshold === undefined) return false;

    return transaction.amount > threshold;
  };

  return {
    isLoading: query.isLoading,
    isOutlier,
  };
}
