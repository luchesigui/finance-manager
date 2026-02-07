import { dayjs } from "@/lib/dateUtils";
import type { ChartDataPoint, ProjectionResult, SimulationSummary } from "@/lib/simulationTypes";

// ============================================================================
// Constants
// ============================================================================

const PROJECTION_MONTHS = 12;

const MONTH_NAMES = [
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

// ============================================================================
// Functions
// ============================================================================

export function generateMonthLabels(
  startDate: Date,
  count: number,
): { period: string; periodKey: string }[] {
  const labels: { period: string; periodKey: string }[] = [];

  for (let index = 0; index < count; index++) {
    const date = dayjs(startDate).add(index, "month");
    const monthIndex = date.month();
    const year = date.year();
    labels.push({
      period: `${MONTH_NAMES[monthIndex]} ${year}`,
      periodKey: date.format("YYYY-MM"),
    });
  }

  return labels;
}

export function calculateProjection(
  monthlyIncome: number,
  monthlyExpenses: number,
  startDate: Date,
  emergencyFund: number,
): ChartDataPoint[] {
  const months = generateMonthLabels(startDate, PROJECTION_MONTHS);
  const monthlyBalance = monthlyIncome - monthlyExpenses;

  let cumulativeFreedom = 0;
  let cumulativeDeficit = 0;
  let emergencyFundRemaining = emergencyFund;

  return months.map(({ period, periodKey }) => {
    if (monthlyBalance >= 0) {
      cumulativeFreedom += monthlyBalance;
    } else {
      // Deficit scenario: deduct from emergency fund first
      if (emergencyFundRemaining > 0) {
        const deficitThisMonth = Math.abs(monthlyBalance);
        if (emergencyFundRemaining >= deficitThisMonth) {
          emergencyFundRemaining -= deficitThisMonth;
        } else {
          const uncoveredDeficit = deficitThisMonth - emergencyFundRemaining;
          emergencyFundRemaining = 0;
          cumulativeDeficit -= uncoveredDeficit;
        }
      } else {
        cumulativeDeficit += monthlyBalance;
      }
    }

    return {
      period,
      periodKey,
      income: monthlyIncome,
      expenses: monthlyExpenses,
      monthlyBalance,
      cumulativeFreedom,
      cumulativeDeficit,
      emergencyFundRemaining,
    };
  });
}

export function buildProjectionResult(
  simulatedIncome: number,
  totalSimulatedExpenses: number,
  baselineIncome: number,
  baselineExpenses: number,
  emergencyFund: number,
): ProjectionResult {
  const startDate = new Date();
  const chartData = calculateProjection(
    simulatedIncome,
    totalSimulatedExpenses,
    startDate,
    emergencyFund,
  );

  const monthlyBalance = simulatedIncome - totalSimulatedExpenses;
  const lastDataPoint = chartData[chartData.length - 1];

  let firstDeficitMonth: string | null = null;
  let emergencyFundDepletedMonth: string | null = null;
  for (const point of chartData) {
    if (point.cumulativeDeficit < 0 && !firstDeficitMonth) {
      firstDeficitMonth = point.period;
    }
    if (point.emergencyFundRemaining === 0 && emergencyFund > 0 && !emergencyFundDepletedMonth) {
      emergencyFundDepletedMonth = point.period;
    }
  }

  const incomeChangePercent =
    baselineIncome > 0 ? ((simulatedIncome - baselineIncome) / baselineIncome) * 100 : 0;

  const baselineBalance = baselineIncome - baselineExpenses;
  const balanceChangePercent =
    baselineBalance !== 0
      ? ((monthlyBalance - baselineBalance) / Math.abs(baselineBalance)) * 100
      : 0;

  const freedomTarget = 150000;
  const monthsToFreedom =
    monthlyBalance > 0 ? Math.ceil(freedomTarget / monthlyBalance) : Number.POSITIVE_INFINITY;

  const freedomTargetDate =
    monthsToFreedom < Number.POSITIVE_INFINITY
      ? dayjs().add(monthsToFreedom, "month").format("MMM YYYY")
      : "Indefinido";

  const baselineMonthsToFreedom =
    baselineBalance > 0 ? Math.ceil(freedomTarget / baselineBalance) : Number.POSITIVE_INFINITY;

  const freedomAcceleration =
    baselineMonthsToFreedom === Number.POSITIVE_INFINITY
      ? 0
      : baselineMonthsToFreedom - monthsToFreedom;

  const emergencyFundMonths =
    monthlyBalance < 0
      ? Math.floor(emergencyFund / Math.abs(monthlyBalance))
      : Number.POSITIVE_INFINITY;

  const baselineChartData = calculateProjection(
    baselineIncome,
    baselineExpenses,
    startDate,
    emergencyFund,
  );
  const baselineTotalFreedom = baselineChartData[baselineChartData.length - 1].cumulativeFreedom;

  const summary: SimulationSummary = {
    monthlyIncome: simulatedIncome,
    monthlyExpenses: totalSimulatedExpenses,
    monthlyBalance,
    totalFreedom: lastDataPoint.cumulativeFreedom,
    totalDeficit: lastDataPoint.cumulativeDeficit,
    firstDeficitMonth,
    freedomTargetDate,
    freedomAcceleration,
    incomeChangePercent,
    balanceChangePercent,
    emergencyFundMonths,
    emergencyFundDepleted: lastDataPoint.emergencyFundRemaining === 0 && emergencyFund > 0,
    emergencyFundDepletedMonth,
    baselineMonthlyBalance: baselineBalance,
    baselineTotalFreedom,
  };

  return { chartData, summary };
}
