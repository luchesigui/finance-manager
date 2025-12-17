"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useCallback, useContext, useMemo } from "react";

import { useCurrentMonth } from "@/components/finance/contexts/CurrentMonthContext";
import { parseDateString } from "@/lib/format";
import type { NewTransactionFormState, Transaction } from "@/lib/types";

async function fetchJson<T>(url: string, requestInit?: RequestInit): Promise<T> {
  const response = await fetch(url, requestInit);
  if (!response.ok) {
    throw new Error(`${requestInit?.method ?? "GET"} ${url} failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveTransactionForeignKeys(
  transaction: Omit<Transaction, "id">,
): Promise<Omit<Transaction, "id">> {
  let resolvedCategoryId = transaction.categoryId;
  let resolvedPaidBy = transaction.paidBy;

  // Category: if we used the guest fallback id (default:<name>), map it to the real DB category id by name.
  if (resolvedCategoryId.startsWith("default:")) {
    const categoryName = resolvedCategoryId.slice("default:".length);
    const categories = await fetchJson<Array<{ id: string; name: string }>>("/api/categories");
    const matched = categories.find((c) => c.name === categoryName);
    if (!matched) {
      throw new Error(`Unknown category "${categoryName}"`);
    }
    resolvedCategoryId = matched.id;
  }

  // If category id still isn't a UUID, refresh from the server and try to match by exact name if possible.
  if (!looksLikeUuid(resolvedCategoryId)) {
    const categories = await fetchJson<Array<{ id: string; name: string }>>("/api/categories");
    const matched = categories.find((c) => c.id === resolvedCategoryId);
    if (!matched) {
      throw new Error("Invalid category id");
    }
  }

  // Payer: if not set yet (common on first load as guest), resolve to DB default payer.
  if (!resolvedPaidBy || !looksLikeUuid(resolvedPaidBy)) {
    const { defaultPayerId } = await fetchJson<{ defaultPayerId: string | null }>(
      "/api/default-payer",
    );

    if (defaultPayerId && looksLikeUuid(defaultPayerId)) {
      resolvedPaidBy = defaultPayerId;
    } else {
      const people = await fetchJson<Array<{ id: string }>>("/api/people");
      const first = people[0]?.id;
      if (!first || !looksLikeUuid(first)) {
        throw new Error("No payer available");
      }
      resolvedPaidBy = first;
    }
  }

  return { ...transaction, categoryId: resolvedCategoryId, paidBy: resolvedPaidBy };
}

type TransactionsContextValue = {
  transactionsForSelectedMonth: Transaction[];
  isTransactionsLoading: boolean;
  addTransactionsFromFormState: (newTransactionFormState: NewTransactionFormState) => void;
  deleteTransactionById: (transactionId: number) => void;
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
    mutationFn: async (newTransactionsPayload: Array<Omit<Transaction, "id">>) => {
      const resolvedPayload = await Promise.all(
        newTransactionsPayload.map((t) => resolveTransactionForeignKeys(t)),
      );

      return fetchJson<Transaction[] | Transaction>("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resolvedPayload),
      }).then((createdTransactionsResponse) =>
        Array.isArray(createdTransactionsResponse)
          ? createdTransactionsResponse
          : [createdTransactionsResponse],
      );
    },
    onSuccess: (createdTransactions) => {
      const createdTransactionsInSelectedMonth = createdTransactions.filter(
        (createdTransaction) => {
          const [transactionYear, transactionMonth] = createdTransaction.date.split("-");
          return (
            Number.parseInt(transactionYear, 10) === selectedYear &&
            Number.parseInt(transactionMonth, 10) === selectedMonthNumber
          );
        },
      );

      if (createdTransactionsInSelectedMonth.length === 0) return;

      queryClient.setQueryData<Transaction[]>(transactionsQueryKey, (existingTransactions = []) => [
        ...createdTransactionsInSelectedMonth,
        ...existingTransactions,
      ]);
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
          const installmentDateObject = new Date(baseDateObject);
          installmentDateObject.setMonth(baseDateObject.getMonth() + installmentIndex);

          const installmentYearString = String(installmentDateObject.getFullYear());
          const installmentMonthString = String(installmentDateObject.getMonth() + 1).padStart(
            2,
            "0",
          );
          const installmentDayString = String(installmentDateObject.getDate()).padStart(2, "0");

          newTransactionsPayload.push({
            description: `${newTransactionFormState.description} (${
              installmentIndex + 1
            }/${newTransactionFormState.installments})`,
            amount: installmentAmountValue,
            categoryId: newTransactionFormState.categoryId,
            paidBy: newTransactionFormState.paidBy,
            isRecurring: false,
            date: `${installmentYearString}-${installmentMonthString}-${installmentDayString}`,
          });
        }
      } else {
        newTransactionsPayload.push({
          description: newTransactionFormState.description,
          amount: amountValue,
          categoryId: newTransactionFormState.categoryId,
          paidBy: newTransactionFormState.paidBy,
          isRecurring: newTransactionFormState.isRecurring,
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

  const contextValue = useMemo<TransactionsContextValue>(
    () => ({
      transactionsForSelectedMonth: transactionsQuery.data ?? [],
      isTransactionsLoading: transactionsQuery.isLoading,
      addTransactionsFromFormState,
      deleteTransactionById,
    }),
    [
      addTransactionsFromFormState,
      deleteTransactionById,
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
