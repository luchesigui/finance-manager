"use client";

import { useMemo } from "react";

import type { Transaction } from "@/lib/types";

/**
 * Compares transactions by creation date (descending) and ID.
 */
function compareByCreationDesc(a: Transaction, b: Transaction): number {
  const createdAtCompare = String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""));
  return createdAtCompare !== 0 ? createdAtCompare : b.id - a.id;
}

/**
 * Hook for computing derived transaction arrays.
 * Takes raw transactions and forecast inclusion state as inputs.
 */
export function useTransactionDerivations(
  transactions: Transaction[],
  forecastInclusionOverrides: Record<number, boolean>,
) {
  const transactionsForSelectedMonth = useMemo(
    () => [...transactions].sort(compareByCreationDesc),
    [transactions],
  );

  const transactionsForCalculations = useMemo(() => {
    return transactions
      .filter(
        (transaction) => !transaction.isForecast || forecastInclusionOverrides[transaction.id],
      )
      .map((transaction) => {
        if (!transaction.isForecast) return transaction;
        if (!forecastInclusionOverrides[transaction.id]) return transaction;
        return { ...transaction, isForecast: false };
      });
  }, [transactions, forecastInclusionOverrides]);

  return {
    transactionsForSelectedMonth,
    transactionsForCalculations,
  };
}
