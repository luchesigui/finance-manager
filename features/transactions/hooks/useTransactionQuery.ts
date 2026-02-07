"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/apiClient";
import type { Transaction } from "@/lib/types";

/**
 * Builds the API URL for fetching transactions.
 */
function buildTransactionsUrl(year: number, month: number): string {
  return `/api/transactions?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`;
}

/**
 * Hook for fetching transactions for a specific month/year.
 * Returns raw transaction data and loading state.
 */
export function useTransactionQuery(year: number, month: number) {
  const queryKey = ["transactions", year, month] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => fetchJson<Transaction[]>(buildTransactionsUrl(year, month)),
  });

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    queryKey,
  };
}
