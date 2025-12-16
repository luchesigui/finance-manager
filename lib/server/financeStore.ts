import "server-only";

import type { Category, Person, Transaction } from "@/lib/types";

export type FinanceState = {
  people: Person[];
  categories: Category[];
  transactions: Transaction[];
};

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const initialState: FinanceState = {
  people: [
    { id: "p1", name: "Gui", income: 40000, color: "bg-blue-500" },
    { id: "p2", name: "Amanda", income: 12000, color: "bg-pink-500" },
  ],
  categories: [
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
  ],
  transactions: [
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
  ],
};

// NOTE: This is an in-memory store (resets on server restart / serverless cold start).
// Replace with a real database (Postgres/SQLite/etc.) for production persistence.
const globalForStore = globalThis as unknown as { __financeState?: FinanceState };

export function getState(): FinanceState {
  if (!globalForStore.__financeState) {
    globalForStore.__financeState = structuredClone(initialState);
  }
  return globalForStore.__financeState;
}

export function setState(next: FinanceState) {
  globalForStore.__financeState = next;
}
