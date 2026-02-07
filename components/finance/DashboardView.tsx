"use client";

import { useMemo } from "react";

import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { CategoryBudgetChart } from "@/components/dashboard/CategoryBudgetChart";
import { ForecastSpotlight } from "@/components/dashboard/ForecastSpotlight";
import { HealthScore } from "@/components/dashboard/HealthScore";
import {
  HealthTrendChart,
  type HealthTrendDataPoint,
} from "@/components/dashboard/HealthTrendChart";
import { OutlierSpotlight, type OutlierTransaction } from "@/components/dashboard/OutlierSpotlight";
import { QuickStatsGrid } from "@/components/dashboard/QuickStatsGrid";
import { SavingsConfetti } from "@/components/dashboard/SavingsConfetti";
import { useDashboardAlerts } from "@/components/dashboard/hooks/useDashboardAlerts";
import { useHealthScore } from "@/components/dashboard/hooks/useHealthScore";
import {
  formatPeriod,
  generatePeriodRange,
  useHealthScoreQuery,
} from "@/components/dashboard/hooks/useHealthScoreQuery";
import {
  calculateCategorySummary,
  calculateIncomeBreakdown,
  calculateTotalExpenses,
  calculateTotalIncome,
  getExpenseTransactions,
} from "@/components/finance/hooks/useFinanceCalculations";
import { useOutlierDetection } from "@/components/finance/hooks/useOutlierDetection";
import { shouldCategoryAutoExcludeFromSplit } from "@/lib/constants";

import { useCategoriesData } from "@/components/finance/hooks/useCategoriesData";
import { usePeopleData } from "@/components/finance/hooks/usePeopleData";
import { useTransactionsData } from "@/components/finance/hooks/useTransactionsData";
import { useCurrentMonth } from "@/lib/stores/currentMonthStore";
import { MonthNavigator } from "./MonthNavigator";

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

// Chart shows: 3 past months + current + 2 future months = 6 total
const MONTHS_BEFORE = 3;
const MONTHS_AFTER = 2;

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
 * Parses a period string (yyyy-mm) into year and month.
 */
function parsePeriod(period: string): { year: number; month: number } {
  const [yearStr, monthStr] = period.split("-");
  return {
    year: Number.parseInt(yearStr, 10),
    month: Number.parseInt(monthStr, 10),
  };
}

/**
 * Converts API health score data to chart data points.
 */
function convertToChartData(
  apiData: Array<{ period: string; score: number }> | undefined,
  selectedPeriod: string,
): HealthTrendDataPoint[] {
  if (!apiData || apiData.length === 0) {
    return [];
  }

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;

  return apiData.map((item) => {
    const { year, month } = parsePeriod(item.period);
    const isFutureMonth = year > todayYear || (year === todayYear && month > todayMonth);

    return {
      month: MONTH_NAMES_SHORT[month - 1],
      monthLabel: `${MONTH_NAMES_FULL[month - 1]} ${year}`,
      score: item.score,
      isProjected: isFutureMonth,
      isCurrent: item.period === selectedPeriod,
    };
  });
}

// ============================================================================
// Component
// ============================================================================

