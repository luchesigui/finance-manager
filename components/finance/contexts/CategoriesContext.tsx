"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useCallback, useContext, useMemo } from "react";

import { fetchJson, jsonRequestInit } from "@/lib/apiClient";
import type { Category, CategoryPatch } from "@/lib/types";

// ============================================================================
// Context Types
// ============================================================================

type CategoriesContextValue = {
  categories: Category[];
  isCategoriesLoading: boolean;
  updateCategoryField: <K extends keyof CategoryPatch>(
    categoryId: string,
    fieldName: K,
    fieldValue: NonNullable<CategoryPatch[K]>,
  ) => void;
  updateCategories: (updates: Array<{ categoryId: string; patch: CategoryPatch }>) => Promise<void>;
};

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

// ============================================================================
// Query Key
// ============================================================================

const CATEGORIES_QUERY_KEY = ["categories"] as const;

// ============================================================================
// Provider Component
// ============================================================================

export function CategoriesProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = useQueryClient();

  // Fetch categories
  const categoriesQuery = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => fetchJson<Category[]>("/api/categories"),
  });

  // Update single category mutation
  const updateMutation = useMutation({
    mutationFn: ({ categoryId, patch }: { categoryId: string; patch: CategoryPatch }) =>
      fetchJson<Category>("/api/categories", jsonRequestInit("PATCH", { categoryId, patch })),
    onSuccess: (updated) => {
      queryClient.setQueryData<Category[]>(CATEGORIES_QUERY_KEY, (existing = []) =>
        existing.map((category) => (category.id === updated.id ? updated : category)),
      );
    },
  });

  // ============================================================================
  // Actions
  // ============================================================================

  const updateCategoryField = useCallback<CategoriesContextValue["updateCategoryField"]>(
    (categoryId, fieldName, fieldValue) => {
      updateMutation.mutate({
        categoryId,
        patch: { [fieldName]: fieldValue } as CategoryPatch,
      });
    },
    [updateMutation],
  );

  const updateCategories = useCallback<CategoriesContextValue["updateCategories"]>(
    async (updates) => {
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
    },
    [queryClient],
  );

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue = useMemo<CategoriesContextValue>(
    () => ({
      categories: categoriesQuery.data ?? [],
      isCategoriesLoading: categoriesQuery.isLoading,
      updateCategoryField,
      updateCategories,
    }),
    [categoriesQuery.data, categoriesQuery.isLoading, updateCategoryField, updateCategories],
  );

  return <CategoriesContext.Provider value={contextValue}>{children}</CategoriesContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useCategories(): CategoriesContextValue {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within CategoriesProvider");
  }
  return context;
}
