"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import {
  calculateIncomeBreakdown,
  calculateTotalExpenses,
  calculateTotalIncome,
  getExpenseTransactions,
} from "@/components/finance/hooks/useFinanceCalculations";
import { shouldCategoryAutoExcludeFromSplit } from "@/lib/constants";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import type { Category, Person, Transaction } from "@/lib/types";

type SummaryCardsProps = {
  people: Person[];
  transactionsForSelectedMonth: Transaction[];
  categories: Category[];
  selectedMonthDate: Date;
};

export function SummaryCards({
  people,
  transactionsForSelectedMonth,
  categories,
  selectedMonthDate,
}: SummaryCardsProps) {
  // Calculate total income
  const totalIncome = calculateTotalIncome(people);

  // Calculate income breakdown
  const incomeBreakdown = calculateIncomeBreakdown(transactionsForSelectedMonth);
  const effectiveIncome = totalIncome + incomeBreakdown.netIncome;

  // Build set of excluded category IDs for fair distribution
  const excludedCategoryIds = new Set(
    categories
      .filter((category) => shouldCategoryAutoExcludeFromSplit(category.name))
      .map((category) => category.id),
  );

  // Filter transactions for fair distribution calculation
  const expenseTransactions = getExpenseTransactions(transactionsForSelectedMonth);
  const transactionsForFairDistribution = expenseTransactions.filter(
    (transaction) =>
      transaction.categoryId !== null &&
      !excludedCategoryIds.has(transaction.categoryId) &&
      !transaction.excludeFromSplit,
  );

  // Calculate total expenses for distribution
  const totalExpenses = calculateTotalExpenses(transactionsForFairDistribution);

  const hasIncomeTransactions =
    incomeBreakdown.totalIncomeIncrement > 0 || incomeBreakdown.totalIncomeDecrement > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Income Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-slate-500 text-sm font-medium mb-1">Renda Total Familiar</h3>
        <p className="text-2xl font-bold text-slate-800">{formatCurrency(effectiveIncome)}</p>
        {hasIncomeTransactions && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500 space-y-1">
              {incomeBreakdown.totalIncomeIncrement > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp size={12} />
                  <span>+ {formatCurrency(incomeBreakdown.totalIncomeIncrement)} adicionado</span>
                </div>
              )}
              {incomeBreakdown.totalIncomeDecrement > 0 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <TrendingDown size={12} />
                  <span>- {formatCurrency(incomeBreakdown.totalIncomeDecrement)} deduzido</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Total Expenses Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-slate-500 text-sm font-medium mb-1">
          Total Gasto ({formatMonthYear(selectedMonthDate)})
        </h3>
        <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
      </div>

      {/* Free Balance Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-slate-500 text-sm font-medium mb-1">Saldo Livre</h3>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(effectiveIncome - totalExpenses)}
        </p>
      </div>
    </div>
  );
}
