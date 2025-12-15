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
      fetchJson<Person>(`/api/people/${encodeURIComponent(personId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
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

  const contextValue = useMemo<PeopleContextValue>(
    () => ({
      people: peopleQuery.data ?? [],
      isPeopleLoading: peopleQuery.isLoading,
      updatePersonField,
    }),
    [peopleQuery.data, peopleQuery.isLoading, updatePersonField],
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
