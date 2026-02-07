/**
 * Re-exports finance calculation functions and types from lib for use in components.
 * Server code (e.g. API routes) should import from @/lib/server/calculations directly.
 */
export {
  calculateCategorySummary,
  calculateFinancialSummary,
  calculateIncomeBreakdown,
  calculatePeopleShare,
  calculatePeopleShareWithIncomeTransactions,
  calculateSettlementData,
  calculateTotalExpenses,
  calculateTotalIncome,
  getExpenseTransactions,
  getIncomeTransactions,
} from "@/lib/server/calculations";
export type {
  CategorySummaryRow,
  FinancialSummary,
  IncomeBreakdown,
  PersonWithShare,
  SettlementRow,
} from "@/lib/server/calculations";
