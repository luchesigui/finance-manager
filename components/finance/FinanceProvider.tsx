"use client";

import type React from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

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

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const INITIAL_PEOPLE: Person[] = [
  { id: "p1", name: "Gui", income: 40000, color: "bg-blue-500" },
  { id: "p2", name: "Amanda", income: 12000, color: "bg-pink-500" },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: "c1", name: "Custos Fixos", targetPercent: 25, color: "text-red-600" },
  { id: "c2", name: "Conforto", targetPercent: 15, color: "text-purple-600" },
  { id: "c3", name: "Metas", targetPercent: 15, color: "text-green-600" },
  { id: "c4", name: "Prazeres", targetPercent: 10, color: "text-yellow-600" },
  {
    id: "c5",
    name: "Liberdade Financeira",
    targetPercent: 30,
    color: "text-indigo-600",
  },
  { id: "c6", name: "Conhecimento", targetPercent: 5, color: "text-cyan-600" },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    description: "Aluguel",
    amount: 4100,
    categoryId: "c1",
    paidBy: "p1",
    isRecurring: true,
    date: new Date(currentYear, currentMonth, 1).toISOString().split("T")[0],
  },
  {
    id: 2,
    description: "Condomínio",
    amount: 1025,
    categoryId: "c1",
    paidBy: "p1",
    isRecurring: true,
    date: new Date(currentYear, currentMonth, 5).toISOString().split("T")[0],
  },
  {
    id: 3,
    description: "Terapia Amanda",
    amount: 1200,
    categoryId: "c1",
    paidBy: "p2",
    isRecurring: true,
    date: new Date(currentYear, currentMonth, 10).toISOString().split("T")[0],
  },
  {
    id: 4,
    description: "Escola da Chiara",
    amount: 500,
    categoryId: "c2",
    paidBy: "p1",
    isRecurring: true,
    date: new Date(currentYear, currentMonth, 15).toISOString().split("T")[0],
  },
  {
    id: 5,
    description: "Mercado Mensal",
    amount: 800,
    categoryId: "c1",
    paidBy: "p1",
    isRecurring: false,
    date: new Date(currentYear, currentMonth - 1, 10).toISOString().split("T")[0],
  },
];

export function FinanceProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [defaultPayerId, setDefaultPayerId] = useState<string>("p1");

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

      setTransactions((prev) => [...newTransactionsList, ...prev]);
    },
    [currentDate],
  );

  const deleteTransaction = useCallback((id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updatePerson = useCallback(
    <K extends keyof Person>(id: string, field: K, value: Person[K]) => {
      setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    },
    [],
  );

  const updateCategory = useCallback(
    <K extends keyof Category>(id: string, field: K, value: Category[K]) => {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
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
