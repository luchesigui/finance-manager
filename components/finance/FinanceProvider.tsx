"use client";

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

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: "GET" });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

async function apiDelete(path: string): Promise<void> {
  const res = await fetch(path, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
}

export function FinanceProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [people, setPeople] = useState<Person[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [defaultPayerId, setDefaultPayerId] = useState<string>("p1");

  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        const [peopleData, categoriesData] = await Promise.all([
          apiGet<Person[]>("/api/people"),
          apiGet<Category[]>("/api/categories"),
        ]);

        if (isCancelled) return;
        setPeople(peopleData);
        setCategories(categoriesData);

        setDefaultPayerId((prev) => {
          if (peopleData.length === 0) return prev;
          return peopleData.some((p) => p.id === prev) ? prev : peopleData[0].id;
        });
      } catch (error) {
        console.error("Failed to load people/categories", error);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const txs = await apiGet<Transaction[]>(
          `/api/transactions?year=${encodeURIComponent(String(year))}&month=${encodeURIComponent(
            String(month),
          )}`,
        );
        if (isCancelled) return;
        setTransactions(txs);
      } catch (error) {
        console.error("Failed to load transactions", error);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [currentDate]);

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

      (async () => {
        try {
          const created = await apiPost<Transaction[]>(
            "/api/transactions",
            newTransactionsList.map(({ id: _id, ...rest }) => rest),
          );

          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1;
          const inCurrentMonth = created.filter((t) => {
            const [ty, tm] = t.date.split("-");
            return Number.parseInt(ty, 10) === year && Number.parseInt(tm, 10) === month;
          });

          if (inCurrentMonth.length > 0) {
            setTransactions((prev) => [...inCurrentMonth, ...prev]);
          }
        } catch (error) {
          console.error("Failed to create transactions", error);
        }
      })();
    },
    [currentDate],
  );

  const deleteTransaction = useCallback((id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    (async () => {
      try {
        await apiDelete(`/api/transactions/${encodeURIComponent(String(id))}`);
      } catch (error) {
        console.error("Failed to delete transaction", error);
      }
    })();
  }, []);

  const updatePerson = useCallback(
    <K extends keyof Person>(id: string, field: K, value: Person[K]) => {
      setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
      (async () => {
        try {
          await apiPatch<Person>(`/api/people/${encodeURIComponent(id)}`, { [field]: value });
        } catch (error) {
          console.error("Failed to update person", error);
        }
      })();
    },
    [],
  );

  const updateCategory = useCallback(
    <K extends keyof Category>(id: string, field: K, value: Category[K]) => {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
      (async () => {
        try {
          await apiPatch<Category>(`/api/categories/${encodeURIComponent(id)}`, {
            [field]: value,
          });
        } catch (error) {
          console.error("Failed to update category", error);
        }
      })();
    },
    [],
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
