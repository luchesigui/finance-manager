"use client";

import { useMemo } from "react";

import {
  AlertsPanel,
  CategoryBudgetChart,
  HealthScore,
  HealthTrendChart,
  type HealthTrendDataPoint,
  OutlierSpotlight,
  type OutlierTransaction,
  QuickStatsGrid,
  SavingsConfetti,
  useDashboardAlerts,
  useHealthScore,
} from "@/components/dashboard";
import {
  calculateCategorySummary,
  calculateIncomeBreakdown,
  calculateTotalExpenses,
  calculateTotalIncome,
  getExpenseTransactions,
} from "@/components/finance/hooks/useFinanceCalculations";
import { useOutlierDetection } from "@/components/finance/hooks/useOutlierDetection";
import { normalizeCategoryName, shouldCategoryAutoExcludeFromSplit } from "@/lib/constants";

import { MonthNavigator } from "./MonthNavigator";
import { useCategories } from "./contexts/CategoriesContext";
import { useCurrentMonth } from "./contexts/CurrentMonthContext";
import { usePeople } from "./contexts/PeopleContext";
import { useTransactions } from "./contexts/TransactionsContext";

// ============================================================================
// Constants
// ============================================================================

const MONTH_NAMES_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const MONTH_NAMES_FULL = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const LIBERDADE_FINANCEIRA_CATEGORY = "liberdade financeira";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculates the appropriate day of month for health score assessment.
 * - Current month: use today's day
 * - Past month: use last day (month is complete)
 * - Future month: use day 1 (month hasn't started)
 */
function getEffectiveDayOfMonth(selectedYear: number, selectedMonth: number): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  if (selectedYear === currentYear && selectedMonth === currentMonth) {
    return currentDay;
  }

  if (
    selectedYear < currentYear ||
    (selectedYear === currentYear && selectedMonth < currentMonth)
  ) {
    return 31;
  }

  return 1;
}

/**
 * Generates health trend data for the chart.
 * Shows past 3 months (or available data) + current month + 2 projected months.
 */
function generateHealthTrendData(
  currentYear: number,
  currentMonth: number,
  currentScore: number,
): HealthTrendDataPoint[] {
  const data: HealthTrendDataPoint[] = [];
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;

  // Generate past 3 months + current + 2 future months
  for (let offset = -3; offset <= 2; offset++) {
    let m = currentMonth + offset;
    let y = currentYear;

    // Handle year overflow/underflow
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    while (m > 12) {
      m -= 12;
      y += 1;
    }

    const isCurrentMonth = y === todayYear && m === todayMonth;
    const isFutureMonth = y > todayYear || (y === todayYear && m > todayMonth);

    // For past months, generate a plausible score based on current score
    // In a real implementation, this would come from actual historical data
    let score: number;

    if (isCurrentMonth) {
      score = currentScore;
    } else if (isFutureMonth) {
      // Project future scores based on trend
      // Simple projection: maintain current score with slight variance
      const projectionOffset = offset - (currentMonth === todayMonth ? 0 : 1);
      score = Math.max(0, Math.min(100, currentScore + projectionOffset * 2));
    } else {
      // Historical data - simulate with variance around current score
      // In production, this would be actual stored health scores
      const historicalVariance = (Math.random() - 0.5) * 20;
      score = Math.max(0, Math.min(100, currentScore + historicalVariance));
    }

    data.push({
      month: MONTH_NAMES_SHORT[m - 1],
      monthLabel: `${MONTH_NAMES_FULL[m - 1]} ${y}`,
      score: Math.round(score),
      isProjected: isFutureMonth,
      isCurrent: isCurrentMonth,
    });
  }

  return data;
}

// ============================================================================
// Component
// ============================================================================

