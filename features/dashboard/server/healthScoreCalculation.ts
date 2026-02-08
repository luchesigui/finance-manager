import "server-only";

import { normalizeCategoryName, shouldCategoryAutoExcludeFromSplit } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { Category, Person, Transaction } from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

export type HealthStatus = "healthy" | "warning" | "critical";

export type MonthPeriod = "early" | "mid" | "late";

export type HealthScoreResponse = {
  period: string;
  score: number;
  status: HealthStatus;
  reason?: string;
};

type CategorySummaryRow = Category & {
  totalSpent: number;
  realPercentOfIncome: number;
};

type PersonWithShare = Person & {
  sharePercent: number;
};

type SettlementRow = PersonWithShare & {
  paidAmount: number;
  fairShareAmount: number;
  balance: number;
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
// Transaction Filters
// ============================================================================

function isIncludedInTotals(transaction: Transaction): boolean {
  if (!transaction.isForecast) return true;
  return !transaction.excludeFromSplit;
}

function getExpenseTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter(
    (transaction) => transaction.type !== "income" && isIncludedInTotals(transaction),
  );
}

// ============================================================================
// Income Calculations
// ============================================================================

function calculateTotalIncome(people: Person[]): number {
  return people.reduce((sum, person) => sum + person.income, 0);
}

function calculateIncomeBreakdown(transactions: Transaction[]): {
  totalIncomeIncrement: number;
  totalIncomeDecrement: number;
  netIncome: number;
} {
  let totalIncomeIncrement = 0;
  let totalIncomeDecrement = 0;

  for (const t of transactions) {
    if (t.type !== "income" || !isIncludedInTotals(t)) continue;

    if (t.isIncrement) {
      totalIncomeIncrement += t.amount;
    } else {
      totalIncomeDecrement += t.amount;
    }
  }

  return {
    totalIncomeIncrement,
    totalIncomeDecrement,
    netIncome: totalIncomeIncrement - totalIncomeDecrement,
  };
}

function calculatePersonIncomeAdjustments(transactions: Transaction[]): Map<string, number> {
  const adjustments = new Map<string, number>();

  for (const t of transactions) {
    if (t.type !== "income" || !isIncludedInTotals(t)) continue;

    const current = adjustments.get(t.paidBy) ?? 0;
    const delta = t.isIncrement ? t.amount : -t.amount;
    adjustments.set(t.paidBy, current + delta);
  }

  return adjustments;
}

function calculatePeopleShareWithIncomeTransactions(
  people: Person[],
  transactions: Transaction[],
): PersonWithShare[] {
  const incomeAdjustments = calculatePersonIncomeAdjustments(transactions);

  const peopleWithEffectiveIncome = people.map((person) => ({
    ...person,
    income: person.income + (incomeAdjustments.get(person.id) ?? 0),
  }));

  const totalEffectiveIncome = peopleWithEffectiveIncome.reduce((sum, p) => sum + p.income, 0);
  const safeTotal = totalEffectiveIncome > 0 ? totalEffectiveIncome : 1;

  return peopleWithEffectiveIncome.map((person) => ({
    ...person,
    sharePercent: totalEffectiveIncome > 0 ? person.income / safeTotal : 0,
  }));
}

// ============================================================================
// Expense Calculations
// ============================================================================

function calculateTotalExpenses(transactions: Transaction[]): number {
  let total = 0;

  for (const t of transactions) {
    if (t.type !== "income" && isIncludedInTotals(t)) {
      total += t.amount;
    }
  }

  return total;
}

function buildCategorySpendingMap(transactions: Transaction[]): Map<string, number> {
  const spendingMap = new Map<string, number>();

  for (const t of transactions) {
    if (t.type === "income" || t.categoryId === null || !isIncludedInTotals(t)) continue;

    const current = spendingMap.get(t.categoryId) ?? 0;
    spendingMap.set(t.categoryId, current + t.amount);
  }

  return spendingMap;
}

