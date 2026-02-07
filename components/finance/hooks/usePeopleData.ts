"use client";

import { usePeopleMutations } from "@/components/finance/hooks/usePeopleMutations";
import { usePeopleQuery } from "@/components/finance/hooks/usePeopleQuery";
import type { Person, PersonPatch } from "@/lib/types";

/**
 * Colocated hook for people data and mutations.
 * Replaces PeopleContext - use this instead of usePeople.
 */
export function usePeopleData() {
  const { people, isLoading } = usePeopleQuery();
  const { updatePersonField, updatePeople, createPerson, deletePerson } = usePeopleMutations();

  return {
    people,
    isPeopleLoading: isLoading,
    updatePersonField,
    updatePeople,
    createPerson,
    deletePerson,
  };
}
