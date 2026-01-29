"use client";

import type React from "react";
import { createContext, useContext, useMemo } from "react";

import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { useCurrentUserQuery } from "@/components/finance/hooks/useCurrentUserQuery";
import { useDefaultPayerAutoSet } from "@/components/finance/hooks/useDefaultPayerAutoSet";
import { useDefaultPayerLogic } from "@/components/finance/hooks/useDefaultPayerLogic";
import { useDefaultPayerMutations } from "@/components/finance/hooks/useDefaultPayerMutations";
import { useDefaultPayerQuery } from "@/components/finance/hooks/useDefaultPayerQuery";
import { useOwnerPerson } from "@/components/finance/hooks/useOwnerPerson";

// ============================================================================
// Context Types
// ============================================================================

type DefaultPayerContextValue = {
  defaultPayerId: string;
  setDefaultPayerId: (personId: string) => void;
  isUpdating: boolean;
};

const DefaultPayerContext = createContext<DefaultPayerContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

export function DefaultPayerProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { people } = usePeople();
  const { currentUserId } = useCurrentUserQuery();
  const { defaultPayerId: defaultPayerIdFromDb, isLoading } = useDefaultPayerQuery();
  const ownerPerson = useOwnerPerson(people, currentUserId);
  const { setDefaultPayerId, updateDefaultPayer, isUpdating } = useDefaultPayerMutations();

  // Determine effective default payer with fallbacks
  const defaultPayerId = useDefaultPayerLogic(defaultPayerIdFromDb, people, ownerPerson);

  // Auto-set default payer to owner if not yet set
  useDefaultPayerAutoSet(
    isLoading,
    defaultPayerIdFromDb,
    ownerPerson,
    people.length,
    updateDefaultPayer,
    isUpdating,
  );

  // Wrapper for setDefaultPayerId that includes people validation
  const handleSetDefaultPayerId = useMemo(
    () => (personId: string) => setDefaultPayerId(personId, people),
    [setDefaultPayerId, people],
  );

  const contextValue = useMemo<DefaultPayerContextValue>(
    () => ({
      defaultPayerId,
      setDefaultPayerId: handleSetDefaultPayerId,
      isUpdating,
    }),
    [defaultPayerId, handleSetDefaultPayerId, isUpdating],
  );

  return (
    <DefaultPayerContext.Provider value={contextValue}>{children}</DefaultPayerContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useDefaultPayer(): DefaultPayerContextValue {
  const context = useContext(DefaultPayerContext);
  if (!context) {
    throw new Error("useDefaultPayer must be used within DefaultPayerProvider");
  }
  return context;
}
