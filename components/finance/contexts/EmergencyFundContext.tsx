"use client";

import type React from "react";
import { createContext, useContext } from "react";

import { useEmergencyFundMutations } from "@/components/finance/hooks/useEmergencyFundMutations";
import { useEmergencyFundQuery } from "@/components/finance/hooks/useEmergencyFundQuery";

// ============================================================================
// Context Types
// ============================================================================

type EmergencyFundContextValue = {
  emergencyFund: number;
  isEmergencyFundLoading: boolean;
  updateEmergencyFund: (amount: number) => Promise<void>;
  isUpdating: boolean;
};

const EmergencyFundContext = createContext<EmergencyFundContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

export function EmergencyFundProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { emergencyFund, isLoading } = useEmergencyFundQuery();
  const { updateEmergencyFund, isUpdating } = useEmergencyFundMutations();

  const handleUpdate = async (amount: number) => {
    await updateEmergencyFund(amount);
  };

  const contextValue: EmergencyFundContextValue = {
    emergencyFund,
    isEmergencyFundLoading: isLoading,
    updateEmergencyFund: handleUpdate,
    isUpdating,
  };

  return (
    <EmergencyFundContext.Provider value={contextValue}>{children}</EmergencyFundContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useEmergencyFund(): EmergencyFundContextValue {
  const context = useContext(EmergencyFundContext);
  if (!context) {
    throw new Error("useEmergencyFund must be used within EmergencyFundProvider");
  }
  return context;
}
