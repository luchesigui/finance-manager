"use client";

import { useCurrentUserQuery } from "@/features/people/hooks/useCurrentUserQuery";
import { useDefaultPayerAutoSet } from "@/features/people/hooks/useDefaultPayerAutoSet";
import { useDefaultPayerLogic } from "@/features/people/hooks/useDefaultPayerLogic";
import { useDefaultPayerMutations } from "@/features/people/hooks/useDefaultPayerMutations";
import { useDefaultPayerQuery } from "@/features/people/hooks/useDefaultPayerQuery";
import { useOwnerPerson } from "@/features/people/hooks/useOwnerPerson";
import { usePeopleQuery } from "@/features/people/hooks/usePeopleQuery";

/**
 * Colocated hook for default payer data and mutations.
 * Replaces DefaultPayerContext - use this instead of useDefaultPayer.
 */
export function useDefaultPayerData() {
  const { people } = usePeopleQuery();
  const { currentUserId } = useCurrentUserQuery();
  const { defaultPayerId: defaultPayerIdFromDb, isLoading } = useDefaultPayerQuery();
  const ownerPerson = useOwnerPerson(people, currentUserId);
  const { setDefaultPayerId, updateDefaultPayer, isUpdating } = useDefaultPayerMutations();

  const defaultPayerId = useDefaultPayerLogic(defaultPayerIdFromDb, people, ownerPerson);

  useDefaultPayerAutoSet(
    isLoading,
    defaultPayerIdFromDb,
    ownerPerson,
    people.length,
    updateDefaultPayer,
    isUpdating,
  );

  const handleSetDefaultPayerId = (personId: string) => setDefaultPayerId(personId, people);

  return {
    defaultPayerId,
    setDefaultPayerId: handleSetDefaultPayerId,
    isUpdating,
  };
}
