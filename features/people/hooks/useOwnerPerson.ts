"use client";

import type { Person } from "@/lib/types";

/**
 * Hook for finding the owner's person (linked to current user).
 */
export function useOwnerPerson(people: Person[], currentUserId: string | undefined): Person | null {
  if (!currentUserId) return null;
  return people.find((person) => person.linkedUserId === currentUserId) ?? null;
}
