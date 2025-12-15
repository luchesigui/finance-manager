"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Category, NewTransactionFormState, Person, Transaction } from "@/lib/types";

type PersonWithShare = Person & {
  sharePercent: number;
};

type CategorySummary = Category & {
  totalSpent: number;
  realPercentOfIncome: number;
};

type SettlementRow = PersonWithShare & {
  paidAmount: number;
  fairShareAmount: number;
  balance: number;
};

type FinanceContextValue = {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;

  people: Person[];
  categories: Category[];
  transactions: Transaction[];

  defaultPayerId: string;
  setDefaultPayerId: React.Dispatch<React.SetStateAction<string>>;

  addTransaction: (form: NewTransactionFormState) => void;
  deleteTransaction: (id: number) => void;

  updatePerson: <K extends keyof Person>(id: string, field: K, value: Person[K]) => void;
  updateCategory: <K extends keyof Category>(id: string, field: K, value: Category[K]) => void;

  filteredTransactions: Transaction[];
  totalIncome: number;
  peopleShare: PersonWithShare[];
  totalExpenses: number;
  categorySummary: CategorySummary[];
  settlementData: SettlementRow[];
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export function FinanceProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [defaultPayerId, setDefaultPayerId] = useState<string>("p1");

  const peopleQuery = useQuery({
    queryKey: ["people"],
    queryFn: () => apiJson<Person[]>("/api/people"),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiJson<Category[]>("/api/categories"),
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const transactionsQuery = useQuery({
    queryKey: ["transactions", year, month],
    queryFn: () =>
      apiJson<Transaction[]>(
        `/api/transactions?year=${encodeURIComponent(String(year))}&month=${encodeURIComponent(
          String(month),
        )}`,
      ),
  });

  const people = peopleQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];

  // Keep default payer valid once people load/update.
  useEffect(() => {
    if (people.length === 0) return;
    if (people.some((p) => p.id === defaultPayerId)) return;
    setDefaultPayerId(people[0].id);
  }, [people, defaultPayerId]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const [year, month] = t.date.split("-");
      return (
        Number.parseInt(year, 10) === currentDate.getFullYear() &&
        Number.parseInt(month, 10) === currentDate.getMonth() + 1
      );
    });
  }, [transactions, currentDate]);

  const totalIncome = useMemo(() => people.reduce((acc, p) => acc + p.income, 0), [people]);

  const peopleShare = useMemo(() => {
    return people.map((p) => ({
      ...p,
      sharePercent: totalIncome > 0 ? p.income / totalIncome : 0,
    }));
  }, [people, totalIncome]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [filteredTransactions]);

  const categorySummary = useMemo(() => {
    return categories.map((cat) => {
      const totalSpent = filteredTransactions
        .filter((t) => t.categoryId === cat.id)
        .reduce((acc, t) => acc + t.amount, 0);

      const realPercentOfIncome = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;

      return {
        ...cat,
        totalSpent,
        realPercentOfIncome,
      };
    });
  }, [categories, filteredTransactions, totalIncome]);

  const settlementData = useMemo(() => {
    return peopleShare.map((person) => {
      const paidAmount = filteredTransactions
        .filter((t) => t.paidBy === person.id)
        .reduce((acc, t) => acc + t.amount, 0);

      const fairShareAmount = totalExpenses * person.sharePercent;
      const balance = paidAmount - fairShareAmount;

      return {
        ...person,
        paidAmount,
        fairShareAmount,
        balance,
      };
    });
  }, [peopleShare, filteredTransactions, totalExpenses]);

  const createTransactionsMutation = useMutation({
    mutationFn: (payload: Array<Omit<Transaction, "id">>) =>
      apiJson<Transaction[] | Transaction>("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((res) => (Array.isArray(res) ? res : [res])),
    onSuccess: (created) => {
      const inViewedMonth = created.filter((t) => {
        const [ty, tm] = t.date.split("-");
        return Number.parseInt(ty, 10) === year && Number.parseInt(tm, 10) === month;
      });
      if (inViewedMonth.length === 0) return;

      queryClient.setQueryData<Transaction[]>(["transactions", year, month], (prev = []) => [
        ...inViewedMonth,
        ...prev,
      ]);
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/transactions/${encodeURIComponent(String(id))}`, { method: "DELETE" }).then(
        (res) => {
          if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
        },
      ),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["transactions", year, month] });
      const previous = queryClient.getQueryData<Transaction[]>(["transactions", year, month]);
      queryClient.setQueryData<Transaction[]>(["transactions", year, month], (prev = []) =>
        prev.filter((t) => t.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["transactions", year, month], ctx.previous);
      }
    },
  });

  const updatePersonMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Person, "id">> }) =>
      apiJson<Person>(`/api/people/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Person[]>(["people"], (prev = []) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Category, "id">> }) =>
      apiJson<Category>(`/api/categories/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Category[]>(["categories"], (prev = []) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
    },
  });

  const addTransaction = useCallback(
    (form: NewTransactionFormState) => {
      if (!form.description || !form.amount) return;

      let baseDateStr = form.date;
      if (!baseDateStr) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        baseDateStr = `${year}-${month}-01`;
      }

      const newTransactionsList: Transaction[] = [];
      const amountVal = Number.parseFloat(form.amount);

      if (form.isInstallment && form.installments > 1) {
        const installmentValue = amountVal / form.installments;
        const baseDateObj = new Date(`${baseDateStr}T12:00:00`);

        for (let i = 0; i < form.installments; i++) {
          const dateObj = new Date(baseDateObj);
          dateObj.setMonth(baseDateObj.getMonth() + i);

          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const day = String(dateObj.getDate()).padStart(2, "0");

          newTransactionsList.push({
            id: Date.now() + i,
            description: `${form.description} (${i + 1}/${form.installments})`,
            amount: installmentValue,
            categoryId: form.categoryId,
            paidBy: form.paidBy,
            isRecurring: false,
            date: `${year}-${month}-${day}`,
          });
        }
      } else {
        newTransactionsList.push({
          id: Date.now(),
          description: form.description,
          amount: amountVal,
          categoryId: form.categoryId,
          paidBy: form.paidBy,
          isRecurring: form.isRecurring,
          date: baseDateStr,
        });
      }

      createTransactionsMutation.mutate(newTransactionsList.map(({ id: _id, ...rest }) => rest));
    },
    [createTransactionsMutation, currentDate],
  );

  const deleteTransaction = useCallback(
    (id: number) => {
      deleteTransactionMutation.mutate(id);
    },
    [deleteTransactionMutation],
  );

  const updatePerson = useCallback(
    <K extends keyof Person>(id: string, field: K, value: Person[K]) => {
      updatePersonMutation.mutate({ id, patch: { [field]: value } as Partial<Omit<Person, "id">> });
    },
    [updatePersonMutation],
  );

  const updateCategory = useCallback(
    <K extends keyof Category>(id: string, field: K, value: Category[K]) => {
      updateCategoryMutation.mutate({
        id,
        patch: { [field]: value } as Partial<Omit<Category, "id">>,
      });
    },
    [updateCategoryMutation],
  );

  const value = useMemo<FinanceContextValue>(
    () => ({
      currentDate,
      setCurrentDate,
      people,
      categories,
      transactions,
      defaultPayerId,
      setDefaultPayerId,
      addTransaction,
      deleteTransaction,
      updatePerson,
      updateCategory,
      filteredTransactions,
      totalIncome,
      peopleShare,
      totalExpenses,
      categorySummary,
      settlementData,
    }),
    [
      currentDate,
      people,
      categories,
      transactions,
      defaultPayerId,
      addTransaction,
      deleteTransaction,
      updatePerson,
      updateCategory,
      filteredTransactions,
      totalIncome,
      peopleShare,
      totalExpenses,
      categorySummary,
      settlementData,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error("useFinance must be used within FinanceProvider");
  }
  return ctx;
}
