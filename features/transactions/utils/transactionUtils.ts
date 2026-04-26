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
  const isTransfer = formState.type === "transfer";
  const categoryId = isIncome || isTransfer ? null : formState.categoryId;

  const payload: Array<Omit<Transaction, "id">> = [];

  if (!isTransfer && formState.isInstallment && formState.installments > 1) {
    // Create installment transactions (not applicable to transfers)
    const installmentAmount = formState.amount / formState.installments;
    const baseDate = parseDateString(baseDateString);

    for (let i = 0; i < formState.installments; i++) {
      const installmentDate = addMonthsClamped(baseDate, i);
      payload.push({
        description: `${formState.description} (${i + 1}/${formState.installments})`,
        amount: installmentAmount,
        categoryId,
        paidBy: formState.paidBy,
        recurringTemplateId: null,
        dayOfMonth: undefined,
        isCreditCard: formState.isCreditCard,
        isNextBilling: formState.isNextBilling,
        excludeFromSplit: formState.excludeFromSplit,
        isForecast: formState.isForecast,
        date: toDateString(installmentDate),
        type: formState.type,
        isIncrement: formState.isIncrement,
        transferToPersonId: null,
      });
    }
  } else {
    // Single transaction
    payload.push({
      description: formState.description,
      amount: formState.amount,
      categoryId,
      paidBy: formState.paidBy,
      recurringTemplateId: null,
      dayOfMonth: !isTransfer && formState.isRecurring ? formState.dayOfMonth : undefined,
      isCreditCard: isTransfer ? false : formState.isCreditCard,
      isNextBilling: isTransfer ? false : formState.isNextBilling,
      excludeFromSplit: isTransfer ? false : formState.excludeFromSplit,
      isForecast: formState.isForecast,
      date: baseDateString,
      type: formState.type,
      isIncrement: formState.isIncrement,
      transferToPersonId: isTransfer ? (formState.transferToPersonId ?? null) : null,
    });
  }

  return payload;
}
