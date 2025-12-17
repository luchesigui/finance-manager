"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";

import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { getGuestDefaultPayerId, setGuestDefaultPayerId } from "@/lib/guestStorage";

async function fetchJson<T>(url: string, requestInit?: RequestInit): Promise<T> {
  const response = await fetch(url, requestInit);
  if (!response.ok) {
    throw new Error(`${requestInit?.method ?? "GET"} ${url} failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

type DefaultPayerContextValue = {
  defaultPayerId: string;
  setDefaultPayerId: (personId: string) => void;
  isUpdating: boolean;
};

const DefaultPayerContext = createContext<DefaultPayerContextValue | null>(null);

export function DefaultPayerProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { people } = usePeople();
  const queryClient = useQueryClient();

  // Get current user ID to find owner's person
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchJson<{ userId: string | null; isGuest: boolean }>("/api/user"),
  });

  const isGuest = userData?.isGuest ?? true;
  const currentUserId = !isGuest ? (userData?.userId ?? null) : null;

  // Find the owner's person (person with linkedUserId matching current user)
  const ownerPerson = useMemo(() => {
    if (!currentUserId) return null;
    return people.find((p) => p.linkedUserId === currentUserId) ?? null;
  }, [people, currentUserId]);

  // Fetch default payer from database
  const { data: defaultPayerData, isLoading } = useQuery({
    queryKey: ["defaultPayer"],
    enabled: !isGuest,
    queryFn: () => fetchJson<{ defaultPayerId: string | null }>("/api/default-payer"),
    // Always fetch fresh data when the component mounts to ensure we have the latest from DB
    refetchOnMount: true,
  });

  // Update default payer mutation
  const updateMutation = useMutation({
    mutationFn: async (personId: string) => {
      if (isGuest) {
        setGuestDefaultPayerId(personId);
        return personId;
      }
      await fetchJson<{ success: boolean }>("/api/default-payer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId }),
      });
      return personId;
    },
    onSuccess: (personId) => {
      // Update the query cache with the new default payer
      queryClient.setQueryData<{ defaultPayerId: string | null }>(["defaultPayer"], {
        defaultPayerId: personId,
      });
    },
    onError: (error) => {
      console.error("Failed to update default payer:", error);
      // Optionally show a toast notification here
    },
  });

  // Determine the effective default payer ID
  const defaultPayerId = useMemo(() => {
    if (isGuest) {
      const stored = getGuestDefaultPayerId();
      if (stored && people.some((p) => p.id === stored)) return stored;
      if (people.length > 0) {
        setGuestDefaultPayerId(people[0].id);
        return people[0].id;
      }
      return "";
    }

    // Always prioritize the database value if it exists and is valid
    if (defaultPayerData?.defaultPayerId) {
      const personExists = people.some((p) => p.id === defaultPayerData.defaultPayerId);
      if (personExists) {
        return defaultPayerData.defaultPayerId;
      }
    }

    // Only use fallbacks if query has loaded and no valid DB value exists
    // or if we're still loading and need a temporary value
    // Fall back to owner's person if available
    if (ownerPerson) {
      return ownerPerson.id;
    }

    // Fall back to first person if available
    if (people.length > 0) {
      return people[0].id;
    }

    // Default fallback (shouldn't happen in practice)
    return "";
  }, [defaultPayerData?.defaultPayerId, isGuest, people, ownerPerson]);

  // Set default payer with database persistence
  const setDefaultPayerId = useCallback(
    (personId: string) => {
      // Verify person exists
      if (!people.some((p) => p.id === personId)) {
        console.warn("Attempted to set default payer to non-existent person");
        return;
      }

      updateMutation.mutate(personId);
    },
    [people, updateMutation],
  );

  // Auto-set default payer to owner if not set and owner exists
  // Only do this once when data is loaded and no default payer is set
  useEffect(() => {
    if (isGuest) return;
    if (isLoading || !ownerPerson || updateMutation.isPending) return;
    // Only set if we don't have a default payer yet and we have people loaded
    if (!defaultPayerData?.defaultPayerId && ownerPerson && people.length > 0) {
      // Use the mutation directly to avoid infinite loops
      updateMutation.mutate(ownerPerson.id);
    }
  }, [
    isGuest,
    isLoading,
    defaultPayerData?.defaultPayerId,
    ownerPerson,
    people.length,
    updateMutation,
  ]);

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

export function useDefaultPayer(): DefaultPayerContextValue {
  const contextValue = useContext(DefaultPayerContext);
  if (!contextValue) {
    throw new Error("useDefaultPayer must be used within DefaultPayerProvider");
  }
  return contextValue;
}
