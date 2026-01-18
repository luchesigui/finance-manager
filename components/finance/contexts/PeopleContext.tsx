"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useCallback, useContext, useMemo } from "react";

import { fetchJson, jsonRequestInit } from "@/lib/apiClient";
import type { Person, PersonPatch } from "@/lib/types";

// ============================================================================
// Context Types
// ============================================================================

type PeopleContextValue = {
  people: Person[];
  isPeopleLoading: boolean;
  updatePersonField: <K extends keyof PersonPatch>(
    personId: string,
    fieldName: K,
    fieldValue: NonNullable<PersonPatch[K]>,
  ) => void;
  updatePeople: (updates: Array<{ personId: string; patch: PersonPatch }>) => Promise<void>;
  createPerson: (data: { name: string; income: number }) => Promise<Person>;
  deletePerson: (personId: string) => Promise<void>;
};

const PeopleContext = createContext<PeopleContextValue | null>(null);

// ============================================================================
// Query Key
// ============================================================================

const PEOPLE_QUERY_KEY = ["people"] as const;

// ============================================================================
// Provider Component
// ============================================================================

export function PeopleProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = useQueryClient();

  // Fetch people
  const peopleQuery = useQuery({
    queryKey: PEOPLE_QUERY_KEY,
    queryFn: () => fetchJson<Person[]>("/api/people"),
  });

  // Update single person mutation
  const updateMutation = useMutation({
    mutationFn: ({ personId, patch }: { personId: string; patch: PersonPatch }) =>
      fetchJson<Person>("/api/people", jsonRequestInit("PATCH", { personId, patch })),
    onSuccess: (updated) => {
      queryClient.setQueryData<Person[]>(PEOPLE_QUERY_KEY, (existing = []) =>
        existing.map((person) => (person.id === updated.id ? updated : person)),
      );
    },
  });

  // Create person mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; income: number }) =>
      fetchJson<Person>("/api/people", jsonRequestInit("POST", data)),
    onSuccess: (newPerson) => {
      queryClient.setQueryData<Person[]>(PEOPLE_QUERY_KEY, (existing = []) => [
        ...existing,
        newPerson,
      ]);
    },
  });

  // Delete person mutation
  const deleteMutation = useMutation({
    mutationFn: (personId: string) =>
      fetchJson<{ success: boolean }>(`/api/people?personId=${personId}`, { method: "DELETE" }),
    onSuccess: (_, personId) => {
      queryClient.setQueryData<Person[]>(PEOPLE_QUERY_KEY, (existing = []) =>
        existing.filter((person) => person.id !== personId),
      );
    },
  });

  // ============================================================================
  // Actions
  // ============================================================================

  const updatePersonField = useCallback<PeopleContextValue["updatePersonField"]>(
    (personId, fieldName, fieldValue) => {
      updateMutation.mutate({
        personId,
        patch: { [fieldName]: fieldValue } as PersonPatch,
      });
    },
    [updateMutation],
  );

  const updatePeople = useCallback<PeopleContextValue["updatePeople"]>(
    async (updates) => {
      // Execute all updates in parallel
      const updatedPeople = await Promise.all(
        updates.map(({ personId, patch }) =>
          fetchJson<Person>("/api/people", jsonRequestInit("PATCH", { personId, patch })),
        ),
      );

      // Batch update the cache
      queryClient.setQueryData<Person[]>(PEOPLE_QUERY_KEY, (existing = []) => {
        const updatedMap = new Map(updatedPeople.map((person) => [person.id, person]));
        return existing.map((person) => updatedMap.get(person.id) ?? person);
      });
    },
    [queryClient],
  );

  const createPerson = useCallback<PeopleContextValue["createPerson"]>(
    (data) => createMutation.mutateAsync(data),
    [createMutation],
  );

  const deletePerson = useCallback<PeopleContextValue["deletePerson"]>(
    (personId) => deleteMutation.mutateAsync(personId).then(() => {}),
    [deleteMutation],
  );

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue = useMemo<PeopleContextValue>(
    () => ({
      people: peopleQuery.data ?? [],
      isPeopleLoading: peopleQuery.isLoading,
      updatePersonField,
      updatePeople,
      createPerson,
      deletePerson,
    }),
    [
      peopleQuery.data,
      peopleQuery.isLoading,
      updatePersonField,
      updatePeople,
      createPerson,
      deletePerson,
    ],
  );

  return <PeopleContext.Provider value={contextValue}>{children}</PeopleContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function usePeople(): PeopleContextValue {
  const context = useContext(PeopleContext);
  if (!context) {
    throw new Error("usePeople must be used within PeopleProvider");
  }
  return context;
}
