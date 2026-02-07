"use client";

import { useEmergencyFundMutations } from "@/features/people/hooks/useEmergencyFundMutations";
import { useEmergencyFundQuery } from "@/features/people/hooks/useEmergencyFundQuery";

/**
 * Colocated hook for emergency fund data and mutations.
 * Replaces EmergencyFundContext - use this instead of useEmergencyFund.
 */
export function useEmergencyFundData() {
  const { emergencyFund, isLoading } = useEmergencyFundQuery();
  const { updateEmergencyFund, isUpdating } = useEmergencyFundMutations();

  return {
    emergencyFund,
    isEmergencyFundLoading: isLoading,
    updateEmergencyFund,
    isUpdating,
  };
}
