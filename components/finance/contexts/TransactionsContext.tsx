"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useCallback, useContext, useMemo } from "react";

import { useCurrentMonth } from "@/components/finance/contexts/CurrentMonthContext";
import { parseDateString } from "@/lib/format";
import type { NewTransactionFormState, Transaction } from "@/lib/types";

function toDateString(date: Date): string {
  const yearString = String(date.getFullYear());
  const monthString = String(date.getMonth() + 1).padStart(2, "0");
  const dayString = String(date.getDate()).padStart(2, "0");
  return `${yearString}-${monthString}-${dayString}`;
}

/**
 * Adds months to a date, clamping the day to the last day of the target month when needed.
 * Example: Jan 31 + 1 month -> Feb 28/29.
 */
function addMonthsClamped(date: Date, monthsToAdd: number): Date {
  const originalDay = date.getDate();
  const targetMonthIndex = date.getMonth() + monthsToAdd;
  const candidate = new Date(date.getFullYear(), targetMonthIndex, originalDay);

  // If month rolled over, clamp to last day of the target month.
  const expectedMonthIndex = ((targetMonthIndex % 12) + 12) % 12;
  if (candidate.getMonth() !== expectedMonthIndex) {
    return new Date(date.getFullYear(), targetMonthIndex + 1, 0);
  }

  return candidate;
}

function getAccountingYearMonth(
  dateString: string,
  isCreditCard: boolean,
): { year: number; month: number } {
  const base = parseDateString(dateString);
  const accountingDate = isCreditCard ? addMonthsClamped(base, 1) : base;
  return { year: accountingDate.getFullYear(), month: accountingDate.getMonth() + 1 };
}

function compareTransactionsByCreationDesc(a: Transaction, b: Transaction): number {
  const createdAtCompare = String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""));
  if (createdAtCompare !== 0) return createdAtCompare;
  return b.id - a.id;
}

