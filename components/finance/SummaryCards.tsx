"use client";

import { Eye, EyeOff, ThumbsUp, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";

import {
  calculateIncomeBreakdown,
  calculateTotalExpenses,
  calculateTotalIncome,
  getExpenseTransactions,
} from "@/components/finance/hooks/useFinanceCalculations";
import { useTransactions } from "@/components/finance/contexts/TransactionsContext";
import { CrystalBallLine } from "@/components/ui/CrystalBallLine";
import { shouldCategoryAutoExcludeFromSplit } from "@/lib/constants";
import { formatCurrency, formatDateString, formatMonthYear } from "@/lib/format";
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
  const { updateTransactionById } = useTransactions();

  const forecastExpenses = useMemo(
    () =>
      transactionsForSelectedMonth.filter(
        (transaction) => transaction.isForecast && transaction.type !== "income",
      ),
    [transactionsForSelectedMonth],
  );
  const forecastTotal = useMemo(
    () => forecastExpenses.reduce((sum, transaction) => sum + transaction.amount, 0),
    [forecastExpenses],
  );
  const hasForecastExpenses = forecastExpenses.length > 0;
  const forecastCountLabel =
    forecastExpenses.length === 1 ? "1 item" : `${forecastExpenses.length} itens`;

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

      {hasForecastExpenses && (
        <div className="md:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-amber-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1">
                <CrystalBallLine size={14} className="text-amber-500" />
                Previsões de gastos
              </h3>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(forecastTotal)}
              </p>
            </div>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full w-fit">
              {forecastCountLabel}
            </span>
          </div>

          <div className="mt-4">
            <ul className="divide-y divide-slate-100">
              {forecastExpenses.map((transaction) => {
                const isIncluded = transaction.isForecastIncluded;
                return (
                  <li
                    key={transaction.id}
                    className="py-2 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateString(transaction.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateTransactionById(transaction.id, {
                            isForecast: false,
                            isForecastIncluded: true,
                          })
                        }
                        className="p-1.5 rounded-full text-emerald-600 hover:text-emerald-700 transition-colors"
                        title="Marcar como oficial"
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateTransactionById(transaction.id, {
                            isForecastIncluded: !isIncluded,
                          })
                        }
                        className={`p-1.5 rounded-full transition-colors ${
                          isIncluded
                            ? "text-indigo-600 hover:text-indigo-700"
                            : "text-slate-300 hover:text-slate-500"
                        }`}
                        title={isIncluded ? "Não considerar na conta" : "Considerar na conta"}
                      >
                        {isIncluded ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <span className="text-sm font-semibold text-slate-700">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
