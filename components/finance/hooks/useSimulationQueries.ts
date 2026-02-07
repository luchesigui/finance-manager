"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchJson, jsonRequestInit } from "@/lib/apiClient";
import type { SimulationState } from "@/lib/simulationTypes";
import type { SavedSimulation } from "@/lib/types";

const SIMULATIONS_QUERY_KEY = ["simulations"] as const;

/**
 * Fetches the list of saved simulations for the household.
 */
export function useSimulationsQuery() {
  return useQuery({
    queryKey: SIMULATIONS_QUERY_KEY,
    queryFn: () => fetchJson<SavedSimulation[]>("/api/simulations"),
  });
}

/**
 * Mutation to create a new saved simulation.
 */
export function useSaveSimulationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; state: SimulationState }) =>
      fetchJson<SavedSimulation>("/api/simulations", jsonRequestInit("POST", payload)),
    onSuccess: (created) => {
      queryClient.setQueryData<SavedSimulation[]>(SIMULATIONS_QUERY_KEY, (existing = []) => [
        created,
        ...existing,
      ]);
    },
  });
}

/**
 * Mutation to update an existing simulation.
 */
export function useUpdateSimulationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, state }: { id: string; state: SimulationState }) =>
      fetchJson<SavedSimulation>(
        `/api/simulations/${encodeURIComponent(id)}`,
        jsonRequestInit("PATCH", { state }),
      ),
    onSuccess: (updated) => {
      queryClient.setQueryData<SavedSimulation[]>(SIMULATIONS_QUERY_KEY, (existing = []) =>
        existing.map((simulation) => (simulation.id === updated.id ? updated : simulation)),
      );
    },
  });
}

/**
 * Mutation to delete a simulation.
 */
export function useDeleteSimulationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/simulations/${encodeURIComponent(id)}`, { method: "DELETE" }).then((response) => {
        if (!response.ok) throw new Error(`DELETE failed: ${response.status}`);
      }),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<SavedSimulation[]>(SIMULATIONS_QUERY_KEY, (existing = []) =>
        existing.filter((simulation) => simulation.id !== id),
      );
    },
  });
}
