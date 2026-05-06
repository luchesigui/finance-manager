import { toDateString } from "@/lib/dateUtils";
import type { NewTransactionFormState } from "@/lib/types";

export function createDefaultFormState(
  categoryId: string,
  paidBy: string,
  yearMonth: string,
): NewTransactionFormState {
  const today = new Date();
  const dateStr = toDateString(today);
  return {
    description: "",
    amount: null,
    categoryId,
    paidBy,
    isRecurring: false,
    dayOfMonth: today.getDate(),
    isCreditCard: false,
    isNextBilling: false,
    dateSelectionMode: "specific",
    selectedMonth: yearMonth,
    date: dateStr,
    isInstallment: false,
    installments: 2,
    excludeFromSplit: false,
    isForecast: false,
    type: "expense",
    isIncrement: true,
    transferToPersonId: null,
    referenceDate: "",
  };
}

export function isTransactionDateInSelectedMonth(dateStr: string, yearMonth: string) {
  return dateStr.startsWith(yearMonth);
}

export function getCurrentYearMonth(selectedMonthDate: Date) {
  const year = selectedMonthDate.getFullYear();
  const month = String(selectedMonthDate.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
