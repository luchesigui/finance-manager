"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";

import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { fetchJson, jsonRequestInit } from "@/lib/apiClient";
import type { CurrentUserResponse, DefaultPayerResponse } from "@/lib/types";

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
// Query Keys
// ============================================================================

const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;
const DEFAULT_PAYER_QUERY_KEY = ["defaultPayer"] as const;

// ============================================================================
// Provider Component
// ============================================================================

export function DefaultPayerProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { people } = usePeople();
  const queryClient = useQueryClient();

  // Fetch current user ID
  const { data: userData } = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => fetchJson<CurrentUserResponse>("/api/user"),
  });

  const currentUserId = userData?.userId;

  // Find the owner's person (linked to current user)
  const ownerPerson = useMemo(() => {
    if (!currentUserId) return null;
    return people.find((person) => person.linkedUserId === currentUserId) ?? null;
  }, [people, currentUserId]);

  // Fetch default payer from database
  const { data: defaultPayerData, isLoading } = useQuery({
    queryKey: DEFAULT_PAYER_QUERY_KEY,
    queryFn: () => fetchJson<DefaultPayerResponse>("/api/default-payer"),
    refetchOnMount: true,
  });

  // Update default payer mutation
  const updateMutation = useMutation({
    mutationFn: async (personId: string) => {
      await fetchJson<{ success: boolean }>(
        "/api/default-payer",
        jsonRequestInit("PATCH", { personId }),
      );
      return personId;
    },
    onSuccess: (personId) => {
      queryClient.setQueryData<DefaultPayerResponse>(DEFAULT_PAYER_QUERY_KEY, {
        defaultPayerId: personId,
      });
    },
    onError: (error) => {
      console.error("Failed to update default payer:", error);
    },
  });

  // Determine the effective default payer ID with fallbacks
  const defaultPayerId = useMemo(() => {
    // Priority 1: Valid database value
    if (defaultPayerData?.defaultPayerId) {
      const exists = people.some((person) => person.id === defaultPayerData.defaultPayerId);
      if (exists) return defaultPayerData.defaultPayerId;
    }

    // Priority 2: Owner's person
    if (ownerPerson) return ownerPerson.id;

    // Priority 3: First person
    if (people.length > 0) return people[0].id;

    // Fallback (shouldn't happen in practice)
    return "";
  }, [defaultPayerData?.defaultPayerId, people, ownerPerson]);

  // Set default payer with validation
  const setDefaultPayerId = useCallback(
    (personId: string) => {
      const exists = people.some((person) => person.id === personId);
      if (!exists) {
        console.warn("Attempted to set default payer to non-existent person");
        return;
      }
      updateMutation.mutate(personId);
    },
    [people, updateMutation],
  );

  // Auto-set default payer to owner if not yet set
  useEffect(() => {
    if (isLoading || !ownerPerson || updateMutation.isPending) return;

    if (!defaultPayerData?.defaultPayerId && people.length > 0) {
      updateMutation.mutate(ownerPerson.id);
    }
  }, [isLoading, defaultPayerData?.defaultPayerId, ownerPerson, people.length, updateMutation]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue = useMemo<DefaultPayerContextValue>(
    () => ({
      defaultPayerId,
      setDefaultPayerId,
      isUpdating: updateMutation.isPending,
    }),
    [defaultPayerId, setDefaultPayerId, updateMutation.isPending],
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
