"use client";

import { useCurrentUserQuery } from "@/components/finance/hooks/useCurrentUserQuery";
import { useDefaultPayerAutoSet } from "@/components/finance/hooks/useDefaultPayerAutoSet";
import { useDefaultPayerLogic } from "@/components/finance/hooks/useDefaultPayerLogic";
import { useDefaultPayerMutations } from "@/components/finance/hooks/useDefaultPayerMutations";
import { useDefaultPayerQuery } from "@/components/finance/hooks/useDefaultPayerQuery";
import { useOwnerPerson } from "@/components/finance/hooks/useOwnerPerson";
import { usePeopleQuery } from "@/components/finance/hooks/usePeopleQuery";

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
