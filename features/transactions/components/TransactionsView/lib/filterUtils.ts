import type { Transaction } from "@/lib/types";
import { fuzzyMatch } from "../fuzzyMatch";

export interface TransactionFilters {
  viewMode: "general" | "creditCard";
  hideNextBilling: boolean;
  paidByFilter: string;
  categoryFilter: Set<string>;
  typeFilter: string;
  creditCardFilter: string;
  isNextBillingFilter: "all" | "yes" | "no";
  searchQuery: string;
  outlierFilter: "all" | "yes" | "no";
  recurringFilter: "all" | "yes" | "no";
}

export function matchesFilters(
  transaction: Transaction,
  filters: TransactionFilters,
  selectedMonthDate: Date,
  isTransactionDateInSelectedMonth: (date: string) => boolean,
  isOutlier: (t: Transaction) => boolean,
  categories: { id: string; name: string }[],
  people: { id: string; name: string }[],
) {
  const {
    viewMode,
    hideNextBilling,
    paidByFilter,
    categoryFilter,
    typeFilter,
    creditCardFilter,
    isNextBillingFilter,
    searchQuery,
    outlierFilter,
    recurringFilter,
  } = filters;

  // Credit card view: filter by actual date and isCreditCard
  if (viewMode === "creditCard") {
    if (!transaction.isCreditCard) return false;

    // Current = selected month (all) OR previous month with isNextBilling (current bill)
    const txDate = new Date(`${transaction.date}T00:00:00`);
    const txYear = txDate.getFullYear();
    const txMonth = txDate.getMonth() + 1;
    const selYear = selectedMonthDate.getFullYear();
    const selMonth = selectedMonthDate.getMonth() + 1;
    const inSelectedMonth = txYear === selYear && txMonth === selMonth;
    const prevMonthDate = new Date(selYear, selMonth - 2, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth() + 1;
    const inPrevMonthAndNextBilling =
      txYear === prevYear && txMonth === prevMonth && transaction.isNextBilling;
    if (!inSelectedMonth && !inPrevMonthAndNextBilling) return false;

    // Hide next billing toggle
    if (hideNextBilling && transaction.isNextBilling) return false;
  }

  // General view: hide current-month + next-billing credit card transactions (they only show in credit card mode)
  if (
    viewMode === "general" &&
    transaction.isCreditCard &&
    transaction.isNextBilling &&
    isTransactionDateInSelectedMonth(transaction.date)
  ) {
    return false;
  }

  if (paidByFilter !== "all" && transaction.paidBy !== paidByFilter) return false;
  if (typeFilter !== "all" && transaction.type !== typeFilter) return false;

  // Multi-category filter
  if (categoryFilter.size > 0) {
    if (transaction.categoryId === null) return false;
    if (!categoryFilter.has(transaction.categoryId)) return false;
  }

  // Credit card filter (only in general view)
  if (viewMode === "general" && creditCardFilter !== "all") {
    const isCreditCard = creditCardFilter === "yes";
    if (transaction.isCreditCard !== isCreditCard) return false;
  }

  // Next billing filter: "yes" = ocultar gastos da próxima fatura (hide is_next_billing transactions)
  if (isNextBillingFilter === "yes" && transaction.isNextBilling) return false;

  // Fuzzy search filter
  if (searchQuery.trim()) {
    const category = categories.find((cat) => cat.id === transaction.categoryId);
    const person = people.find((pers) => pers.id === transaction.paidBy);
    const searchableText = [
      transaction.description,
      category?.name ?? "",
      person?.name ?? "",
      transaction.date,
    ].join(" ");
    if (!fuzzyMatch(searchableText, searchQuery)) return false;
  }

  // Outlier filter
  if (outlierFilter !== "all") {
    const isOutlierTransaction = isOutlier(transaction);
    if (outlierFilter === "yes" && !isOutlierTransaction) return false;
    if (outlierFilter === "no" && isOutlierTransaction) return false;
  }

  // Recurring filter
  if (recurringFilter !== "all") {
    const isRecurring = transaction.recurringTemplateId != null;
    if (recurringFilter === "yes" && !isRecurring) return false;
    if (recurringFilter === "no" && isRecurring) return false;
  }

  return true;
}
