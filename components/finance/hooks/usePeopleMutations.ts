"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { PEOPLE_QUERY_KEY } from "@/components/finance/hooks/usePeopleQuery";
import { fetchJson, jsonRequestInit } from "@/lib/apiClient";
import type { Person, PersonPatch } from "@/lib/types";

/**
 * Hook for managing people mutations (create, update, delete, batch update).
 * Handles cache updates.
 */
export function usePeopleMutations() {
  const queryClient = useQueryClient();

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

  const updatePersonField = useCallback<
    <K extends keyof PersonPatch>(
      personId: string,
      fieldName: K,
      fieldValue: NonNullable<PersonPatch[K]>,
    ) => void
  >(
    (personId, fieldName, fieldValue) => {
      updateMutation.mutate({
        personId,
        patch: { [fieldName]: fieldValue } as PersonPatch,
      });
    },
    [updateMutation],
  );

  const updatePeople = useCallback(
    async (updates: Array<{ personId: string; patch: PersonPatch }>) => {
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

  const createPerson = useCallback(
    (data: { name: string; income: number }) => createMutation.mutateAsync(data),
    [createMutation],
  );

  const deletePerson = useCallback(
    (personId: string) => deleteMutation.mutateAsync(personId).then(() => {}),
    [deleteMutation],
  );

  return {
    updatePersonField,
    updatePeople,
    createPerson,
    deletePerson,
  };
}
