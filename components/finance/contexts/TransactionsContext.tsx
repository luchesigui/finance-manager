"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useCurrentMonth } from "@/components/finance/contexts/CurrentMonthContext";
import { parseDateString } from "@/lib/format";
import { getGuestTransactions, setGuestTransactions } from "@/lib/guestStorage";
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

  const sessionQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => fetchJson<{ userId: string | null; isGuest: boolean }>("/api/user"),
  });
  const isGuest = sessionQuery.data?.isGuest ?? true;

  const transactionsQueryKey = useMemo(
    () => ["transactions", selectedYear, selectedMonthNumber] as const,
    [selectedYear, selectedMonthNumber],
  );

  const transactionsQuery = useQuery({
    queryKey: transactionsQueryKey,
    enabled: !isGuest,
    queryFn: () =>
      fetchJson<Transaction[]>(
        `/api/transactions?year=${encodeURIComponent(
          String(selectedYear),
        )}&month=${encodeURIComponent(String(selectedMonthNumber))}`,
      ),
  });

  const [guestAllTransactions, setGuestAllTransactions] = useState<Transaction[]>([]);
  const [guestLoaded, setGuestLoaded] = useState(false);

  useEffect(() => {
    if (!isGuest) return;
    setGuestAllTransactions(getGuestTransactions());
    setGuestLoaded(true);
  }, [isGuest]);

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

  const guestTransactionsForSelectedMonth = useMemo(() => {
    if (!isGuest) return [];

    const monthStart = new Date(Date.UTC(selectedYear, selectedMonthNumber - 1, 1))
      .toISOString()
      .split("T")[0];
    const monthEnd = new Date(Date.UTC(selectedYear, selectedMonthNumber, 0))
      .toISOString()
      .split("T")[0];

    const inMonth = guestAllTransactions.filter((t) => t.date >= monthStart && t.date <= monthEnd);
    const recurring = guestAllTransactions.filter((t) => t.isRecurring && t.date < monthStart);

    const virtualTransactions = recurring.map((t) => {
      const originalDate = new Date(t.date);
      const day = originalDate.getUTCDate();
      const targetDate = new Date(Date.UTC(selectedYear, selectedMonthNumber - 1, day));
      if (targetDate.getUTCMonth() !== selectedMonthNumber - 1) {
        const lastDayOfMonth = new Date(Date.UTC(selectedYear, selectedMonthNumber, 0));
        targetDate.setUTCFullYear(lastDayOfMonth.getUTCFullYear());
        targetDate.setUTCMonth(lastDayOfMonth.getUTCMonth());
        targetDate.setUTCDate(lastDayOfMonth.getUTCDate());
      }
      return { ...t, date: targetDate.toISOString().split("T")[0] };
    });

    const all = [...inMonth, ...virtualTransactions];
    all.sort((a, b) => b.date.localeCompare(a.date));
    return all;
  }, [guestAllTransactions, isGuest, selectedMonthNumber, selectedYear]);

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

      if (isGuest) {
        const createdNow = newTransactionsPayload.map((t) => ({
          ...t,
          id: Date.now() + Math.floor(Math.random() * 1000),
        }));
        setGuestAllTransactions((prev) => {
          const nextAll = [...createdNow, ...prev];
          setGuestTransactions(nextAll);
          return nextAll;
        });
        return;
      }

      createTransactionsMutation.mutate(newTransactionsPayload);
    },
    [createTransactionsMutation, isGuest, selectedMonthDate],
  );

  const deleteTransactionById = useCallback<TransactionsContextValue["deleteTransactionById"]>(
    (transactionId) => {
      if (isGuest) {
        setGuestAllTransactions((prev) => {
          const next = prev.filter((t) => t.id !== transactionId);
          setGuestTransactions(next);
          return next;
        });
        return;
      }
      deleteTransactionMutation.mutate(transactionId);
    },
    [deleteTransactionMutation, isGuest],
  );

  const contextValue = useMemo<TransactionsContextValue>(
    () => ({
      transactionsForSelectedMonth: isGuest
        ? guestTransactionsForSelectedMonth
        : (transactionsQuery.data ?? []),
      isTransactionsLoading: isGuest
        ? !guestLoaded
        : transactionsQuery.isLoading || sessionQuery.isLoading,
      addTransactionsFromFormState,
      deleteTransactionById,
    }),
    [
      addTransactionsFromFormState,
      deleteTransactionById,
      guestLoaded,
      guestTransactionsForSelectedMonth,
      isGuest,
      sessionQuery.isLoading,
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
