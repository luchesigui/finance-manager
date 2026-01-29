"use client";

import type React from "react";
import { createContext, useCallback, useContext, useMemo } from "react";

import { useCurrentMonth } from "@/components/finance/contexts/CurrentMonthContext";
import { useForecastInclusion } from "@/components/finance/hooks/useForecastInclusion";
import { useTransactionDerivations } from "@/components/finance/hooks/useTransactionDerivations";
import { useTransactionMutations } from "@/components/finance/hooks/useTransactionMutations";
import { useTransactionQuery } from "@/components/finance/hooks/useTransactionQuery";
import { buildTransactionPayload } from "@/lib/transactionUtils";
import type {
  BulkTransactionPatch,
  NewTransactionFormState,
  Transaction,
  TransactionPatch,
} from "@/lib/types";

// ============================================================================
// Context Types
// ============================================================================

type TransactionsContextValue = {
  transactionsForSelectedMonth: Transaction[];
  transactionsForCalculations: Transaction[];
  isTransactionsLoading: boolean;
  addTransactionsFromFormState: (formState: NewTransactionFormState) => void;
  deleteTransactionById: (transactionId: number) => void;
  updateTransactionById: (transactionId: number, patch: TransactionPatch) => void;
  isForecastIncluded: (transactionId: number) => boolean;
  setForecastInclusionOverride: (transactionId: number, include: boolean) => void;
  bulkUpdateTransactions: (ids: number[], patch: BulkTransactionPatch) => void;
  bulkDeleteTransactions: (ids: number[]) => void;
};

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

export function TransactionsProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { selectedYear, selectedMonthNumber, selectedMonthDate } = useCurrentMonth();

  // Fetch transactions
  const { transactions, isLoading, queryKey } = useTransactionQuery(
    selectedYear,
    selectedMonthNumber,
  );

  // Forecast inclusion state
  const {
    forecastInclusionOverrides,
    isForecastIncluded,
    setForecastInclusionOverride,
  } = useForecastInclusion();

  // Mutations
  const {
    createTransactions,
    deleteTransactionById,
    updateTransactionById,
    bulkUpdateTransactions,
    bulkDeleteTransactions,
  } = useTransactionMutations(queryKey, selectedYear, selectedMonthNumber);

  // Derived transaction arrays
  const { transactionsForSelectedMonth, transactionsForCalculations } =
    useTransactionDerivations(transactions, forecastInclusionOverrides);

  // Action: Add transactions from form state
  const addTransactionsFromFormState = useCallback(
    (formState: NewTransactionFormState) => {
      const payload = buildTransactionPayload(formState, selectedMonthDate);
      if (payload.length > 0) {
        createTransactions(payload);
      }
    },
    [createTransactions, selectedMonthDate],
  );

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue = useMemo<TransactionsContextValue>(
    () => ({
      transactionsForSelectedMonth,
      transactionsForCalculations,
      isTransactionsLoading: isLoading,
      addTransactionsFromFormState,
      deleteTransactionById,
      updateTransactionById,
      isForecastIncluded,
      setForecastInclusionOverride,
      bulkUpdateTransactions,
      bulkDeleteTransactions,
    }),
    [
      transactionsForSelectedMonth,
      transactionsForCalculations,
      isLoading,
      addTransactionsFromFormState,
      deleteTransactionById,
      updateTransactionById,
      isForecastIncluded,
      setForecastInclusionOverride,
      bulkUpdateTransactions,
      bulkDeleteTransactions,
    ],
  );

  return (
    <TransactionsContext.Provider value={contextValue}>{children}</TransactionsContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useTransactions(): TransactionsContextValue {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error("useTransactions must be used within TransactionsProvider");
  }
  return context;
}
