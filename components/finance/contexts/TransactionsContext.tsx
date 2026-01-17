"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useCallback, useContext, useMemo } from "react";

import { useCurrentMonth } from "@/components/finance/contexts/CurrentMonthContext";
import { fetchJson, jsonRequestInit } from "@/lib/apiClient";
import {
  addMonthsClamped,
  getAccountingYearMonth,
  parseDateString,
  toDateString,
} from "@/lib/dateUtils";
import type {
  BulkTransactionPatch,
  NewTransactionFormState,
  Transaction,
  TransactionPatch,
} from "@/lib/types";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Compares transactions by creation date (descending) and ID.
 */
function compareByCreationDesc(a: Transaction, b: Transaction): number {
  const createdAtCompare = String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""));
  return createdAtCompare !== 0 ? createdAtCompare : b.id - a.id;
}

/**
 * Builds the API URL for fetching transactions.
 */
function buildTransactionsUrl(year: number, month: number): string {
  return `/api/transactions?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`;
}

// ============================================================================
// Context Types
// ============================================================================

type TransactionsContextValue = {
  transactionsForSelectedMonth: Transaction[];
  isTransactionsLoading: boolean;
  addTransactionsFromFormState: (formState: NewTransactionFormState) => void;
  deleteTransactionById: (transactionId: number) => void;
  updateTransactionById: (transactionId: number, patch: TransactionPatch) => void;
  bulkUpdateTransactions: (ids: number[], patch: BulkTransactionPatch) => void;
  bulkDeleteTransactions: (ids: number[]) => void;
};

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

export function TransactionsProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = useQueryClient();
  const { selectedYear, selectedMonthNumber, selectedMonthDate } = useCurrentMonth();

  const queryKey = useMemo(
    () => ["transactions", selectedYear, selectedMonthNumber] as const,
    [selectedYear, selectedMonthNumber],
  );

  // Fetch transactions for the selected month
  const transactionsQuery = useQuery({
    queryKey,
    queryFn: () =>
      fetchJson<Transaction[]>(buildTransactionsUrl(selectedYear, selectedMonthNumber)),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: Array<Omit<Transaction, "id">>) =>
      fetchJson<Transaction[] | Transaction>(
        "/api/transactions",
        jsonRequestInit("POST", payload),
      ).then((response) => (Array.isArray(response) ? response : [response])),
    onSuccess: (created) => {
      // Filter to only transactions in the current month
      const inCurrentMonth = created.filter((t) => {
        const accounting = getAccountingYearMonth(t.date, t.isCreditCard);
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
      fetch(`/api/transactions/${encodeURIComponent(id)}`, { method: "DELETE" }).then((res) => {
        if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Transaction[]>(queryKey);
      queryClient.setQueryData<Transaction[]>(queryKey, (existing = []) =>
        existing.filter((t) => t.id !== id),
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
    mutationFn: ({ ids, patch }: { ids: number[]; patch: BulkTransactionPatch }) =>
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
        existing.filter((t) => !idsSet.has(t.id)),
      );
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
  });

  // ============================================================================
  // Actions
  // ============================================================================

  const addTransactionsFromFormState = useCallback(
    (formState: NewTransactionFormState) => {
      if (!formState.description || formState.amount == null) return;

      // Determine base date
      let baseDateString = formState.date;
      if (!baseDateString) {
        baseDateString = toDateString(
          new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth(), 1),
        );
      }

      const isIncome = formState.type === "income";
      const categoryId = isIncome ? null : formState.categoryId;

      const payload: Array<Omit<Transaction, "id">> = [];

      if (formState.isInstallment && formState.installments > 1) {
        // Create installment transactions
        const installmentAmount = formState.amount / formState.installments;
        const baseDate = parseDateString(baseDateString);

        for (let i = 0; i < formState.installments; i++) {
          const installmentDate = addMonthsClamped(baseDate, i);
          payload.push({
            description: `${formState.description} (${i + 1}/${formState.installments})`,
            amount: installmentAmount,
            categoryId,
            paidBy: formState.paidBy,
            isRecurring: false,
            isCreditCard: formState.isCreditCard,
            excludeFromSplit: formState.excludeFromSplit,
            date: toDateString(installmentDate),
            type: formState.type,
            isIncrement: formState.isIncrement,
          });
        }
      } else {
        // Single transaction
        payload.push({
          description: formState.description,
          amount: formState.amount,
          categoryId,
          paidBy: formState.paidBy,
          isRecurring: formState.isRecurring,
          isCreditCard: formState.isCreditCard,
          excludeFromSplit: formState.excludeFromSplit,
          date: baseDateString,
          type: formState.type,
          isIncrement: formState.isIncrement,
        });
      }

      createMutation.mutate(payload);
    },
    [createMutation, selectedMonthDate],
  );

  const deleteTransactionById = useCallback(
    (id: number) => deleteMutation.mutate(id),
    [deleteMutation],
  );

  const updateTransactionById = useCallback(
    (id: number, patch: TransactionPatch) => updateMutation.mutate({ id, patch }),
    [updateMutation],
  );

  const bulkUpdateTransactionsAction = useCallback(
    (ids: number[], patch: BulkTransactionPatch) => bulkUpdateMutation.mutate({ ids, patch }),
    [bulkUpdateMutation],
  );

  const bulkDeleteTransactionsAction = useCallback(
    (ids: number[]) => bulkDeleteMutation.mutate(ids),
    [bulkDeleteMutation],
  );

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue = useMemo<TransactionsContextValue>(
    () => ({
      transactionsForSelectedMonth: [...(transactionsQuery.data ?? [])].sort(compareByCreationDesc),
      isTransactionsLoading: transactionsQuery.isLoading,
      addTransactionsFromFormState,
      deleteTransactionById,
      updateTransactionById,
      bulkUpdateTransactions: bulkUpdateTransactionsAction,
      bulkDeleteTransactions: bulkDeleteTransactionsAction,
    }),
    [
      transactionsQuery.data,
      transactionsQuery.isLoading,
      addTransactionsFromFormState,
      deleteTransactionById,
      updateTransactionById,
      bulkUpdateTransactionsAction,
      bulkDeleteTransactionsAction,
    ],
  );

  return (
    <TransactionsContext.Provider value={contextValue}>{children}</TransactionsContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useTransactions(): TransactionsContextValue {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error("useTransactions must be used within TransactionsProvider");
  }
  return context;
}
