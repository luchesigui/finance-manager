"use client";

import { useMemo } from "react";

import type { Person } from "@/lib/types";

/**
 * Hook for determining the effective default payer ID with fallbacks.
 * Priority: 1) Valid database value, 2) Owner's person, 3) First person
 */
export function useDefaultPayerLogic(
  defaultPayerIdFromDb: string | null,
  people: Person[],
  ownerPerson: Person | null,
): string {
  return useMemo(() => {
    // Priority 1: Valid database value
    if (defaultPayerIdFromDb) {
      const exists = people.some((person) => person.id === defaultPayerIdFromDb);
      if (exists) return defaultPayerIdFromDb;
    }

    // Priority 2: Owner's person
    if (ownerPerson) return ownerPerson.id;

    // Priority 3: First person
    if (people.length > 0) return people[0].id;

    // Fallback (shouldn't happen in practice)
    return "";
  }, [defaultPayerIdFromDb, people, ownerPerson]);
}
