"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchJson, jsonRequestInit } from "@/lib/apiClient";
import type { RecurringTemplate, RecurringTemplatePatch } from "@/lib/types";

export type RecurringTemplateDeleteScope = "template_only" | "full_history";
export type RecurringTemplateUpdateScope = "template_only" | "full_history";

export function useRecurringTemplateMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: Omit<RecurringTemplate, "id">) =>
      fetchJson<RecurringTemplate>("/api/recurring-templates", jsonRequestInit("POST", payload)),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      patch,
      scope,
    }: { id: number; patch: RecurringTemplatePatch; scope?: RecurringTemplateUpdateScope }) =>
      fetchJson<RecurringTemplate>(
        `/api/recurring-templates/${encodeURIComponent(id)}`,
        jsonRequestInit("PATCH", { patch, scope: scope ?? "template_only" }),
      ),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, scope }: { id: number; scope?: RecurringTemplateDeleteScope }) => {
      const params = new URLSearchParams();
      params.set("scope", scope ?? "template_only");
      return fetch(`/api/recurring-templates/${encodeURIComponent(id)}?${params.toString()}`, {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      });
    },
    onSuccess: invalidate,
  });

  return {
    createRecurringTemplate: (payload: Omit<RecurringTemplate, "id">) =>
      createMutation.mutate(payload),
    updateRecurringTemplate: (
      id: number,
      patch: RecurringTemplatePatch,
      options?: { scope?: RecurringTemplateUpdateScope },
    ) =>
      updateMutation.mutate({
        id,
        patch,
        scope: options?.scope ?? "template_only",
      }),
    deleteRecurringTemplate: (id: number, options?: { scope?: RecurringTemplateDeleteScope }) =>
      deleteMutation.mutate({
        id,
        scope: options?.scope ?? "template_only",
      }),
    deleteRecurringTemplateAsync: (
      id: number,
      options?: { scope?: RecurringTemplateDeleteScope },
    ) =>
      deleteMutation.mutateAsync({
        id,
        scope: options?.scope ?? "template_only",
      }),
    isDeletingRecurringTemplate: deleteMutation.isPending,
  };
}
