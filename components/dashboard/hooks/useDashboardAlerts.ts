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

export type AlertType = "critical" | "warning" | "info" | "success";
export type AlertCategory = "savings" | "budget" | "outlier" | "forecast" | "settlement";

export type Alert = {
  id: string;
  type: AlertType;
  category: AlertCategory;
  title: string;
  description: string;
};

// ============================================================================
// Constants
// ============================================================================

const LIBERDADE_FINANCEIRA_CATEGORY = "liberdade financeira";

// ============================================================================
// Helper Functions
// ============================================================================

function getLiberdadeFinanceiraCategory(categories: Category[]): Category | undefined {
  return categories.find(
    (cat) => normalizeCategoryName(cat.name) === LIBERDADE_FINANCEIRA_CATEGORY,
  );
}

function generateSavingsAlerts(
  categories: Category[],
  categorySummary: CategorySummaryRow[],
  totalIncome: number,
): Alert[] {
  const alerts: Alert[] = [];
  const liberdadeCategory = getLiberdadeFinanceiraCategory(categories);

  if (!liberdadeCategory || totalIncome <= 0) {
    return alerts;
  }

  const target = (liberdadeCategory.targetPercent / 100) * totalIncome;
  const summaryCat = categorySummary.find((cat) => cat.id === liberdadeCategory.id);
  const actual = summaryCat?.totalSpent ?? 0;
  const percentAchieved = target > 0 ? (actual / target) * 100 : 0;
  const remaining = target - actual;

  if (percentAchieved >= 100) {
    alerts.push({
      id: "savings-goal-achieved",
      type: "success",
      category: "savings",
      title: "Meta Atingida!",
      description: `Meta de Liberdade Financeira alcançada: ${formatCurrency(actual)}`,
    });
  } else if (percentAchieved < 80) {
    alerts.push({
      id: "savings-goal-critical",
      type: "critical",
      category: "savings",
      title: `Meta Lib. Financeira em ${Math.round(percentAchieved)}%`,
      description: `Faltam ${formatCurrency(remaining)} para atingir a meta`,
    });
  } else {
    alerts.push({
      id: "savings-goal-warning",
      type: "warning",
      category: "savings",
      title: `Lib. Financeira em risco (${Math.round(percentAchieved)}%)`,
      description: `Faltam ${formatCurrency(remaining)} para atingir a meta`,
    });
  }

  return alerts;
}

function generateBudgetAlerts(categorySummary: CategorySummaryRow[]): Alert[] {
  const alerts: Alert[] = [];

  // Filter out Liberdade Financeira
  const regularCategories = categorySummary.filter(
    (cat) => normalizeCategoryName(cat.name) !== LIBERDADE_FINANCEIRA_CATEGORY,
  );

  // Find categories over budget (> 100% of target)
  const overBudgetCategories = regularCategories.filter(
    (cat) => cat.targetPercent > 0 && cat.realPercentOfIncome > cat.targetPercent,
  );

  // Critical: Categories over 150% of target
  const criticalCategories = overBudgetCategories.filter(
    (cat) => cat.realPercentOfIncome > cat.targetPercent * 1.5,
  );

  // Warning: Categories between 100% and 150% of target
  const warningCategories = overBudgetCategories.filter(
    (cat) =>
      cat.realPercentOfIncome > cat.targetPercent &&
      cat.realPercentOfIncome <= cat.targetPercent * 1.5,
  );

  if (criticalCategories.length > 0) {
    alerts.push({
      id: "budget-critical",
      type: "critical",
      category: "budget",
      title: `${criticalCategories.length} categoria${criticalCategories.length > 1 ? "s" : ""} estourada${criticalCategories.length > 1 ? "s" : ""}`,
      description: criticalCategories.map((cat) => cat.name).join(", "),
    });
  }

  if (warningCategories.length > 0) {
    alerts.push({
      id: "budget-warning",
      type: "warning",
      category: "budget",
      title: `${warningCategories.length} categoria${warningCategories.length > 1 ? "s" : ""} acima do orçamento`,
      description: warningCategories
        .map((cat) => {
          const percent = Math.round((cat.realPercentOfIncome / cat.targetPercent) * 100);
          return `${cat.name} (${percent}%)`;
        })
        .join(", "),
    });
  }

  return alerts;
}

