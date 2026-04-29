"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/apiClient";
import type { Transaction } from "@/lib/types";

export function useHistoricalTransactionsQuery() {
  const query = useQuery({
    queryKey: ["transactions", "all"],
    queryFn: () => fetchJson<Transaction[]>("/api/transactions"),
    staleTime: 5 * 60 * 1000,
  });

  return {
    historicalTransactions: query.data ?? [],
    isHistoricalLoading: query.isLoading,
  };
}
