"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CATEGORIES_QUERY_KEY } from "@/features/categories/hooks/useCategoryQuery";
import { fetchJson, jsonRequestInit } from "@/lib/apiClient";
import type { Category, CategoryPatch } from "@/lib/types";

/**
 * Hook for managing category mutations (update, batch update).
 * Handles cache updates.
 */
export function useCategoryMutations() {
  const queryClient = useQueryClient();

  // Update single category mutation
  const updateMutation = useMutation({
    mutationFn: ({
      categoryId,
      patch,
    }: {
      categoryId: string;
      patch: CategoryPatch;
    }) => fetchJson<Category>("/api/categories", jsonRequestInit("PATCH", { categoryId, patch })),
    onSuccess: (updated) => {
      queryClient.setQueryData<Category[]>(CATEGORIES_QUERY_KEY, (existing = []) =>
        existing.map((category) => (category.id === updated.id ? updated : category)),
      );
    },
  });

  const updateCategoryField = <K extends keyof CategoryPatch>(
    categoryId: string,
    fieldName: K,
    fieldValue: NonNullable<CategoryPatch[K]>,
  ) => {
    updateMutation.mutate({
      categoryId,
      patch: { [fieldName]: fieldValue } as CategoryPatch,
    });
  };

  const updateCategories = async (updates: Array<{ categoryId: string; patch: CategoryPatch }>) => {
    // Execute all updates in parallel
    const updatedCategories = await Promise.all(
      updates.map(({ categoryId, patch }) =>
        fetchJson<Category>("/api/categories", jsonRequestInit("PATCH", { categoryId, patch })),
      ),
    );

    // Batch update the cache
    queryClient.setQueryData<Category[]>(CATEGORIES_QUERY_KEY, (existing = []) => {
      const updatedMap = new Map(updatedCategories.map((category) => [category.id, category]));
      return existing.map((category) => updatedMap.get(category.id) ?? category);
    });
  };

  return {
    updateCategoryField,
    updateCategories,
  };
}
