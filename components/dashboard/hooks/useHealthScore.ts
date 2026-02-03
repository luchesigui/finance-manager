"use client";

import { useMemo } from "react";

import {
  type CategorySummaryRow,
  calculateCategorySummary,
  calculateIncomeBreakdown,
  calculatePeopleShareWithIncomeTransactions,
  calculateSettlementData,
  calculateTotalExpenses,
  calculateTotalIncome,
  getExpenseTransactions,
} from "@/components/finance/hooks/useFinanceCalculations";
import { normalizeCategoryName, shouldCategoryAutoExcludeFromSplit } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { Category, Person, Transaction } from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

export type HealthStatus = "healthy" | "warning" | "critical";

export type MonthPeriod = "early" | "mid" | "late";

export type LiberdadeFinanceiraFactor = {
  score: number;
  actual: number;
  target: number;
  percentAchieved: number;
};

export type CategoriesOnBudgetFactor = {
  score: number;
  onBudget: number;
  total: number;
};

export type OutliersFactor = {
  score: number;
  count: number;
};

export type SettlementFactor = {
  score: number;
  balanced: boolean;
};

export type FreeBalanceFactor = {
  score: number;
  value: number;
};

export type HealthScoreFactors = {
  liberdadeFinanceira: LiberdadeFinanceiraFactor;
  categoriesOnBudget: CategoriesOnBudgetFactor;
  outliers: OutliersFactor;
  settlement: SettlementFactor;
  freeBalance: FreeBalanceFactor;
};

export type HealthScoreResult = {
  score: number;
  status: HealthStatus;
  factors: HealthScoreFactors;
  summary: string;
};

// ============================================================================
// Constants
// ============================================================================

const LIBERDADE_FINANCEIRA_CATEGORY = "liberdade financeira";

