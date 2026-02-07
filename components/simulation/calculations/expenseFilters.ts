import type { RecurringExpenseItem } from "@/lib/simulationTypes";
import type { Category, Transaction } from "@/lib/types";

// ============================================================================
// Constants
// ============================================================================

const LIBERDADE_FINANCEIRA_CATEGORY = "Liberdade Financeira";

// ============================================================================
// Functions
// ============================================================================

/**
 * Filters transactions to exclude:
 * - Transactions in "Liberdade Financeira" category
 * - Transactions without any category
 */
export function filterValidExpenseTransactions(
  transactions: Transaction[],
  categories: Category[],
): Transaction[] {
  const liberdadeCategory = categories.find(
    (category) => category.name === LIBERDADE_FINANCEIRA_CATEGORY,
  );
  const liberdadeCategoryId = liberdadeCategory?.id;

  return transactions.filter((transaction) => {
    if (transaction.type === "income") return false;
    if (!transaction.categoryId) return false;
    if (liberdadeCategoryId && transaction.categoryId === liberdadeCategoryId) return false;
    return true;
  });
}

/**
 * Groups recurring expense transactions by description and returns average amounts.
 */
export function buildRecurringExpenses(transactions: Transaction[]): RecurringExpenseItem[] {
  const expenseTransactions = transactions.filter((transaction) => transaction.isRecurring);

  const grouped = new Map<
    string,
    { total: number; count: number; categoryId: string | null; id: string }
  >();

  for (const transaction of expenseTransactions) {
    const key = transaction.description.toLowerCase().trim();
    const existing = grouped.get(key);
    if (existing) {
      existing.total += transaction.amount;
      existing.count += 1;
    } else {
      grouped.set(key, {
        total: transaction.amount,
        count: 1,
        categoryId: transaction.categoryId,
        id: `recurring-${transaction.id}`,
      });
    }
  }

  const result: RecurringExpenseItem[] = [];
  grouped.forEach((value, description) => {
    result.push({
      id: value.id,
      description: description.charAt(0).toUpperCase() + description.slice(1),
      amount: value.total / value.count,
      categoryId: value.categoryId,
    });
  });

  return result.sort((first, second) => second.amount - first.amount);
}