function calculateCategorySummary(
  categories: Category[],
  transactions: Transaction[],
  totalIncome: number,
): CategorySummaryRow[] {
  const spendingMap = buildCategorySpendingMap(transactions);
  const safeIncome = totalIncome > 0 ? totalIncome : 1;

  return categories.map((category) => {
    const totalSpent = spendingMap.get(category.id) ?? 0;
    const realPercentOfIncome = totalIncome > 0 ? (totalSpent / safeIncome) * 100 : 0;

    return {
      ...category,
      totalSpent,
      realPercentOfIncome,
    };
  });
}

// ============================================================================
// Settlement Calculations
// ============================================================================

function buildPersonPaymentMap(transactions: Transaction[]): Map<string, number> {
  const paymentMap = new Map<string, number>();

  for (const t of transactions) {
    if (t.type === "income" || !isIncludedInTotals(t)) continue;

    const current = paymentMap.get(t.paidBy) ?? 0;
    paymentMap.set(t.paidBy, current + t.amount);
  }

  return paymentMap;
}

function calculateSettlementData(
  peopleWithShare: PersonWithShare[],
  transactions: Transaction[],
  totalExpenses: number,
): SettlementRow[] {
  const paymentMap = buildPersonPaymentMap(transactions);

  return peopleWithShare.map((person) => {
    const paidAmount = paymentMap.get(person.id) ?? 0;
    const fairShareAmount = totalExpenses * person.sharePercent;
    const balance = paidAmount - fairShareAmount;

    return {
      ...person,
      paidAmount,
      fairShareAmount,
      balance,
    };
  });
}

// ============================================================================
// Health Score Factors
// ============================================================================

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
): { score: number; actual: number; target: number; percentAchieved: number } {
  const liberdadeCategory = getLiberdadeFinanceiraCategory(categories);

  if (!liberdadeCategory || totalIncome <= 0) {
    return { score: 0, actual: 0, target: 0, percentAchieved: 0 };
  }

  const target = (liberdadeCategory.targetPercent / 100) * totalIncome;
  const summaryCat = categorySummary.find((cat) => cat.id === liberdadeCategory.id);
  const actual = summaryCat?.totalSpent ?? 0;

  const percentAchieved = target > 0 ? (actual / target) * 100 : 0;
  const monthPeriod = getMonthPeriod(dayOfMonth);

  let score: number;

  if (percentAchieved >= 100) {
    score = 100;
  } else if (monthPeriod === "early") {
    score = 70 + percentAchieved * 0.3;
  } else if (monthPeriod === "mid") {
    score = 40 + percentAchieved * 0.6;
  } else {
    score = percentAchieved;
  }

  return { score: Math.min(100, score), actual, target, percentAchieved };
}

