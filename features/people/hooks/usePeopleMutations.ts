"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PEOPLE_QUERY_KEY } from "@/features/people/hooks/usePeopleQuery";
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
    mutationFn: ({
      personId,
      patch,
    }: {
      personId: string;
      patch: PersonPatch;
    }) => fetchJson<Person>("/api/people", jsonRequestInit("PATCH", { personId, patch })),
    onSuccess: (updated) => {
      queryClient.setQueryData<Person[]>(PEOPLE_QUERY_KEY, (existing = []) =>
        existing.map((person) => (person.id === updated.id ? updated : person)),
      );
      // Invalidate transactions since income changes affect virtual income transactions
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
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
      // Invalidate transactions since new person with income creates income template
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  // Delete person mutation
  const deleteMutation = useMutation({
    mutationFn: (personId: string) =>
      fetchJson<{ success: boolean }>(`/api/people?personId=${personId}`, {
        method: "DELETE",
      }),
    onSuccess: (_, personId) => {
      queryClient.setQueryData<Person[]>(PEOPLE_QUERY_KEY, (existing = []) =>
        existing.filter((person) => person.id !== personId),
      );
      // Invalidate transactions since deleting person affects income templates
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const updatePersonField = <K extends keyof PersonPatch>(
    personId: string,
    fieldName: K,
    fieldValue: NonNullable<PersonPatch[K]>,
  ) => {
    updateMutation.mutate({
      personId,
      patch: { [fieldName]: fieldValue } as PersonPatch,
    });
  };

  const updatePeople = async (updates: Array<{ personId: string; patch: PersonPatch }>) => {
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

    // Invalidate transactions since income changes affect virtual income transactions
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const createPerson = (data: { name: string; income: number }) => createMutation.mutateAsync(data);

  const deletePerson = (personId: string) => deleteMutation.mutateAsync(personId).then(() => {});

  return {
    updatePersonField,
    updatePeople,
    createPerson,
    deletePerson,
  };
}
