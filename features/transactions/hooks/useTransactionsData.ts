"use client";

import { useForecastInclusion } from "@/features/transactions/hooks/useForecastInclusion";
import { useTransactionDerivations } from "@/features/transactions/hooks/useTransactionDerivations";
import { useTransactionMutations } from "@/features/transactions/hooks/useTransactionMutations";
import { useTransactionQuery } from "@/features/transactions/hooks/useTransactionQuery";
import { buildTransactionPayload } from "@/features/transactions/utils/transactionUtils";
import { useCurrentMonth } from "@/lib/stores/currentMonthStore";
import type {
  BulkTransactionPatch,
  NewTransactionFormState,
  Transaction,
  TransactionPatch,
} from "@/lib/types";

/**
 * Colocated hook for transactions data and mutations.
 * Replaces TransactionsContext - use this instead of useTransactions.
 */
export function useTransactionsData() {
  const { selectedYear, selectedMonthNumber, selectedMonthDate } = useCurrentMonth();
  const { transactions, isLoading, queryKey } = useTransactionQuery(
    selectedYear,
    selectedMonthNumber,
  );
  const { forecastInclusionOverrides, isForecastIncluded, setForecastInclusionOverride } =
    useForecastInclusion();
  const {
    createTransactions,
    deleteTransactionById,
    updateTransactionById,
    bulkUpdateTransactions,
    bulkDeleteTransactions,
  } = useTransactionMutations(queryKey, selectedYear, selectedMonthNumber);

  const { transactionsForSelectedMonth, transactionsForCalculations } = useTransactionDerivations(
    transactions,
    forecastInclusionOverrides,
  );

  const addTransactionsFromFormState = (formState: NewTransactionFormState) => {
    const payload = buildTransactionPayload(formState, selectedMonthDate);
    if (payload.length > 0) {
      createTransactions(payload);
    }
  };

  return {
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
  };
}
