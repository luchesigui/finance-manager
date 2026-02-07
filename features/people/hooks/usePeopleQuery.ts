"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/apiClient";
import type { Person } from "@/lib/types";

/**
 * Query key for people.
 */
export const PEOPLE_QUERY_KEY = ["people"] as const;

/**
 * Hook for fetching people.
 * Returns raw people data and loading state.
 */
export function usePeopleQuery() {
  const query = useQuery({
    queryKey: PEOPLE_QUERY_KEY,
    queryFn: () => fetchJson<Person[]>("/api/people"),
  });

  return {
    people: query.data ?? [],
    isLoading: query.isLoading,
    queryKey: PEOPLE_QUERY_KEY,
  };
}
