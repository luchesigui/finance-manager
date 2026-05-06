import type { Transaction } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { type TransactionFilters, matchesFilters } from "../lib/filterUtils";

export function useTransactionFilters(
  selectedMonthDate: Date,
  isTransactionDateInSelectedMonth: (date: string) => boolean,
  isOutlier: (t: Transaction) => boolean,
  categories: { id: string; name: string }[],
  people: { id: string; name: string }[],
) {
  const searchParams = useSearchParams();
  const initialCategoryId = searchParams.get("categoryId");

  const [viewMode, setViewMode] = useState<"general" | "creditCard">("general");
  const [hideNextBilling, setHideNextBilling] = useState(false);
  const [paidByFilter, setPaidByFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(() => {
    if (initialCategoryId) {
      return new Set([initialCategoryId]);
    }
    return new Set();
  });
  const [typeFilter, setTypeFilter] = useState<string>("expense");
  const [creditCardFilter, setCreditCardFilter] = useState<string>("all");
  const [isNextBillingFilter, setIsNextBillingFilter] = useState<"all" | "yes" | "no">("all");
  const [recurringFilter, setRecurringFilter] = useState<"all" | "yes" | "no">("all");
  const [outlierFilter, setOutlierFilter] = useState<"all" | "yes" | "no">("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  const filters: TransactionFilters = useMemo(
    () => ({
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
    }),
    [
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
    ],
  );

  const getActiveFilterCount = () => {
    let count = 0;
    if (paidByFilter !== "all") count++;
    if (categoryFilter.size > 0) count++;
    if (viewMode === "general" && creditCardFilter !== "all") count++;
    if (isNextBillingFilter !== "all") count++;
    if (recurringFilter !== "all") count++;
    if (outlierFilter !== "all") count++;
    return count;
  };

  const getAdvancedFilterCount = () => {
    let count = 0;
    if (creditCardFilter !== "all") count++;
    if (isNextBillingFilter !== "all") count++;
    if (recurringFilter !== "all") count++;
    if (outlierFilter !== "all") count++;
    return count;
  };

  // Sync filters with data changes
  useEffect(() => {
    if (paidByFilter === "all") return;
    const stillExists = people.some((person) => person.id === paidByFilter);
    if (!stillExists) setPaidByFilter("all");
  }, [paidByFilter, people]);

  useEffect(() => {
    if (categoryFilter.size === 0) return;
    const categoryIds = new Set(categories.map((cat) => cat.id));
    const validIds = new Set(Array.from(categoryFilter).filter((id) => categoryIds.has(id)));
    if (validIds.size !== categoryFilter.size) {
      setCategoryFilter(validIds);
    }
  }, [categoryFilter, categories]);

  useEffect(() => {
    const categoryIdFromUrl = searchParams.get("categoryId");
    if (categoryIdFromUrl) {
      const categoryExists = categories.some((cat) => cat.id === categoryIdFromUrl);
      if (categoryExists) {
        setCategoryFilter((prev) => {
          if (prev.size === 1 && prev.has(categoryIdFromUrl)) return prev;
          return new Set([categoryIdFromUrl]);
        });
      }
    } else {
      setCategoryFilter((prev) => (prev.size === 0 ? prev : new Set()));
    }
  }, [searchParams, categories]);

  const matches = (transaction: Transaction) =>
    matchesFilters(
      transaction,
      filters,
      selectedMonthDate,
      isTransactionDateInSelectedMonth,
      isOutlier,
      categories,
      people,
    );

  return {
    filters,
    viewMode,
    setViewMode,
    hideNextBilling,
    setHideNextBilling,
    paidByFilter,
    setPaidByFilter,
    categoryFilter,
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    creditCardFilter,
    setCreditCardFilter,
    isNextBillingFilter,
    setIsNextBillingFilter,
    recurringFilter,
    setRecurringFilter,
    outlierFilter,
    setOutlierFilter,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    isAdvancedFiltersOpen,
    setIsAdvancedFiltersOpen,
    getActiveFilterCount,
    getAdvancedFilterCount,
    matches,
  };
}

export type UseTransactionFilters = ReturnType<typeof useTransactionFilters>;
