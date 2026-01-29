"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/apiClient";
import type { CurrentUserResponse } from "@/lib/types";

/**
 * Query key for current user.
 */
export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

/**
 * Hook for fetching current user.
 * Returns user ID and loading state.
 */
export function useCurrentUserQuery() {
  const query = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => fetchJson<CurrentUserResponse>("/api/user"),
  });

  return {
    currentUserId: query.data?.userId,
    isLoading: query.isLoading,
  };
}
