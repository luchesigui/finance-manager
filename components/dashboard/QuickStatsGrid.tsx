"use client";

import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Gem,
  Info,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import type { HealthScoreFactors } from "@/components/dashboard/hooks/useHealthScore";
import { formatCurrency } from "@/lib/format";

// ============================================================================
// Types
// ============================================================================

type QuickStatsGridProps = {
  factors: HealthScoreFactors;
  /** Total expenses EXCLUDING Liberdade Financeira (savings) */
  totalExpenses: number;
  effectiveIncome: number;
};

// ============================================================================
// Component
// ============================================================================

export function QuickStatsGrid({ factors, totalExpenses, effectiveIncome }: QuickStatsGridProps) {
  const { liberdadeFinanceira, freeBalance } = factors;

  // Calculate spending budget: Income - Expected Savings
  const spendingBudget = effectiveIncome - liberdadeFinanceira.target;

  // Calculate budget usage percentage based on expenses (excluding savings)
  const budgetUsagePercent = spendingBudget > 0 ? (totalExpenses / spendingBudget) * 100 : 0;

  // Determine if savings goal is achieved
  const savingsGoalAchieved = liberdadeFinanceira.percentAchieved >= 100;

  // Free balance is positive
  const isPositiveBalance = freeBalance.value >= 0;

  // Balance percentage of income
  const balancePercent =
    effectiveIncome > 0 ? Math.abs((freeBalance.value / effectiveIncome) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-grid-gap">
      {/* Card A: Liberdade Financeira (highlighted) */}
      <div
        className={`noir-card p-6 relative overflow-hidden ${
          savingsGoalAchieved
            ? "border-2 border-accent-positive/50 shadow-glow-positive"
            : "border-2 border-accent-spending/30"
        }`}
      >
        {/* Background glow effect */}
        <div
          className={`absolute inset-0 ${
            savingsGoalAchieved ? "bg-accent-positive/5" : "bg-accent-spending/5"
          }`}
        />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Gem
              size={20}
              className={savingsGoalAchieved ? "text-accent-positive" : "text-accent-spending"}
            />
            <h3 className="text-sm font-semibold text-heading uppercase tracking-wide">
              Liberdade Financeira
            </h3>
          </div>

          {/* Primary value */}
          <p
            className={`text-3xl font-bold tabular-nums ${
              savingsGoalAchieved ? "text-accent-positive" : "text-accent-spending"
            }`}
          >
            {formatCurrency(liberdadeFinanceira.actual)}
          </p>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>Progresso</span>
              <span>
                {formatCurrency(liberdadeFinanceira.actual)} de{" "}
                {formatCurrency(liberdadeFinanceira.target)}
              </span>
            </div>
            <div className="h-2 bg-noir-active rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  savingsGoalAchieved ? "bg-accent-positive" : "bg-accent-spending"
                }`}
                style={{
                  width: `${Math.min(liberdadeFinanceira.percentAchieved, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Status badge */}
          <div className="mt-3">
            {savingsGoalAchieved ? (
              <span className="noir-badge-positive flex items-center gap-1.5 w-fit">
                <CheckCircle2 size={12} />
                Meta Atingida
              </span>
            ) : (
              <span className="noir-badge-warning flex items-center gap-1.5 w-fit">
                <Target size={12} />
                Faltam {formatCurrency(liberdadeFinanceira.target - liberdadeFinanceira.actual)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card B: Total Gasto vs Orçamento */}
      <div className="noir-card p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingDown size={20} className="text-accent-negative" />
            <h3 className="text-sm font-semibold text-heading uppercase tracking-wide">
              Gastos do Mês
            </h3>
          </div>
          <div className="relative group">
            <Info size={16} className="text-muted cursor-help hover:text-body transition-colors" />
            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-noir-surface border border-noir-border-light rounded-lg shadow-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <p className="text-xs text-body leading-relaxed">
                O orçamento é calculado como os rendimentos totais subtraídos do investimento
                esperado para Liberdade Financeira.
              </p>
            </div>
          </div>
        </div>

        {/* Primary value */}
        <p className="text-3xl font-bold text-heading tabular-nums">
          {formatCurrency(totalExpenses)}
        </p>

        {/* Budget usage */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>% do Orçamento</span>
            <span>
              {formatCurrency(totalExpenses)} de {formatCurrency(spendingBudget)}
            </span>
          </div>
          <div className="h-2 bg-noir-active rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                budgetUsagePercent > 100
                  ? "bg-accent-negative"
                  : budgetUsagePercent > 90
                    ? "bg-accent-warning"
                    : "bg-accent-primary"
              }`}
              style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Status */}
        <div className="mt-3">
          {budgetUsagePercent <= 100 ? (
            <span className="noir-badge-positive flex items-center gap-1.5 w-fit">
              <CheckCircle2 size={12} />
              Dentro do orçamento
            </span>
          ) : (
            <span className="noir-badge-negative flex items-center gap-1.5 w-fit">
              <ArrowUp size={12} />
              Acima do orçamento
            </span>
          )}
        </div>
      </div>

      {/* Card C: Saldo Livre */}
      <div
        className={`noir-card p-6 relative overflow-hidden ${
          isPositiveBalance ? "border-accent-positive/30" : "border-accent-negative/30"
        }`}
      >
        {/* Background effect */}
        <div
          className={`absolute inset-0 opacity-5 ${
            isPositiveBalance ? "bg-accent-positive" : "bg-accent-negative"
          }`}
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Wallet
              size={20}
              className={isPositiveBalance ? "text-accent-positive" : "text-accent-negative"}
            />
            <h3 className="text-sm font-semibold text-heading uppercase tracking-wide">
              Saldo Livre
            </h3>
          </div>

          {/* Primary value */}
          <p
            className={`text-3xl font-bold tabular-nums ${
              isPositiveBalance
                ? "text-accent-positive text-glow-positive"
                : "text-accent-negative text-glow-negative"
            }`}
          >
            {isPositiveBalance ? "+" : "-"}
            {formatCurrency(Math.abs(freeBalance.value))}
          </p>

          {/* Percentage of income */}
          <div className="mt-3 flex items-center gap-2">
            {isPositiveBalance ? (
              <TrendingUp size={16} className="text-accent-positive" />
            ) : (
              <TrendingDown size={16} className="text-accent-negative" />
            )}
            <span className="text-sm text-body">{balancePercent.toFixed(0)}% da renda</span>
          </div>

          {/* Status badge */}
          <div className="mt-3">
            {isPositiveBalance ? (
              <span className="noir-badge-positive flex items-center gap-1.5 w-fit">
                <ArrowUp size={12} />
                Positivo
              </span>
            ) : (
              <span className="noir-badge-negative flex items-center gap-1.5 w-fit">
                <ArrowDown size={12} />
                Negativo
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
