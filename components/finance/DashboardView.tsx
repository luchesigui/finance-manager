"use client";

import { useMemo } from "react";

import {
  AlertsPanel,
  CategoryBudgetChart,
  HealthScore,
  MonthlyTrendChart,
  OutlierSpotlight,
  QuickStatsGrid,
  SavingsConfetti,
  useDashboardAlerts,
  useHealthScore,
  type MonthlyTrendData,
  type OutlierTransaction,
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
import { formatMonthYear } from "@/lib/format";

import { useCategories } from "./contexts/CategoriesContext";
import { useCurrentMonth } from "./contexts/CurrentMonthContext";
import { usePeople } from "./contexts/PeopleContext";
import { useTransactions } from "./contexts/TransactionsContext";
import { MonthNavigator } from "./MonthNavigator";

// ============================================================================
// Constants
// ============================================================================

const LIBERDADE_FINANCEIRA_CATEGORY = "liberdade financeira";

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

  // Build excluded category IDs for fair distribution
  const excludedCategoryIds = useMemo(
    () =>
      new Set(
        categories
          .filter((category) => shouldCategoryAutoExcludeFromSplit(category.name))
          .map((category) => category.id),
      ),
    [categories],
  );

  // Calculate total expenses (including Liberdade Financeira for display)
  const expenseTransactions = useMemo(
    () => getExpenseTransactions(transactionsForCalculations),
    [transactionsForCalculations],
  );

  const totalExpensesAll = useMemo(
    () => calculateTotalExpenses(expenseTransactions),
    [expenseTransactions],
  );

  // Find outlier transactions with historical data
  const { outlierTransactions, outlierCount } = useMemo(() => {
    if (isOutlierLoading) {
      return { outlierTransactions: [] as OutlierTransaction[], outlierCount: 0 };
    }

    const outliers = expenseTransactions
      .filter((t) => isOutlier(t))
      .map((t) => {
        // Get category statistics to calculate historical average
        // Note: We're using a simple approximation here since we have the threshold
        // A more accurate approach would require the actual mean from the statistics
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

  // Health score calculation
  const healthScore = useHealthScore({
    people,
    categories,
    transactions: transactionsForCalculations,
    outlierCount,
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

  // Generate mock trend data (in a real implementation, this would come from an API)
  const trendData = useMemo(
    () => generateMockTrendData(selectedYear, selectedMonthNumber),
    [selectedYear, selectedMonthNumber],
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
      />

      {/* Alerts Panel */}
      <AlertsPanel alerts={alerts} />

      {/* Two Column Layout for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-grid-gap">
        {/* Category Budget Chart */}
        <CategoryBudgetChart categorySummary={categorySummary} totalIncome={effectiveIncome} />

        {/* Monthly Trend Chart */}
        <MonthlyTrendChart data={trendData} />
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

// ============================================================================
// Mock Data Generator (Temporary)
// ============================================================================

/**
 * Generates mock trend data for the chart.
 * In a production implementation, this should come from a /api/dashboard/trends endpoint.
 */
function generateMockTrendData(year: number, month: number): MonthlyTrendData[] {
  const data: MonthlyTrendData[] = [];
  const monthNames = [
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

  // Generate 6 months of data ending at the current month
  for (let i = 5; i >= 0; i--) {
    let m = month - i;
    let y = year;

    if (m <= 0) {
      m += 12;
      y -= 1;
    }

    // Mock data - in production, this would be actual historical data
    const baseIncome = 10000 + Math.random() * 2000;
    const baseExpenses = 7000 + Math.random() * 2000;
    const baseSavings = 1500 + Math.random() * 700;
    const savingsTarget = 2000;

    data.push({
      month: monthNames[m - 1],
      income: Math.round(baseIncome),
      expenses: Math.round(baseExpenses),
      savings: Math.round(baseSavings),
      savingsTarget,
      freeBalance: Math.round(baseIncome - baseExpenses),
    });
  }

  return data;
}
