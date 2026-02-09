"use client";

import { AlertTriangle, BarChart3 } from "lucide-react";

import type { CategorySummaryRow } from "@/features/transactions/hooks/useFinanceCalculations";
import { normalizeCategoryName } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";

// ============================================================================
// Types
// ============================================================================

type CategoryBudgetChartProps = {
  categorySummary: CategorySummaryRow[];
  totalIncome: number;
};

type CategoryBarProps = {
  category: CategorySummaryRow;
  totalIncome: number;
  isSavingsCategory: boolean;
};

// ============================================================================
// Constants
// ============================================================================

// Categories where meeting/exceeding target is GOOD (savings/goals)
const SAVINGS_CATEGORIES = new Set(["liberdade financeira"]);

function isSavingsCategoryName(name: string): boolean {
  return SAVINGS_CATEGORIES.has(normalizeCategoryName(name));
}

// ============================================================================
// Components
// ============================================================================

function CategoryBar({ category, totalIncome, isSavingsCategory }: CategoryBarProps) {
  const targetAmount = (category.targetPercent / 100) * totalIncome;
  const percentOfTarget = targetAmount > 0 ? (category.totalSpent / targetAmount) * 100 : 0;

  // For regular expense categories: over budget is bad (red), under is good (green)
  // For savings categories: meeting target is good (green), under is warning/bad
  const isOverBudget = percentOfTarget > 100;
  const isNearLimit = percentOfTarget >= 90 && percentOfTarget <= 100;

  let barColor: string;
  let showWarning = false;

  if (isSavingsCategory) {
    // For savings: meeting/exceeding goal is good
    if (percentOfTarget >= 100) {
      barColor = "bg-accent-positive";
    } else if (percentOfTarget >= 80) {
      barColor = "bg-accent-warning";
    } else {
      barColor = "bg-accent-negative";
      showWarning = true;
    }
  } else {
    // For expenses: under budget is good
    if (isOverBudget) {
      barColor = "bg-accent-negative";
      showWarning = true;
    } else if (isNearLimit) {
      barColor = "bg-accent-warning";
    } else {
      barColor = "bg-accent-positive";
    }
  }

  return (
    <Link
      href={`/lancamentos?categoryId=${category.id}`}
      className="group py-2 block hover:bg-noir-active/30 transition-colors rounded-sm px-2 -mx-2"
    >
      <div className="flex items-center gap-3 mb-1.5">
        {/* Category name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm font-medium truncate text-heading group-hover:text-accent-primary transition-colors">
            {category.name}
          </span>
          {showWarning && (
            <AlertTriangle size={14} className="text-accent-negative flex-shrink-0" />
          )}
        </div>

        {/* Percentage and amount */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className={`text-sm font-bold tabular-nums ${
              showWarning
                ? "text-accent-negative"
                : percentOfTarget >= 100 && isSavingsCategory
                  ? "text-accent-positive"
                  : "text-body"
            }`}
          >
            {Math.round(percentOfTarget)}%
          </span>
          <span className="text-xs text-muted tabular-nums min-w-[80px] text-right">
            {formatCurrency(category.totalSpent)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-noir-active rounded-full overflow-hidden relative">
        <div
          className={`h-full ${barColor} transition-all duration-500 ease-out ${
            showWarning ? "bg-stripes" : ""
          }`}
          style={{ width: `${Math.min(percentOfTarget, 100)}%` }}
        />
      </div>

      {/* Target indicator (subtle) */}
      <div className="flex justify-between text-[11px] text-muted mt-1">
        <span>0</span>
        <span>Meta: {formatCurrency(targetAmount)}</span>
      </div>
    </Link>
  );
}

export function CategoryBudgetChart({ categorySummary, totalIncome }: CategoryBudgetChartProps) {
  // Sort categories by spending (highest first)
  const sortedCategories = [...categorySummary].sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="noir-card p-card-padding">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
          <BarChart3 size={20} className="text-accent-primary" />
          Categorias vs Orçamento
        </h2>
      </div>

      <div className="space-y-1">
        {sortedCategories.map((category) => (
          <CategoryBar
            key={category.id}
            category={category}
            totalIncome={totalIncome}
            isSavingsCategory={isSavingsCategoryName(category.name)}
          />
        ))}

        {categorySummary.length === 0 && (
          <div className="text-center py-8 text-muted text-sm">
            Nenhuma categoria com gastos neste mês
          </div>
        )}
      </div>
    </div>
  );
}
