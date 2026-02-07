"use client";

import { usePeopleMutations } from "@/features/people/hooks/usePeopleMutations";
import { usePeopleQuery } from "@/features/people/hooks/usePeopleQuery";
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
