"use client";

import { Eye, EyeOff, ThumbsUp, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";

import { useTransactions } from "@/components/finance/contexts/TransactionsContext";
import {
  calculateIncomeBreakdown,
  calculateTotalExpenses,
  calculateTotalIncome,
  getExpenseTransactions,
} from "@/components/finance/hooks/useFinanceCalculations";
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
  const {
    updateTransactionById,
    setForecastInclusionOverride,
    isForecastIncluded,
    transactionsForCalculations,
  } = useTransactions();

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
  const incomeBreakdown = calculateIncomeBreakdown(transactionsForCalculations);
  const effectiveIncome = totalIncome + incomeBreakdown.netIncome;

  // Build set of excluded category IDs for fair distribution
  const excludedCategoryIds = new Set(
    categories
      .filter((category) => shouldCategoryAutoExcludeFromSplit(category.name))
      .map((category) => category.id),
  );

  // Filter transactions for fair distribution calculation
  const expenseTransactions = getExpenseTransactions(transactionsForCalculations);
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-grid">
      {/* Total Income Card */}
      <div
        className="bg-noir-bg-surface p-card rounded-card border"
        style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
      >
        <h3 className="text-noir-text-muted text-sm font-medium mb-1">Renda Total Familiar</h3>
        <p className="text-2xl font-bold text-noir-text-heading tabular-nums">
          {formatCurrency(effectiveIncome)}
        </p>
        {hasIncomeTransactions && (
          <div className="mt-2 pt-2 border-t" style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}>
            <div className="text-xs text-noir-text-muted space-y-1">
              {incomeBreakdown.totalIncomeIncrement > 0 && (
                <div className="flex items-center gap-1 text-noir-accent-positive">
                  <TrendingUp size={12} />
                  <span>+ {formatCurrency(incomeBreakdown.totalIncomeIncrement)} adicionado</span>
                </div>
              )}
              {incomeBreakdown.totalIncomeDecrement > 0 && (
                <div className="flex items-center gap-1 text-noir-accent-warning">
                  <TrendingDown size={12} />
                  <span>- {formatCurrency(incomeBreakdown.totalIncomeDecrement)} deduzido</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Total Expenses Card */}
      <div
        className="bg-noir-bg-surface p-card rounded-card border"
        style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
      >
        <h3 className="text-noir-text-muted text-sm font-medium mb-1">
          Total Gasto ({formatMonthYear(selectedMonthDate)})
        </h3>
        <p className="text-2xl font-bold text-noir-accent-negative tabular-nums">
          {formatCurrency(totalExpenses)}
        </p>
      </div>

      {/* Free Balance Card */}
      <div
        className="bg-noir-bg-surface p-card rounded-card border"
        style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
      >
        <h3 className="text-noir-text-muted text-sm font-medium mb-1">Saldo Livre</h3>
        <p className="text-2xl font-bold text-noir-accent-positive tabular-nums">
          {formatCurrency(effectiveIncome - totalExpenses)}
        </p>
      </div>

      {hasForecastExpenses && (
        <div
          className="md:col-span-3 bg-noir-bg-surface p-card rounded-card border border-noir-accent-warning glow-spending"
          style={{ borderColor: "rgba(249, 115, 22, 0.3)" }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-noir-text-muted text-sm font-medium mb-1 flex items-center gap-1">
                <CrystalBallLine size={14} className="text-noir-accent-spending" />
                Previsões de gastos
              </h3>
              <p className="text-2xl font-bold text-noir-accent-spending tabular-nums">
                {formatCurrency(forecastTotal)}
              </p>
            </div>
            <span className="text-xs text-noir-text-muted bg-noir-bg-active px-2 py-1 rounded-pill w-fit">
              {forecastCountLabel}
            </span>
          </div>

          <div className="mt-4">
            <ul className="divide-y" style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}>
              {forecastExpenses.map((transaction) => {
                const isIncluded = isForecastIncluded(transaction.id);
                return (
                  <li key={transaction.id} className="py-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-noir-text-body">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-noir-text-muted">
                        {formatDateString(transaction.date)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          updateTransactionById(transaction.id, {
                            isForecast: false,
                            excludeFromSplit: false,
                          })
                        }
                        className="p-1.5 rounded-pill text-noir-accent-positive hover:text-noir-accent-positive transition-colors hover:opacity-80"
                        title="Marcar como oficial"
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setForecastInclusionOverride(transaction.id, !isIncluded)}
                        className={`p-1.5 rounded-pill transition-colors ${
                          isIncluded
                            ? "text-noir-text-muted hover:text-noir-text-body"
                            : "text-noir-text-muted hover:text-noir-text-body opacity-40"
                        }`}
                        title={isIncluded ? "Não considerar na conta" : "Considerar na conta"}
                      >
                        {isIncluded ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <span className="text-sm font-semibold text-noir-text-body ml-2 tabular-nums">
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
