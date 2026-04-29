"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/apiClient";

export function useAverageExpensesQuery() {
  const query = useQuery({
    queryKey: ["simulations", "average-expenses"],
    queryFn: () => fetchJson<{ averageExpenses: number }>("/api/simulations/average-expenses"),
    staleTime: 5 * 60 * 1000,
  });

  return {
    averageExpenses: query.data?.averageExpenses ?? 0,
    isAverageExpensesLoading: query.isLoading,
  };
}