const WEIGHTS = {
  liberdadeFinanceira: 0.4,
  categoriesOnBudget: 0.25,
  outliers: 0.15,
  settlement: 0.1,
  freeBalance: 0.1,
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determines which period of the month we're in:
 * - "early": days 1-10 (first 1/3)
 * - "mid": days 11-20 (middle 1/3)
 * - "late": days 21-31 (final 1/3)
 */
function getMonthPeriod(dayOfMonth: number): MonthPeriod {
  if (dayOfMonth <= 10) return "early";
  if (dayOfMonth <= 20) return "mid";
  return "late";
}

function getLiberdadeFinanceiraCategory(categories: Category[]): Category | undefined {
  return categories.find(
    (cat) => normalizeCategoryName(cat.name) === LIBERDADE_FINANCEIRA_CATEGORY,
  );
}

function calculateLiberdadeFinanceiraFactor(
  categories: Category[],
  categorySummary: CategorySummaryRow[],
  totalIncome: number,
  dayOfMonth: number,
): LiberdadeFinanceiraFactor {
  const liberdadeCategory = getLiberdadeFinanceiraCategory(categories);

  if (!liberdadeCategory || totalIncome <= 0) {
    return { score: 0, actual: 0, target: 0, percentAchieved: 0 };
  }

  const target = (liberdadeCategory.targetPercent / 100) * totalIncome;
  const summaryCat = categorySummary.find((cat) => cat.id === liberdadeCategory.id);
  const actual = summaryCat?.totalSpent ?? 0;

  const percentAchieved = target > 0 ? (actual / target) * 100 : 0;

  // Adjust score based on period of the month
  const monthPeriod = getMonthPeriod(dayOfMonth);

  let score: number;

  if (percentAchieved >= 100) {
    // Goal achieved - always 100
    score = 100;
  } else if (monthPeriod === "early") {
    // First 1/3 of month: It's OK not to have saved yet
    // Even 0% achievement is acceptable, give a higher baseline score
    // Scale from 70 (0%) to 100 (100%)
    score = 70 + percentAchieved * 0.3;
  } else if (monthPeriod === "mid") {
    // Middle 1/3 of month: Should be making progress
    // Scale from 40 (0%) to 100 (100%)
    score = 40 + percentAchieved * 0.6;
  } else {
    // Final 1/3 of month: Time is running out
    // Strict scoring - directly proportional to achievement
    score = percentAchieved;
  }

  return { score: Math.min(100, score), actual, target, percentAchieved };
}

function calculateCategoriesOnBudgetFactor(
  categorySummary: CategorySummaryRow[],
): CategoriesOnBudgetFactor {
  // Exclude Liberdade Financeira since it's handled separately
  const regularCategories = categorySummary.filter(
    (cat) => normalizeCategoryName(cat.name) !== LIBERDADE_FINANCEIRA_CATEGORY,
  );

  if (regularCategories.length === 0) {
    return { score: 100, onBudget: 0, total: 0 };
  }

  const onBudget = regularCategories.filter(
    (cat) => cat.realPercentOfIncome <= cat.targetPercent,
  ).length;
  const total = regularCategories.length;

  const score = (onBudget / total) * 100;

  return { score, onBudget, total };
}

function calculateOutliersFactor(outlierCount: number): OutliersFactor {
  // Score: 100 if 0 outliers, decreases with more outliers
  // 0 outliers = 100, 1 = 80, 2 = 60, 3 = 40, 4 = 20, 5+ = 0
  const score = Math.max(0, 100 - outlierCount * 20);

  return { score, count: outlierCount };
}

function calculateSettlementFactor(settlementData: Array<{ balance: number }>): SettlementFactor {
  // Balanced if all balances are within a small threshold
  const balanced = settlementData.every((person) => Math.abs(person.balance) < 1);

  // Score based on how balanced it is
  const totalImbalance = settlementData.reduce((sum, person) => sum + Math.abs(person.balance), 0);

  // If no imbalance, 100. Otherwise, decrease score based on imbalance magnitude
  // Cap at 0 score for very large imbalances
  const score = balanced ? 100 : Math.max(0, 100 - Math.min(totalImbalance / 10, 100));

  return { score, balanced };
}

function calculateFreeBalanceFactor(freeBalance: number, totalIncome: number): FreeBalanceFactor {
  if (totalIncome <= 0) {
    return { score: 0, value: 0 };
  }

  // Positive balance is good, negative is bad
  // Score: 100 if balance >= 0, decreases linearly if negative
  // If balance is -100% of income, score = 0
  const balancePercent = (freeBalance / totalIncome) * 100;

  let score: number;
  if (freeBalance >= 0) {
    score = 100;
  } else {
    // Negative balance: score decreases linearly
    score = Math.max(0, 100 + balancePercent); // balancePercent is negative
  }

  return { score, value: freeBalance };
}

function getHealthStatus(score: number): HealthStatus {
  if (score >= 80) return "healthy";
  if (score >= 50) return "warning";
  return "critical";
}

function generateSummary(factors: HealthScoreFactors, dayOfMonth: number): string {
  const issues: string[] = [];
  const monthPeriod = getMonthPeriod(dayOfMonth);

  if (factors.liberdadeFinanceira.percentAchieved < 100) {
    const remaining = factors.liberdadeFinanceira.target - factors.liberdadeFinanceira.actual;

    // Adjust messaging based on time of month
    if (monthPeriod === "early" && factors.liberdadeFinanceira.percentAchieved < 50) {
      // Early in the month, low savings is not alarming
      issues.push(
        `Meta de poupança: ${formatCurrency(factors.liberdadeFinanceira.actual)} de ${formatCurrency(factors.liberdadeFinanceira.target)}`,
      );
    } else {
      issues.push(
        `Meta de poupança em ${Math.round(factors.liberdadeFinanceira.percentAchieved)}%, faltam ${formatCurrency(remaining)}`,
      );
    }
  }

  if (factors.categoriesOnBudget.onBudget < factors.categoriesOnBudget.total) {
    const overBudget = factors.categoriesOnBudget.total - factors.categoriesOnBudget.onBudget;
    issues.push(`${overBudget} categoria${overBudget > 1 ? "s" : ""} acima do orçamento`);
  }

  if (factors.outliers.count > 0) {
    issues.push(
      `${factors.outliers.count} gasto${factors.outliers.count > 1 ? "s" : ""} fora do padrão`,
    );
  }

  if (factors.freeBalance.value < 0) {
    issues.push("Saldo livre negativo");
  }

  if (issues.length === 0) {
    if (factors.liberdadeFinanceira.percentAchieved >= 100) {
      return "Meta de poupança atingida! Finanças saudáveis.";
    }
    return "Finanças dentro do esperado";
  }

  return issues.slice(0, 2).join(", ");
}

// ============================================================================
// Hook
// ============================================================================

type UseHealthScoreParams = {
  people: Person[];
  categories: Category[];
  transactions: Transaction[];
  outlierCount: number;
  /** Day of the month (1-31) for period-aware scoring */
  dayOfMonth: number;
};

export function useHealthScore({
  people,
  categories,
  transactions,
  outlierCount,
  dayOfMonth,
}: UseHealthScoreParams): HealthScoreResult {
  return useMemo(() => {
    // Calculate base income
    const baseIncome = calculateTotalIncome(people);

    // Calculate income adjustments from transactions
    const incomeBreakdown = calculateIncomeBreakdown(transactions);
    const effectiveIncome = baseIncome + incomeBreakdown.netIncome;

    // Calculate category summary
    const categorySummary = calculateCategorySummary(categories, transactions, effectiveIncome);

    // Build excluded category IDs for fair distribution
    const excludedCategoryIds = new Set(
      categories
        .filter((category) => shouldCategoryAutoExcludeFromSplit(category.name))
        .map((category) => category.id),
    );

    // Filter transactions for fair distribution
    const expenseTransactions = getExpenseTransactions(transactions);
    const transactionsForFairDistribution = expenseTransactions.filter(
      (transaction) =>
        transaction.categoryId !== null &&
        !excludedCategoryIds.has(transaction.categoryId) &&
        !transaction.excludeFromSplit,
    );

    // Calculate settlement data
    const peopleWithShare = calculatePeopleShareWithIncomeTransactions(people, transactions);
    const totalExpensesForDistribution = calculateTotalExpenses(transactionsForFairDistribution);
    const settlementData = calculateSettlementData(
      peopleWithShare,
      transactionsForFairDistribution,
      totalExpensesForDistribution,
    );

    // Calculate all expenses (including Liberdade Financeira)
    const totalExpensesAll = calculateTotalExpenses(expenseTransactions);

    // Calculate free balance
    const freeBalance = effectiveIncome - totalExpensesAll;

    // Calculate individual factors (with day-of-month awareness for savings)
    const factors: HealthScoreFactors = {
      liberdadeFinanceira: calculateLiberdadeFinanceiraFactor(
        categories,
        categorySummary,
        effectiveIncome,
        dayOfMonth,
      ),
      categoriesOnBudget: calculateCategoriesOnBudgetFactor(categorySummary),
      outliers: calculateOutliersFactor(outlierCount),
      settlement: calculateSettlementFactor(settlementData),
      freeBalance: calculateFreeBalanceFactor(freeBalance, effectiveIncome),
    };

    // Calculate weighted score
    const score = Math.round(
      factors.liberdadeFinanceira.score * WEIGHTS.liberdadeFinanceira +
        factors.categoriesOnBudget.score * WEIGHTS.categoriesOnBudget +
        factors.outliers.score * WEIGHTS.outliers +
        factors.settlement.score * WEIGHTS.settlement +
        factors.freeBalance.score * WEIGHTS.freeBalance,
    );

    const status = getHealthStatus(score);
    const summary = generateSummary(factors, dayOfMonth);

    return { score, status, factors, summary };
  }, [people, categories, transactions, outlierCount, dayOfMonth]);
}
