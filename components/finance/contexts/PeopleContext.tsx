"use client";

import type React from "react";
import { createContext, useContext, useMemo } from "react";

import { usePeopleMutations } from "@/components/finance/hooks/usePeopleMutations";
import { usePeopleQuery } from "@/components/finance/hooks/usePeopleQuery";
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
// Provider Component
// ============================================================================

export function PeopleProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { people, isLoading } = usePeopleQuery();
  const { updatePersonField, updatePeople, createPerson, deletePerson } = usePeopleMutations();

  const contextValue = useMemo<PeopleContextValue>(
    () => ({
      people,
      isPeopleLoading: isLoading,
      updatePersonField,
      updatePeople,
      createPerson,
      deletePerson,
    }),
    [people, isLoading, updatePersonField, updatePeople, createPerson, deletePerson],
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
