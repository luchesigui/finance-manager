"use client";

import { useCategoryMutations } from "@/components/finance/hooks/useCategoryMutations";
import { useCategoryQuery } from "@/components/finance/hooks/useCategoryQuery";
import type { CategoryPatch } from "@/lib/types";

/**
 * Colocated hook for categories data and mutations.
 * Replaces CategoriesContext - use this instead of useCategories.
 */
export function useCategoriesData() {
  const { categories, isLoading } = useCategoryQuery();
  const { updateCategoryField, updateCategories } = useCategoryMutations();

  return {
    categories,
    isCategoriesLoading: isLoading,
    updateCategoryField,
    updateCategories,
  };
}
