"use client";

import { useRecurringTemplateMutations } from "@/features/recurring-templates/hooks/useRecurringTemplateMutations";
import { useRecurringTemplatesQuery } from "@/features/recurring-templates/hooks/useRecurringTemplatesQuery";

export function useRecurringTemplatesData(includeInactive = false) {
  const { templates, total, isLoading } = useRecurringTemplatesQuery(includeInactive);
  const { createRecurringTemplate, updateRecurringTemplate, deleteRecurringTemplate } =
    useRecurringTemplateMutations();

  return {
    templates,
    total,
    isLoading,
    createRecurringTemplate,
    updateRecurringTemplate,
    deleteRecurringTemplate,
  };
}
