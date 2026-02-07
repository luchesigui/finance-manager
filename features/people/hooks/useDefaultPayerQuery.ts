"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/apiClient";
import type { DefaultPayerResponse } from "@/lib/types";

/**
 * Query key for default payer.
 */
export const DEFAULT_PAYER_QUERY_KEY = ["defaultPayer"] as const;

/**
 * Hook for fetching default payer.
 * Returns default payer ID and loading state.
 */
export function useDefaultPayerQuery() {
  const query = useQuery({
    queryKey: DEFAULT_PAYER_QUERY_KEY,
    queryFn: () => fetchJson<DefaultPayerResponse>("/api/default-payer"),
    refetchOnMount: true,
  });

  return {
    defaultPayerId: query.data?.defaultPayerId ?? null,
    isLoading: query.isLoading,
  };
}
