"use client";

import type React from "react";
import { createContext, useContext } from "react";

import { useCategoryMutations } from "@/components/finance/hooks/useCategoryMutations";
import { useCategoryQuery } from "@/components/finance/hooks/useCategoryQuery";
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
// Provider Component
// ============================================================================

export function CategoriesProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { categories, isLoading } = useCategoryQuery();
  const { updateCategoryField, updateCategories } = useCategoryMutations();

  const contextValue: CategoriesContextValue = {
    categories,
    isCategoriesLoading: isLoading,
    updateCategoryField,
    updateCategories,
  };

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
