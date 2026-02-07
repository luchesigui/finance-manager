"use client";

import { CrystalBallLine } from "@/components/ui/CrystalBallLine";
import {
  calculateIncomeBreakdown,
  calculateTotalExpenses,
  calculateTotalIncome,
  getExpenseTransactions,
} from "@/features/transactions/hooks/useFinanceCalculations";
import { useTransactionsData } from "@/features/transactions/hooks/useTransactionsData";
import { shouldCategoryAutoExcludeFromSplit } from "@/lib/constants";
import { formatCurrency, formatDateString, formatMonthYear } from "@/lib/format";
import type { Category, Person, Transaction } from "@/lib/types";
import { Eye, EyeOff, ThumbsUp, TrendingDown, TrendingUp } from "lucide-react";

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
  } = useTransactionsData();

  const forecastExpenses = transactionsForSelectedMonth.filter(
    (transaction) => transaction.isForecast && transaction.type !== "income",
  );
  const forecastTotal = forecastExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
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

  const freeBalance = effectiveIncome - totalExpenses;
  const isPositiveBalance = freeBalance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-grid-gap">
      {/* Total Income Card */}
      <div className="noir-card p-card-padding group">
        <h3 className="text-body text-sm font-medium mb-1">Renda Total Familiar</h3>
        <p className="text-2xl font-bold text-heading tabular-nums">
          {formatCurrency(effectiveIncome)}
        </p>
        {hasIncomeTransactions && (
          <div className="mt-3 pt-3 border-t border-noir-border">
            <div className="text-xs space-y-1.5">
              {incomeBreakdown.totalIncomeIncrement > 0 && (
                <div className="flex items-center gap-1.5 text-accent-positive">
                  <TrendingUp size={12} />
                  <span>+ {formatCurrency(incomeBreakdown.totalIncomeIncrement)} adicionado</span>
                </div>
              )}
              {incomeBreakdown.totalIncomeDecrement > 0 && (
                <div className="flex items-center gap-1.5 text-accent-warning">
                  <TrendingDown size={12} />
                  <span>- {formatCurrency(incomeBreakdown.totalIncomeDecrement)} deduzido</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Total Expenses Card */}
      <div className="noir-card p-card-padding group">
        <h3 className="text-body text-sm font-medium mb-1">
          Total Gasto ({formatMonthYear(selectedMonthDate)})
        </h3>
        <p className="text-2xl font-bold text-accent-negative tabular-nums">
          {formatCurrency(totalExpenses)}
        </p>
      </div>

      {/* Free Balance Card */}
      <div
        className={`noir-card p-card-padding group relative overflow-hidden ${
          isPositiveBalance ? "border-accent-positive/30" : "border-accent-negative/30"
        }`}
      >
        <div
          className={`absolute inset-0 opacity-5 ${
            isPositiveBalance ? "bg-accent-positive" : "bg-accent-negative"
          }`}
        />
        <div className="relative">
          <h3 className="text-body text-sm font-medium mb-1">Saldo Livre</h3>
          <p
            className={`text-2xl font-bold tabular-nums ${
              isPositiveBalance
                ? "text-accent-positive text-glow-positive"
                : "text-accent-negative text-glow-negative"
            }`}
          >
            {formatCurrency(freeBalance)}
          </p>
        </div>
      </div>

      {hasForecastExpenses && (
        <div className="md:col-span-3 noir-card p-card-padding border-accent-spending/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent-spending/5" />
          <div className="relative">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-body text-sm font-medium mb-1 flex items-center gap-1.5">
                  <CrystalBallLine size={14} className="text-accent-spending" />
                  Previsões de gastos
                </h3>
                <p className="text-2xl font-bold text-accent-spending tabular-nums">
                  {formatCurrency(forecastTotal)}
                </p>
              </div>
              <span className="noir-badge-muted w-fit">{forecastCountLabel}</span>
            </div>

            <div className="mt-4">
              <ul className="divide-y divide-noir-border">
                {forecastExpenses.map((transaction) => {
                  const isIncluded = isForecastIncluded(transaction.id);
                  return (
                    <li
                      key={transaction.id}
                      className="py-3 flex items-center justify-between gap-3 group/item"
                    >
                      <div>
                        <p className="text-sm font-medium text-heading">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted">{formatDateString(transaction.date)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateTransactionById(transaction.id, {
                              isForecast: false,
                              excludeFromSplit: false,
                            })
                          }
                          className="p-1.5 rounded-interactive text-accent-positive hover:bg-accent-positive/20 transition-all"
                          title="Marcar como oficial"
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setForecastInclusionOverride(transaction.id, !isIncluded)}
                          className={`p-1.5 rounded-interactive transition-all ${
                            isIncluded
                              ? "text-body hover:bg-noir-active"
                              : "text-muted hover:text-body hover:bg-noir-active"
                          }`}
                          title={isIncluded ? "Não considerar na conta" : "Considerar na conta"}
                        >
                          {isIncluded ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <span className="text-sm font-semibold text-heading tabular-nums ml-2">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
