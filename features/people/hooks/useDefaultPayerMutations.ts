"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DEFAULT_PAYER_QUERY_KEY } from "@/features/people/hooks/useDefaultPayerQuery";
import { fetchJson, jsonRequestInit } from "@/lib/apiClient";
import type { DefaultPayerResponse } from "@/lib/types";

/**
 * Hook for managing default payer mutations.
 * Handles cache updates.
 */
export function useDefaultPayerMutations() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (personId: string) => {
      await fetchJson<{ success: boolean }>(
        "/api/default-payer",
        jsonRequestInit("PATCH", { personId }),
      );
      return personId;
    },
    onSuccess: (personId) => {
      queryClient.setQueryData<DefaultPayerResponse>(DEFAULT_PAYER_QUERY_KEY, {
        defaultPayerId: personId,
      });
    },
    onError: (error) => {
      console.error("Failed to update default payer:", error);
    },
  });

  const setDefaultPayerId = (personId: string, people: Array<{ id: string }>) => {
    const exists = people.some((person) => person.id === personId);
    if (!exists) {
      console.warn("Attempted to set default payer to non-existent person");
      return;
    }
    updateMutation.mutate(personId);
  };

  return {
    setDefaultPayerId,
    updateDefaultPayer: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateMutation,
  };
}
