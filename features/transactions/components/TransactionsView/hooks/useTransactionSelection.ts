import type { Transaction } from "@/lib/types";
import { useState } from "react";

export function useTransactionSelection(visibleTransactions: Transaction[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
    setIsSelectionMode(!isSelectionMode);
  };

  const toggleTransactionSelection = (transactionId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(transactionId)) {
        next.delete(transactionId);
      } else {
        next.add(transactionId);
      }
      return next;
    });
  };

  const selectAllVisibleTransactions = () => {
    const visibleIds = visibleTransactions.map((transaction) => transaction.id);
    setSelectedIds(new Set(visibleIds));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const hasRecurringSelection = visibleTransactions.some(
    (transaction) => selectedIds.has(transaction.id) && transaction.recurringTemplateId != null,
  );

  return {
    selectedIds,
    setSelectedIds,
    isSelectionMode,
    setIsSelectionMode,
    toggleSelectionMode,
    toggleTransactionSelection,
    selectAllVisibleTransactions,
    clearSelection,
    hasRecurringSelection,
  };
}

export type UseTransactionSelection = ReturnType<typeof useTransactionSelection>;