export function DashboardView() {
  const { selectedMonthDate, selectedYear, selectedMonthNumber } = useCurrentMonth();
  const { people, isPeopleLoading } = usePeopleData();
  const { categories, isCategoriesLoading } = useCategoriesData();
  const {
    transactionsForCalculations,
    transactionsForSelectedMonth,
    isTransactionsLoading,
    updateTransactionById,
    isForecastIncluded,
    setForecastInclusionOverride,
  } = useTransactionsData();

  // Combined loading state for health score calculation
  const isDataLoading = isPeopleLoading || isCategoriesLoading || isTransactionsLoading;

  // Current period string for comparisons
  const selectedPeriod = formatPeriod(selectedYear, selectedMonthNumber);

  // Generate periods for the trend chart (3 past + current + 2 future)
  const trendPeriods = useMemo(
    () => generatePeriodRange(selectedYear, selectedMonthNumber, MONTHS_BEFORE, MONTHS_AFTER),
    [selectedYear, selectedMonthNumber],
  );

  // Fetch health scores from API for trend chart
  const { data: healthScoreApiData, isLoading: isHealthScoreLoading } = useHealthScoreQuery({
    periods: trendPeriods,
  });

  // Convert API data to chart format
  const healthTrendData = useMemo(
    () => convertToChartData(healthScoreApiData, selectedPeriod),
    [healthScoreApiData, selectedPeriod],
  );

  // Get the current month's score from API data (for consistency with chart)
  const currentMonthApiScore = useMemo(() => {
    const currentData = healthScoreApiData?.find((d) => d.period === selectedPeriod);
    return currentData?.score ?? 0;
  }, [healthScoreApiData, selectedPeriod]);

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

  // Calculate total expenses
  const expenseTransactions = useMemo(
    () => getExpenseTransactions(transactionsForCalculations),
    [transactionsForCalculations],
  );

  // All expenses (including Liberdade Financeira) - used for free balance calculation
  const totalExpensesAll = useMemo(
    () => calculateTotalExpenses(expenseTransactions),
    [expenseTransactions],
  );

  // Expenses excluding Liberdade Financeira (savings) - used for spending budget comparison
  const totalExpensesExcludingSavings = useMemo(
    () =>
      calculateTotalExpenses(
        expenseTransactions.filter(
          (t) => t.categoryId === null || !excludedCategoryIds.has(t.categoryId),
        ),
      ),
    [expenseTransactions, excludedCategoryIds],
  );

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

  // Health score calculation (client-side for detailed factors needed by QuickStatsGrid)
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

  // Get forecast transactions for the selected month
  const forecastTransactions = useMemo(
    () => transactionsForSelectedMonth.filter((t) => t.isForecast && t.type !== "income"),
    [transactionsForSelectedMonth],
  );

  return (
    <div className="space-y-6">
      {/* Savings Goal Celebration */}
      <SavingsConfetti savingsGoalAchieved={savingsGoalAchieved} yearMonth={yearMonth} />

      {/* Month Navigator */}
      <div className="animate-slide-up stagger-1">
        <MonthNavigator />
      </div>

      {/* Health Score Hero */}
      <div className="animate-slide-up stagger-2">
        <HealthScore healthScore={healthScore} isLoading={isDataLoading} />
      </div>

      {/* Quick Stats Grid */}
      <div className="animate-slide-up stagger-3">
        <QuickStatsGrid
          factors={healthScore.factors}
          totalExpenses={totalExpensesExcludingSavings}
          effectiveIncome={effectiveIncome}
        />
      </div>

      {/* Alerts Panel */}
      <div className="animate-slide-up stagger-4">
        <AlertsPanel alerts={alerts} />
      </div>

      {/* Forecast Spotlight - right after alerts */}
      <div className="animate-slide-up stagger-5">
        <ForecastSpotlight
          forecasts={forecastTransactions}
          categories={categories}
          totalExpenses={totalExpensesAll}
          isForecastIncluded={isForecastIncluded}
          setForecastInclusionOverride={setForecastInclusionOverride}
          updateTransactionById={updateTransactionById}
        />
      </div>

      {/* Outlier Spotlight - right after forecast */}
      <div className="animate-slide-up stagger-6">
        <OutlierSpotlight
          outliers={outlierTransactions}
          categories={categories}
          totalExpenses={totalExpensesAll}
        />
      </div>

      {/* Two Column Layout for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-grid-gap animate-slide-up stagger-6">
        {/* Category Budget Chart */}
        <CategoryBudgetChart categorySummary={categorySummary} totalIncome={effectiveIncome} />

        {/* Health Trend Chart - uses API data for consistency */}
        <HealthTrendChart
          data={healthTrendData}
          currentScore={currentMonthApiScore || healthScore.score}
          isLoading={isHealthScoreLoading}
        />
      </div>
    </div>
  );
}
