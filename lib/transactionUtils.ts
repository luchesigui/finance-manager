import { addMonthsClamped, parseDateString, toDateString } from "@/lib/dateUtils";
import type { NewTransactionFormState, Transaction } from "@/lib/types";

/**
 * Builds transaction payload(s) from form state.
 * Handles single transactions and installments.
 *
 * @param formState - The form state containing transaction data
 * @param selectedMonthDate - The currently selected month date (used as fallback for date)
 * @returns Array of transaction payloads ready for API submission
 */
export function buildTransactionPayload(
  formState: NewTransactionFormState,
  selectedMonthDate: Date,
): Array<Omit<Transaction, "id">> {
  if (!formState.description || formState.amount == null) {
    return [];
  }

  // Determine base date
  let baseDateString = formState.date;
  if (!baseDateString) {
    baseDateString = toDateString(
      new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth(), 1),
    );
  }

  const isIncome = formState.type === "income";
  const categoryId = isIncome ? null : formState.categoryId;

  const payload: Array<Omit<Transaction, "id">> = [];

  if (formState.isInstallment && formState.installments > 1) {
    // Create installment transactions
    const installmentAmount = formState.amount / formState.installments;
    const baseDate = parseDateString(baseDateString);

    for (let i = 0; i < formState.installments; i++) {
      const installmentDate = addMonthsClamped(baseDate, i);
      payload.push({
        description: `${formState.description} (${i + 1}/${formState.installments})`,
        amount: installmentAmount,
        categoryId,
        paidBy: formState.paidBy,
        isRecurring: false,
        excludeFromSplit: formState.excludeFromSplit,
        isForecast: formState.isForecast,
        date: toDateString(installmentDate),
        type: formState.type,
        isIncrement: formState.isIncrement,
      });
    }
  } else {
    // Single transaction
    payload.push({
      description: formState.description,
      amount: formState.amount,
      categoryId,
      paidBy: formState.paidBy,
      isRecurring: formState.isRecurring,
      excludeFromSplit: formState.excludeFromSplit,
      isForecast: formState.isForecast,
      date: baseDateString,
      type: formState.type,
      isIncrement: formState.isIncrement,
    });
  }

  return payload;
}