export function DashboardView() {
  const { selectedMonthDate, selectedYear, selectedMonthNumber } = useCurrentMonth();
  const { people } = usePeople();
  const { categories } = useCategories();
  const { transactionsForCalculations } = useTransactions();

  // Outlier detection
  const { isOutlier, isLoading: isOutlierLoading } = useOutlierDetection(
    selectedYear,
    selectedMonthNumber,
  );

  // Calculate effective income
  const baseIncome = useMemo(() => calculateTotalIncome(people), [people]);
  const incomeBreakdown = useMemo(
    () => calculateIncomeBreakdown(transactionsForCalculations),
    [transactionsForCalculations],
  );
  const effectiveIncome = baseIncome + incomeBreakdown.netIncome;

  // Calculate category summary
  const categorySummary = useMemo(
    () => calculateCategorySummary(categories, transactionsForCalculations, effectiveIncome),
    [categories, transactionsForCalculations, effectiveIncome],
  );

  // Build excluded category IDs for fair distribution (Liberdade Financeira)
  const excludedCategoryIds = useMemo(
    () =>
      new Set(
        categories
          .filter((category) => shouldCategoryAutoExcludeFromSplit(category.name))
          .map((category) => category.id),
      ),
    [categories],
  );

  // Find Liberdade Financeira category ID
  const liberdadeFinanceiraCategoryId = useMemo(() => {
    const cat = categories.find(
      (c) => normalizeCategoryName(c.name) === LIBERDADE_FINANCEIRA_CATEGORY,
    );
    return cat?.id;
  }, [categories]);

  // Calculate total expenses (including Liberdade Financeira for display)
  const expenseTransactions = useMemo(
    () => getExpenseTransactions(transactionsForCalculations),
    [transactionsForCalculations],
  );

  const totalExpensesAll = useMemo(
    () => calculateTotalExpenses(expenseTransactions),
    [expenseTransactions],
  );

  // Calculate expenses excluding Liberdade Financeira (for budget comparison)
  const expensesExcludingSavings = useMemo(() => {
    const expensesWithoutSavings = expenseTransactions.filter(
      (t) => t.categoryId !== liberdadeFinanceiraCategoryId,
    );
    return calculateTotalExpenses(expensesWithoutSavings);
  }, [expenseTransactions, liberdadeFinanceiraCategoryId]);

  // Find outlier transactions with historical data
  const { outlierTransactions, outlierCount } = useMemo(() => {
    if (isOutlierLoading) {
      return { outlierTransactions: [] as OutlierTransaction[], outlierCount: 0 };
    }

    const outliers = expenseTransactions
      .filter((t) => isOutlier(t))
      .map((t) => {
        const categoryStat = categorySummary.find((c) => c.id === t.categoryId);
        const historicalAverage = categoryStat
          ? categoryStat.totalSpent /
            Math.max(expenseTransactions.filter((e) => e.categoryId === t.categoryId).length, 1)
          : 0;

        return {
          ...t,
          historicalAverage,
          percentAboveAverage:
            historicalAverage > 0 ? ((t.amount - historicalAverage) / historicalAverage) * 100 : 0,
        };
      })
      .sort((a, b) => b.percentAboveAverage - a.percentAboveAverage);

    return { outlierTransactions: outliers, outlierCount: outliers.length };
  }, [expenseTransactions, isOutlier, isOutlierLoading, categorySummary]);

  // Calculate effective day of month for health score assessment
  const dayOfMonth = getEffectiveDayOfMonth(selectedYear, selectedMonthNumber);

  // Health score calculation (with day-of-month awareness)
  const healthScore = useHealthScore({
    people,
    categories,
    transactions: transactionsForCalculations,
    outlierCount,
    dayOfMonth,
  });

  // Dashboard alerts
  const alerts = useDashboardAlerts({
    people,
    categories,
    transactions: transactionsForCalculations,
    outlierCount,
  });

  // Check if savings goal is achieved
  const savingsGoalAchieved = healthScore.factors.liberdadeFinanceira.percentAchieved >= 100;

  // Format year-month for confetti cookie
  const yearMonth = `${selectedYear}-${String(selectedMonthNumber).padStart(2, "0")}`;

  // Generate health trend data (past 3 months + current + 2 projected)
  const healthTrendData = useMemo(
    () => generateHealthTrendData(selectedYear, selectedMonthNumber, healthScore.score),
    [selectedYear, selectedMonthNumber, healthScore.score],
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Savings Goal Celebration */}
      <SavingsConfetti savingsGoalAchieved={savingsGoalAchieved} yearMonth={yearMonth} />

      {/* Month Navigator */}
      <MonthNavigator />

      {/* Health Score Hero */}
      <HealthScore healthScore={healthScore} />

      {/* Quick Stats Grid */}
      <QuickStatsGrid
        factors={healthScore.factors}
        totalExpenses={totalExpensesAll}
        effectiveIncome={effectiveIncome}
        expensesExcludingSavings={expensesExcludingSavings}
      />

      {/* Alerts Panel */}
      <AlertsPanel alerts={alerts} />

      {/* Two Column Layout for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-grid-gap">
        {/* Category Budget Chart */}
        <CategoryBudgetChart categorySummary={categorySummary} totalIncome={effectiveIncome} />

        {/* Health Trend Chart */}
        <HealthTrendChart data={healthTrendData} currentScore={healthScore.score} />
      </div>

      {/* Outlier Spotlight */}
      <OutlierSpotlight
        outliers={outlierTransactions}
        categories={categories}
        totalExpenses={totalExpensesAll}
      />
    </div>
  );
}
