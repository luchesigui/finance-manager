import type { Transaction } from "@/lib/types";

export function getVisibleTransactionsSummary(
  visibleTransactions: Transaction[],
  visibleCalculationIds: Set<number>,
) {
  const expenseTransactionsForCalc = visibleTransactions.filter(
    (t) => t.type !== "income" && t.type !== "transfer" && visibleCalculationIds.has(t.id),
  );

  const expenseCount = visibleTransactions.filter((t) => t.type !== "income").length;
  const incomeCount = visibleTransactions.filter((t) => t.type === "income").length;
  const transferCount = visibleTransactions.filter((t) => t.type === "transfer").length;

  const incomeTotal = visibleTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const transferTotal = visibleTransactions
    .filter((t) => t.type === "transfer")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseTotal = expenseTransactionsForCalc.reduce((sum, t) => sum + t.amount, 0);

  return {
    expenseCount,
    incomeCount,
    transferCount,
    incomeTotal,
    transferTotal,
    expenseTotal,
  };
}
