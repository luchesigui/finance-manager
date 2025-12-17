"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { DEFAULT_CATEGORIES } from "@/lib/defaultCategories";
import { getGuestCategoryOverridesByName } from "@/lib/guestStorage";
import type { Category } from "@/lib/types";

async function fetchJson<T>(url: string, requestInit?: RequestInit): Promise<T> {
  const response = await fetch(url, requestInit);
  if (!response.ok) {
    throw new Error(`${requestInit?.method ?? "GET"} ${url} failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

type CategoriesContextValue = {
  categories: Category[];
  isCategoriesLoading: boolean;
  updateCategoryField: <FieldName extends keyof Category>(
    categoryId: string,
    fieldName: FieldName,
    fieldValue: Category[FieldName],
  ) => void;
  updateCategories: (
    updates: Array<{ categoryId: string; patch: Partial<Omit<Category, "id">> }>,
  ) => Promise<void>;
};

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchJson<{ userId: string | null; isGuest: boolean }>("/api/user"),
  });

  const isGuest = sessionQuery.data?.isGuest ?? true;

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    enabled: !isGuest,
    queryFn: () => fetchJson<Category[]>("/api/categories"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({
      categoryId,
      patch,
    }: {
      categoryId: string;
      patch: Partial<Omit<Category, "id">>;
    }) =>
      fetchJson<Category>("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, patch }),
      }),
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData<Category[]>(["categories"], (existingCategories = []) =>
        existingCategories.map((category) =>
          category.id === updatedCategory.id ? updatedCategory : category,
        ),
      );
    },
  });

  const updateCategoryField = useCallback<CategoriesContextValue["updateCategoryField"]>(
    (categoryId, fieldName, fieldValue) => {
      updateCategoryMutation.mutate({
        categoryId,
        patch: { [fieldName]: fieldValue } as Partial<Omit<Category, "id">>,
      });
    },
    [updateCategoryMutation],
  );

  const updateCategories = useCallback<CategoriesContextValue["updateCategories"]>(
    async (updates) => {
      // Update all categories sequentially
      const updatedCategories = await Promise.all(
        updates.map(({ categoryId, patch }) =>
          fetchJson<Category>("/api/categories", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoryId, patch }),
          }),
        ),
      );

      // Update the query cache with all updated categories
      queryClient.setQueryData<Category[]>(["categories"], (existingCategories = []) => {
        const updatedMap = new Map(updatedCategories.map((category) => [category.id, category]));
        return existingCategories.map((category) => updatedMap.get(category.id) ?? category);
      });
    },
    [queryClient],
  );

  const [guestOverridesByName] = useState<Record<string, number>>(() =>
    getGuestCategoryOverridesByName(),
  );

  const contextValue = useMemo<CategoriesContextValue>(() => {
    const fromApi = categoriesQuery.data ?? [];
    const baseCategories: Category[] =
      fromApi.length > 0
        ? fromApi
        : isGuest
          ? DEFAULT_CATEGORIES.map((c) => ({
              id: `default:${c.name}`,
              name: c.name,
              targetPercent: c.targetPercent,
            }))
          : [];

    const mergedCategories =
      isGuest && Object.keys(guestOverridesByName).length > 0
        ? baseCategories.map((cat) => ({
            ...cat,
            targetPercent: guestOverridesByName[cat.name] ?? cat.targetPercent,
          }))
        : baseCategories;

    return {
      categories: mergedCategories,
      isCategoriesLoading: categoriesQuery.isLoading || sessionQuery.isLoading,
      updateCategoryField,
      updateCategories,
    };
  }, [
    categoriesQuery.data,
    categoriesQuery.isLoading,
    guestOverridesByName,
    isGuest,
    sessionQuery.isLoading,
    updateCategoryField,
    updateCategories,
  ]);

  return <CategoriesContext.Provider value={contextValue}>{children}</CategoriesContext.Provider>;
}

export function useCategories(): CategoriesContextValue {
  const contextValue = useContext(CategoriesContext);
  if (!contextValue) {
    throw new Error("useCategories must be used within CategoriesProvider");
  }
  return contextValue;
}