function calculateCategoriesOnBudgetFactor(categorySummary: CategorySummaryRow[]): {
  score: number;
  onBudget: number;
  total: number;
} {
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

function calculateOutliersFactor(outlierCount: number): { score: number; count: number } {
  const score = Math.max(0, 100 - outlierCount * 20);
  return { score, count: outlierCount };
}

function calculateSettlementFactor(settlementData: SettlementRow[]): {
  score: number;
  balanced: boolean;
} {
  const balanced = settlementData.every((person) => Math.abs(person.balance) < 1);
  const totalImbalance = settlementData.reduce((sum, person) => sum + Math.abs(person.balance), 0);
  const score = balanced ? 100 : Math.max(0, 100 - Math.min(totalImbalance / 10, 100));

  return { score, balanced };
}

function calculateFreeBalanceFactor(
  freeBalance: number,
  totalIncome: number,
): { score: number; value: number } {
  if (totalIncome <= 0) {
    return { score: 0, value: 0 };
  }

  const balancePercent = (freeBalance / totalIncome) * 100;

  let score: number;
  if (freeBalance >= 0) {
    score = 100;
  } else {
    score = Math.max(0, 100 + balancePercent);
  }

  return { score, value: freeBalance };
}

function getHealthStatus(score: number): HealthStatus {
  if (score >= 80) return "healthy";
  if (score >= 50) return "warning";
  return "critical";
}

// ============================================================================
// Reason Generation
// ============================================================================

function generateReason(
  liberdadeFactor: { percentAchieved: number; actual: number; target: number },
  categoriesFactor: { onBudget: number; total: number },
  outliersFactor: { count: number },
  freeBalanceFactor: { value: number },
  dayOfMonth: number,
): string | undefined {
  const issues: string[] = [];
  const monthPeriod = getMonthPeriod(dayOfMonth);

  if (liberdadeFactor.percentAchieved < 100) {
    const remaining = liberdadeFactor.target - liberdadeFactor.actual;

    if (monthPeriod === "early" && liberdadeFactor.percentAchieved < 50) {
      issues.push(
        `Meta de poupança: ${formatCurrency(liberdadeFactor.actual)} de ${formatCurrency(liberdadeFactor.target)}`,
      );
    } else {
      issues.push(
        `Meta de poupança em ${Math.round(liberdadeFactor.percentAchieved)}%, faltam ${formatCurrency(remaining)}`,
      );
    }
  }

  if (categoriesFactor.onBudget < categoriesFactor.total) {
    const overBudget = categoriesFactor.total - categoriesFactor.onBudget;
    issues.push(`${overBudget} categoria${overBudget > 1 ? "s" : ""} acima do orçamento`);
  }

  if (outliersFactor.count > 0) {
    issues.push(
      `${outliersFactor.count} gasto${outliersFactor.count > 1 ? "s" : ""} fora do padrão`,
    );
  }

  if (freeBalanceFactor.value < 0) {
    issues.push("Saldo livre negativo");
  }

  if (issues.length === 0) {
    if (liberdadeFactor.percentAchieved >= 100) {
      return "Meta de poupança atingida! Finanças saudáveis.";
    }
    return undefined;
  }

  return issues.slice(0, 2).join(", ");
}

// ============================================================================
// Main Calculation Function
// ============================================================================

export function calculateHealthScore(
  people: Person[],
  categories: Category[],
  transactions: Transaction[],
  outlierCount: number,
  dayOfMonth: number,
): { score: number; status: HealthStatus; reason?: string } {
  // Calculate effective income from transactions only
  // (includes virtual income templates from people's salaries)
  const incomeBreakdown = calculateIncomeBreakdown(transactions);
  const effectiveIncome = incomeBreakdown.netIncome;

  const categorySummary = calculateCategorySummary(categories, transactions, effectiveIncome);

  const excludedCategoryIds = new Set(
    categories
      .filter((category) => shouldCategoryAutoExcludeFromSplit(category.name))
      .map((category) => category.id),
  );

  const expenseTransactions = getExpenseTransactions(transactions);
  const transactionsForFairDistribution = expenseTransactions.filter(
    (transaction) =>
      transaction.categoryId !== null &&
      !excludedCategoryIds.has(transaction.categoryId) &&
      !transaction.excludeFromSplit,
  );

  const peopleWithShare = calculatePeopleShareWithIncomeTransactions(people, transactions);
  const totalExpensesForDistribution = calculateTotalExpenses(transactionsForFairDistribution);
  const settlementData = calculateSettlementData(
    peopleWithShare,
    transactionsForFairDistribution,
    totalExpensesForDistribution,
  );

  const totalExpensesAll = calculateTotalExpenses(expenseTransactions);
  const freeBalance = effectiveIncome - totalExpensesAll;

  const liberdadeFactor = calculateLiberdadeFinanceiraFactor(
    categories,
    categorySummary,
    effectiveIncome,
    dayOfMonth,
  );
  const categoriesFactor = calculateCategoriesOnBudgetFactor(categorySummary);
  const outliersFactor = calculateOutliersFactor(outlierCount);
  const settlementFactor = calculateSettlementFactor(settlementData);
  const freeBalanceFactor = calculateFreeBalanceFactor(freeBalance, effectiveIncome);

  const score = Math.round(
    liberdadeFactor.score * WEIGHTS.liberdadeFinanceira +
      categoriesFactor.score * WEIGHTS.categoriesOnBudget +
      outliersFactor.score * WEIGHTS.outliers +
      settlementFactor.score * WEIGHTS.settlement +
      freeBalanceFactor.score * WEIGHTS.freeBalance,
  );

  const status = getHealthStatus(score);
  const reason = generateReason(
    liberdadeFactor,
    categoriesFactor,
    outliersFactor,
    freeBalanceFactor,
    dayOfMonth,
  );

  return { score, status, reason };
}
