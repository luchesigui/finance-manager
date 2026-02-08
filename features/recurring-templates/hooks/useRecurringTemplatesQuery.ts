"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchJson } from "@/lib/apiClient";
import type { RecurringTemplate } from "@/lib/types";

type RecurringTemplatesResponse = {
  templates: RecurringTemplate[];
  total: number;
};

export function useRecurringTemplatesQuery(includeInactive = false) {
  const queryKey = ["recurring-templates", { includeInactive }] as const;

  const query = useQuery({
    queryKey,
    queryFn: () =>
      fetchJson<RecurringTemplatesResponse>(
        `/api/recurring-templates?includeInactive=${encodeURIComponent(includeInactive)}`,
      ),
  });

  return {
    templates: query.data?.templates ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    queryKey,
  };
}
