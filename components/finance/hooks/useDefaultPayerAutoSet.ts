"use client";

import { useEffect } from "react";

/**
 * Hook for auto-setting default payer to owner if not yet set.
 * Only runs when conditions are met (not loading, owner exists, no pending mutation).
 */
export function useDefaultPayerAutoSet(
  isLoading: boolean,
  defaultPayerIdFromDb: string | null,
  ownerPerson: { id: string } | null,
  peopleCount: number,
  updateDefaultPayer: (personId: string) => void,
  isUpdating: boolean,
) {
  useEffect(() => {
    if (isLoading || !ownerPerson || isUpdating) return;

    if (!defaultPayerIdFromDb && peopleCount > 0) {
      updateDefaultPayer(ownerPerson.id);
    }
  }, [isLoading, defaultPayerIdFromDb, ownerPerson, peopleCount, updateDefaultPayer, isUpdating]);
}
