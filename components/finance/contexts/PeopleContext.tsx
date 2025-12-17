"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  ensureGuestPeople,
  getGuestTransactions,
  setGuestPeople,
  setGuestTransactions,
} from "@/lib/guestStorage";
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

  const sessionQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchJson<{ userId: string | null; isGuest: boolean }>("/api/user"),
  });
  const isGuest = sessionQuery.data?.isGuest ?? true;

  const [guestPeople, setGuestPeopleState] = useState<Person[]>([]);
  const [guestLoaded, setGuestLoaded] = useState(false);

  useEffect(() => {
    if (!isGuest) return;
    const people = ensureGuestPeople().map((p) => ({ ...p }) as Person);
    setGuestPeopleState(people);
    setGuestLoaded(true);
  }, [isGuest]);

  const peopleQuery = useQuery({
    queryKey: ["people"],
    enabled: !isGuest,
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
      if (isGuest) {
        setGuestPeopleState((prev) => {
          const next = prev.map((p) => (p.id === personId ? { ...p, [fieldName]: fieldValue } : p));
          setGuestPeople(next.map(({ id, name, income }) => ({ id, name, income })));
          return next;
        });
        return;
      }
      updatePersonMutation.mutate({
        personId,
        patch: { [fieldName]: fieldValue } as Partial<Omit<Person, "id">>,
      });
    },
    [isGuest, updatePersonMutation],
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
      if (isGuest) {
        const created: Person = {
          id: `g:${crypto.randomUUID()}`,
          name: data.name,
          income: data.income,
        };
        setGuestPeopleState((prev) => {
          const next = [...prev, created];
          setGuestPeople(next.map(({ id, name, income }) => ({ id, name, income })));
          return next;
        });
        return created;
      }
      return createPersonMutation.mutateAsync(data);
    },
    [isGuest, createPersonMutation],
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
      if (isGuest) {
        // Reassign guest transactions to first remaining person (or keep if none).
        setGuestPeopleState((prev) => {
          const nextPeople = prev.filter((p) => p.id !== personId);
          setGuestPeople(nextPeople.map(({ id, name, income }) => ({ id, name, income })));

          const remainingId = nextPeople[0]?.id;
          if (remainingId) {
            const txs = getGuestTransactions();
            const updatedTxs = txs.map((t) =>
              t.paidBy === personId ? { ...t, paidBy: remainingId } : t,
            );
            setGuestTransactions(updatedTxs);
          }
          return nextPeople;
        });
        return;
      }
      await deletePersonMutation.mutateAsync(personId);
    },
    [isGuest, deletePersonMutation],
  );

  const updatePeople = useCallback<PeopleContextValue["updatePeople"]>(
    async (updates) => {
      if (isGuest) {
        setGuestPeopleState((prev) => {
          const byId = new Map(prev.map((p) => [p.id, p]));
          for (const update of updates) {
            const existing = byId.get(update.personId);
            if (!existing) continue;
            byId.set(update.personId, { ...existing, ...update.patch });
          }
          const next = Array.from(byId.values());
          setGuestPeople(next.map(({ id, name, income }) => ({ id, name, income })));
          return next;
        });
        return;
      }
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
    [isGuest, queryClient],
  );

  const contextValue = useMemo<PeopleContextValue>(
    () => ({
      people: isGuest ? guestPeople : (peopleQuery.data ?? []),
      isPeopleLoading: isGuest ? !guestLoaded : peopleQuery.isLoading || sessionQuery.isLoading,
      updatePersonField,
      updatePeople,
      createPerson,
      deletePerson,
    }),
    [
      guestLoaded,
      guestPeople,
      isGuest,
      peopleQuery.data,
      peopleQuery.isLoading,
      sessionQuery.isLoading,
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
