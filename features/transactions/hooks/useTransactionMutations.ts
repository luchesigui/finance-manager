"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchJson, jsonRequestInit } from "@/lib/apiClient";
import { getAccountingYearMonth } from "@/lib/dateUtils";
import type { BulkTransactionPatch, Transaction, TransactionPatch } from "@/lib/types";

/**
 * Compares transactions by creation date (descending) and ID.
 */
function compareByCreationDesc(a: Transaction, b: Transaction): number {
  const createdAtCompare = String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""));
  return createdAtCompare !== 0 ? createdAtCompare : b.id - a.id;
}

/**
 * Hook for managing transaction mutations (create, update, delete, bulk operations).
 * Handles cache updates and optimistic updates.
 */
export function useTransactionMutations(
  queryKey: readonly ["transactions", number, number],
  selectedYear: number,
  selectedMonthNumber: number,
) {
  const queryClient = useQueryClient();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: Array<Omit<Transaction, "id">>) =>
      fetchJson<Transaction[] | Transaction>(
        "/api/transactions",
        jsonRequestInit("POST", payload),
      ).then((response) => (Array.isArray(response) ? response : [response])),
    onSuccess: (created) => {
      // Filter to only transactions in the current month
      const inCurrentMonth = created.filter((transaction) => {
        const accounting = getAccountingYearMonth(transaction.date, transaction.isNextBilling);
        return accounting.year === selectedYear && accounting.month === selectedMonthNumber;
      });

      if (inCurrentMonth.length === 0) return;

      queryClient.setQueryData<Transaction[]>(queryKey, (existing = []) =>
        [...inCurrentMonth, ...existing].sort(compareByCreationDesc),
      );
    },
  });

  // Delete mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/transactions/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Transaction[]>(queryKey);
      queryClient.setQueryData<Transaction[]>(queryKey, (existing = []) =>
        existing.filter((transaction) => transaction.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: TransactionPatch }) =>
      fetchJson<Transaction>(
        `/api/transactions/${encodeURIComponent(id)}`,
        jsonRequestInit("PATCH", { patch }),
      ),
    onSuccess: () => {
      // Updates can move transactions between months; refetch all
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: ({
      ids,
      patch,
    }: {
      ids: number[];
      patch: BulkTransactionPatch;
    }) =>
      fetchJson<Transaction[]>("/api/transactions/bulk", jsonRequestInit("PATCH", { ids, patch })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  // Bulk delete mutation with optimistic update
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) =>
      fetch("/api/transactions/bulk", jsonRequestInit("DELETE", { ids })).then((res) => {
        if (!res.ok) throw new Error(`DELETE bulk failed: ${res.status}`);
      }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Transaction[]>(queryKey);
      const idsSet = new Set(ids);
      queryClient.setQueryData<Transaction[]>(queryKey, (existing = []) =>
        existing.filter((transaction) => !idsSet.has(transaction.id)),
      );
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
  });

  const createTransactions = (payload: Array<Omit<Transaction, "id">>) => {
    createMutation.mutate(payload);
  };

  const deleteTransactionById = (id: number) => deleteMutation.mutate(id);

  const updateTransactionById = (id: number, patch: TransactionPatch) =>
    updateMutation.mutate({ id, patch });

  const bulkUpdateTransactions = (ids: number[], patch: BulkTransactionPatch) =>
    bulkUpdateMutation.mutate({ ids, patch });

  const bulkDeleteTransactions = (ids: number[]) => bulkDeleteMutation.mutate(ids);

  return {
    createTransactions,
    deleteTransactionById,
    updateTransactionById,
    bulkUpdateTransactions,
    bulkDeleteTransactions,
  };
}