async function fetchJson<T>(url: string, requestInit?: RequestInit): Promise<T> {
  const response = await fetch(url, requestInit);
  if (!response.ok) {
    throw new Error(`${requestInit?.method ?? "GET"} ${url} failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

type TransactionPatch = Partial<
  Pick<
    Transaction,
    | "description"
    | "amount"
    | "categoryId"
    | "paidBy"
    | "isRecurring"
    | "isCreditCard"
    | "excludeFromSplit"
    | "date"
  >
>;

type BulkTransactionPatch = Partial<
  Pick<Transaction, "categoryId" | "paidBy" | "isRecurring" | "isCreditCard" | "excludeFromSplit">
>;

type TransactionsContextValue = {
  transactionsForSelectedMonth: Transaction[];
  isTransactionsLoading: boolean;
  addTransactionsFromFormState: (newTransactionFormState: NewTransactionFormState) => void;
  deleteTransactionById: (transactionId: number) => void;
  updateTransactionById: (transactionId: number, patch: TransactionPatch) => void;
  bulkUpdateTransactions: (ids: number[], patch: BulkTransactionPatch) => void;
  bulkDeleteTransactions: (ids: number[]) => void;
};

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

export function TransactionsProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = useQueryClient();
  const { selectedYear, selectedMonthNumber, selectedMonthDate } = useCurrentMonth();

  const transactionsQueryKey = useMemo(
    () => ["transactions", selectedYear, selectedMonthNumber] as const,
    [selectedYear, selectedMonthNumber],
  );

  const transactionsQuery = useQuery({
    queryKey: transactionsQueryKey,
    queryFn: () =>
      fetchJson<Transaction[]>(
        `/api/transactions?year=${encodeURIComponent(
          String(selectedYear),
        )}&month=${encodeURIComponent(String(selectedMonthNumber))}`,
      ),
  });

  const createTransactionsMutation = useMutation({
    mutationFn: (newTransactionsPayload: Array<Omit<Transaction, "id">>) =>
      fetchJson<Transaction[] | Transaction>("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransactionsPayload),
      }).then((createdTransactionsResponse) =>
        Array.isArray(createdTransactionsResponse)
          ? createdTransactionsResponse
          : [createdTransactionsResponse],
      ),
    onSuccess: (createdTransactions) => {
      const createdTransactionsInSelectedMonth = createdTransactions.filter(
        (createdTransaction) => {
          const accounting = getAccountingYearMonth(
            createdTransaction.date,
            createdTransaction.isCreditCard,
          );
          return accounting.year === selectedYear && accounting.month === selectedMonthNumber;
        },
      );

      if (createdTransactionsInSelectedMonth.length === 0) return;

      queryClient.setQueryData<Transaction[]>(transactionsQueryKey, (existingTransactions = []) =>
        [...createdTransactionsInSelectedMonth, ...existingTransactions].sort(
          compareTransactionsByCreationDesc,
        ),
      );
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (transactionId: number) =>
      fetch(`/api/transactions/${encodeURIComponent(String(transactionId))}`, {
        method: "DELETE",
      }).then((deleteResponse) => {
        if (!deleteResponse.ok) {
          throw new Error(`DELETE /api/transactions/:id failed: ${deleteResponse.status}`);
        }
      }),
    onMutate: async (transactionId) => {
      await queryClient.cancelQueries({ queryKey: transactionsQueryKey });
      const previousTransactions = queryClient.getQueryData<Transaction[]>(transactionsQueryKey);

      queryClient.setQueryData<Transaction[]>(transactionsQueryKey, (existingTransactions = []) =>
        existingTransactions.filter((transaction) => transaction.id !== transactionId),
      );

      return { previousTransactions };
    },
    onError: (_error, _transactionId, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(transactionsQueryKey, context.previousTransactions);
      }
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({
      transactionId,
      patch,
    }: {
      transactionId: number;
      patch: TransactionPatch;
    }) =>
      fetchJson<Transaction>(`/api/transactions/${encodeURIComponent(String(transactionId))}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patch }),
      }),
    onSuccess: () => {
      // Updates can move a transaction between months; simplest is to refetch all.
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const bulkUpdateTransactionsMutation = useMutation({
    mutationFn: ({ ids, patch }: { ids: number[]; patch: BulkTransactionPatch }) =>
      fetchJson<Transaction[]>("/api/transactions/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, patch }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const bulkDeleteTransactionsMutation = useMutation({
    mutationFn: (ids: number[]) =>
      fetch("/api/transactions/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`DELETE /api/transactions/bulk failed: ${response.status}`);
        }
      }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: transactionsQueryKey });
      const previousTransactions = queryClient.getQueryData<Transaction[]>(transactionsQueryKey);

      queryClient.setQueryData<Transaction[]>(transactionsQueryKey, (existingTransactions = []) =>
        existingTransactions.filter((transaction) => !ids.includes(transaction.id)),
      );

      return { previousTransactions };
    },
    onError: (_error, _ids, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(transactionsQueryKey, context.previousTransactions);
      }
    },
  });

  const addTransactionsFromFormState = useCallback<
    TransactionsContextValue["addTransactionsFromFormState"]
  >(
    (newTransactionFormState) => {
      if (!newTransactionFormState.description || newTransactionFormState.amount == null) return;

      let baseDateString = newTransactionFormState.date;
      if (!baseDateString) {
        const yearString = String(selectedMonthDate.getFullYear());
        const monthString = String(selectedMonthDate.getMonth() + 1).padStart(2, "0");
        baseDateString = `${yearString}-${monthString}-01`;
      }

      const newTransactionsPayload: Array<Omit<Transaction, "id">> = [];
      const amountValue = newTransactionFormState.amount;

      if (newTransactionFormState.isInstallment && newTransactionFormState.installments > 1) {
        const installmentAmountValue = amountValue / newTransactionFormState.installments;
        const baseDateObject = parseDateString(baseDateString);

        for (
          let installmentIndex = 0;
          installmentIndex < newTransactionFormState.installments;
          installmentIndex++
        ) {
          const installmentDateObject = addMonthsClamped(baseDateObject, installmentIndex);

          newTransactionsPayload.push({
            description: `${newTransactionFormState.description} (${
              installmentIndex + 1
            }/${newTransactionFormState.installments})`,
            amount: installmentAmountValue,
            categoryId: newTransactionFormState.categoryId,
            paidBy: newTransactionFormState.paidBy,
            isRecurring: false,
            isCreditCard: newTransactionFormState.isCreditCard,
            excludeFromSplit: newTransactionFormState.excludeFromSplit,
            date: toDateString(installmentDateObject),
          });
        }
      } else {
        newTransactionsPayload.push({
          description: newTransactionFormState.description,
          amount: amountValue,
          categoryId: newTransactionFormState.categoryId,
          paidBy: newTransactionFormState.paidBy,
          isRecurring: newTransactionFormState.isRecurring,
          isCreditCard: newTransactionFormState.isCreditCard,
          excludeFromSplit: newTransactionFormState.excludeFromSplit,
          date: baseDateString,
        });
      }

      createTransactionsMutation.mutate(newTransactionsPayload);
    },
    [createTransactionsMutation, selectedMonthDate],
  );

  const deleteTransactionById = useCallback<TransactionsContextValue["deleteTransactionById"]>(
    (transactionId) => {
      deleteTransactionMutation.mutate(transactionId);
    },
    [deleteTransactionMutation],
  );

  const updateTransactionById = useCallback<TransactionsContextValue["updateTransactionById"]>(
    (transactionId, patch) => {
      updateTransactionMutation.mutate({ transactionId, patch });
    },
    [updateTransactionMutation],
  );

  const bulkUpdateTransactionsCallback = useCallback<
    TransactionsContextValue["bulkUpdateTransactions"]
  >(
    (ids, patch) => {
      bulkUpdateTransactionsMutation.mutate({ ids, patch });
    },
    [bulkUpdateTransactionsMutation],
  );

  const bulkDeleteTransactionsCallback = useCallback<
    TransactionsContextValue["bulkDeleteTransactions"]
  >(
    (ids) => {
      bulkDeleteTransactionsMutation.mutate(ids);
    },
    [bulkDeleteTransactionsMutation],
  );

  const contextValue = useMemo<TransactionsContextValue>(
    () => ({
      transactionsForSelectedMonth: [...(transactionsQuery.data ?? [])].sort(
        compareTransactionsByCreationDesc,
      ),
      isTransactionsLoading: transactionsQuery.isLoading,
      addTransactionsFromFormState,
      deleteTransactionById,
      updateTransactionById,
      bulkUpdateTransactions: bulkUpdateTransactionsCallback,
      bulkDeleteTransactions: bulkDeleteTransactionsCallback,
    }),
    [
      addTransactionsFromFormState,
      deleteTransactionById,
      updateTransactionById,
      bulkUpdateTransactionsCallback,
      bulkDeleteTransactionsCallback,
      transactionsQuery.data,
      transactionsQuery.isLoading,
    ],
  );

  return (
    <TransactionsContext.Provider value={contextValue}>{children}</TransactionsContext.Provider>
  );
}

export function useTransactions(): TransactionsContextValue {
  const contextValue = useContext(TransactionsContext);
  if (!contextValue) {
    throw new Error("useTransactions must be used within TransactionsProvider");
  }
  return contextValue;
}
