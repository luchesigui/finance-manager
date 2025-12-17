"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useCallback, useContext, useMemo } from "react";

import type { Person } from "@/lib/types";

async function fetchJson<T>(url: string, requestInit?: RequestInit): Promise<T> {
  const response = await fetch(url, requestInit);
  if (!response.ok) {
    throw new Error(`${requestInit?.method ?? "GET"} ${url} failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

type PeopleContextValue = {
  people: Person[];
  isPeopleLoading: boolean;
  updatePersonField: <FieldName extends keyof Person>(
    personId: string,
    fieldName: FieldName,
    fieldValue: Person[FieldName],
  ) => void;
  updatePeople: (
    updates: Array<{ personId: string; patch: Partial<Omit<Person, "id">> }>,
  ) => Promise<void>;
  createPerson: (data: { name: string; income: number }) => Promise<Person>;
  deletePerson: (personId: string) => Promise<void>;
};

const PeopleContext = createContext<PeopleContextValue | null>(null);

export function PeopleProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = useQueryClient();

  const peopleQuery = useQuery({
    queryKey: ["people"],
    queryFn: () => fetchJson<Person[]>("/api/people"),
  });

  const updatePersonMutation = useMutation({
    mutationFn: ({
      personId,
      patch,
    }: {
      personId: string;
      patch: Partial<Omit<Person, "id">>;
    }) =>
      fetchJson<Person>("/api/people", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, patch }),
      }),
    onSuccess: (updatedPerson) => {
      queryClient.setQueryData<Person[]>(["people"], (existingPeople = []) =>
        existingPeople.map((person) => (person.id === updatedPerson.id ? updatedPerson : person)),
      );
    },
  });

  const updatePersonField = useCallback<PeopleContextValue["updatePersonField"]>(
    (personId, fieldName, fieldValue) => {
      updatePersonMutation.mutate({
        personId,
        patch: { [fieldName]: fieldValue } as Partial<Omit<Person, "id">>,
      });
    },
    [updatePersonMutation],
  );

  const createPersonMutation = useMutation({
    mutationFn: (data: { name: string; income: number }) =>
      fetchJson<Person>("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (newPerson) => {
      queryClient.setQueryData<Person[]>(["people"], (existingPeople = []) => [
        ...existingPeople,
        newPerson,
      ]);
    },
  });

  const createPerson = useCallback<PeopleContextValue["createPerson"]>(
    async (data) => {
      return createPersonMutation.mutateAsync(data);
    },
    [createPersonMutation],
  );

  const deletePersonMutation = useMutation({
    mutationFn: (personId: string) =>
      fetchJson<{ success: boolean }>(`/api/people?personId=${personId}`, {
        method: "DELETE",
      }),
    onSuccess: (_, personId) => {
      queryClient.setQueryData<Person[]>(["people"], (existingPeople = []) =>
        existingPeople.filter((person) => person.id !== personId),
      );
    },
  });

  const deletePerson = useCallback<PeopleContextValue["deletePerson"]>(
    async (personId) => {
      await deletePersonMutation.mutateAsync(personId);
    },
    [deletePersonMutation],
  );

  const updatePeople = useCallback<PeopleContextValue["updatePeople"]>(
    async (updates) => {
      // Update all people sequentially
      const updatedPeople = await Promise.all(
        updates.map(({ personId, patch }) =>
          fetchJson<Person>("/api/people", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ personId, patch }),
          }),
        ),
      );

      // Update the query cache with all updated people
      queryClient.setQueryData<Person[]>(["people"], (existingPeople = []) => {
        const updatedMap = new Map(updatedPeople.map((person) => [person.id, person]));
        return existingPeople.map((person) => updatedMap.get(person.id) ?? person);
      });
    },
    [queryClient],
  );

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

export function usePeople(): PeopleContextValue {
  const contextValue = useContext(PeopleContext);
  if (!contextValue) {
    throw new Error("usePeople must be used within PeopleProvider");
  }
  return contextValue;
}
