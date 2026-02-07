"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/apiClient";
import type { Category } from "@/lib/types";

/**
 * Query key for categories.
 */
export const CATEGORIES_QUERY_KEY = ["categories"] as const;

/**
 * Hook for fetching categories.
 * Returns raw category data and loading state.
 */
export function useCategoryQuery() {
  const query = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => fetchJson<Category[]>("/api/categories"),
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    queryKey: CATEGORIES_QUERY_KEY,
  };
}