function generateOutlierAlerts(outlierCount: number): Alert[] {
  if (outlierCount === 0) return [];

  return [
    {
      id: "outliers-detected",
      type: "warning",
      category: "outlier",
      title: `${outlierCount} gasto${outlierCount > 1 ? "s" : ""} fora do padrão detectado${outlierCount > 1 ? "s" : ""}`,
      description: "Revise os gastos atípicos na seção abaixo",
    },
  ];
}

function generateForecastAlerts(transactions: Transaction[]): Alert[] {
  const forecastTransactions = transactions.filter((t) => t.isForecast && t.type !== "income");

  if (forecastTransactions.length === 0) return [];

  const totalForecast = forecastTransactions.reduce((sum, t) => sum + t.amount, 0);

  return [
    {
      id: "forecasts-pending",
      type: "warning",
      category: "forecast",
      title: "Previsões pendentes",
      description: `${formatCurrency(totalForecast)} em previsões aguardando confirmação`,
    },
  ];
}

function generateSettlementAlerts(
  settlementData: Array<{ name: string; balance: number }>,
): Alert[] {
  const alerts: Alert[] = [];

  const debtors = settlementData.filter((person) => person.balance < -0.01);
  const creditors = settlementData.filter((person) => person.balance > 0.01);

  if (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];

    alerts.push({
      id: "settlement-pending",
      type: "info",
      category: "settlement",
      title: "Acerto pendente",
      description: `${debtor.name} deve transferir ${formatCurrency(Math.abs(debtor.balance))} para ${creditor.name}`,
    });
  }

  return alerts;
}

function generateFreeBalanceAlerts(freeBalance: number): Alert[] {
  if (freeBalance >= 0) return [];

  return [
    {
      id: "negative-balance",
      type: "critical",
      category: "budget",
      title: "Saldo negativo",
      description: `Você está ${formatCurrency(Math.abs(freeBalance))} no vermelho`,
    },
  ];
}

// ============================================================================
// Hook
// ============================================================================

type UseDashboardAlertsParams = {
  people: Person[];
  categories: Category[];
  transactions: Transaction[];
  outlierCount: number;
};

export function useDashboardAlerts({
  people,
  categories,
  transactions,
  outlierCount,
}: UseDashboardAlertsParams): Alert[] {
  return useMemo(() => {
    // Check if there are no transactions for this month
    if (transactions.length === 0) {
      return [
        {
          id: "no-data",
          type: "info",
          category: "budget",
          title: "Sem dados para este mês",
          description:
            "Nenhuma transação registrada. Adicione lançamentos para ver o resumo financeiro.",
        },
      ];
    }

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

    // Calculate all expenses
    const totalExpensesAll = calculateTotalExpenses(expenseTransactions);
    const freeBalance = effectiveIncome - totalExpensesAll;

    // Generate all alerts
    const alerts: Alert[] = [
      ...generateSavingsAlerts(categories, categorySummary, effectiveIncome),
      ...generateFreeBalanceAlerts(freeBalance),
      ...generateBudgetAlerts(categorySummary),
      ...generateOutlierAlerts(outlierCount),
      ...generateForecastAlerts(transactions),
      ...generateSettlementAlerts(settlementData),
    ];

    // Sort by priority: critical > warning > info > success
    const priorityOrder: Record<AlertType, number> = {
      critical: 0,
      warning: 1,
      info: 2,
      success: 3,
    };

    alerts.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

    return alerts;
  }, [people, categories, transactions, outlierCount]);
}
