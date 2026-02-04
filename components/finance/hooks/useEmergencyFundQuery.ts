"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/apiClient";
import type { EmergencyFundResponse } from "@/lib/types";

/**
 * Query key for emergency fund.
 */
export const EMERGENCY_FUND_QUERY_KEY = ["emergencyFund"] as const;

/**
 * Hook for fetching emergency fund.
 * Returns emergency fund amount and loading state.
 */
export function useEmergencyFundQuery() {
  const query = useQuery({
    queryKey: EMERGENCY_FUND_QUERY_KEY,
    queryFn: () => fetchJson<EmergencyFundResponse>("/api/emergency-fund"),
    refetchOnMount: true,
  });

  return {
    emergencyFund: query.data?.emergencyFund ?? 0,
    isLoading: query.isLoading,
  };
}
