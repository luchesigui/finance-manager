"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchJson } from "@/lib/apiClient";
import { EMERGENCY_FUND_QUERY_KEY } from "./useEmergencyFundQuery";

type UpdateEmergencyFundResponse = {
  success: boolean;
  emergencyFund: number;
};

/**
 * Hook for emergency fund mutations.
 */
export function useEmergencyFundMutations() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (amount: number) =>
      fetchJson<UpdateEmergencyFundResponse>("/api/emergency-fund", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(EMERGENCY_FUND_QUERY_KEY, {
        emergencyFund: data.emergencyFund,
      });
    },
  });

  return {
    updateEmergencyFund: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
