"use client";

import { dayjs } from "@/lib/dateUtils";
import type {
  ChartDataPoint,
  EditableExpense,
  ExpenseScenario,
  ManualExpense,
  ProjectionResult,
  RecurringExpenseItem,
  SimulationParticipant,
  SimulationState,
} from "@/lib/simulationTypes";
import type { Person, Transaction } from "@/lib/types";
import { useCallback, useMemo, useState } from "react";

// ============================================================================
// Constants
// ============================================================================

const PROJECTION_MONTHS = 12;
const DEBOUNCE_MS = 150;

// ============================================================================
// Types
// ============================================================================

type UseSimulationProps = {
  people: Person[];
  transactions: Transaction[];
};

type UseSimulationReturn = {
  // State
  state: SimulationState;
  // Participant actions
  toggleParticipant: (id: string) => void;
  setParticipantMultiplier: (id: string, multiplier: number) => void;
  // Scenario actions
  setScenario: (scenario: ExpenseScenario) => void;
  // Expense actions
  toggleExpenseInclusion: (expenseId: string) => void;
  addManualExpense: (description: string, amount: number) => void;
  removeManualExpense: (id: string) => void;
  // Reset
  resetToBaseline: () => void;
  // Computed values
  projection: ProjectionResult;
  editableExpenses: EditableExpense[];
  totalSimulatedExpenses: number;
  baselineIncome: number;
  baselineExpenses: number;
  hasChanges: boolean;
  recurringExpenses: RecurringExpenseItem[];
  averageExpenses: number;
};

// ============================================================================
// Helper Functions
// ============================================================================

function createInitialParticipants(people: Person[]): SimulationParticipant[] {
  return people.map((person) => ({
    id: person.id,
    name: person.name,
    realIncome: person.income,
    isActive: true,
    incomeMultiplier: 1,
    simulatedIncome: person.income,
  }));
}

function generateMonthLabels(
  startDate: Date,
  count: number,
): { period: string; periodKey: string }[] {
  const labels: { period: string; periodKey: string }[] = [];
  const months = [
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

  for (let i = 0; i < count; i++) {
    const date = dayjs(startDate).add(i, "month");
    const monthIndex = date.month();
    const year = date.year();
    labels.push({
      period: `${months[monthIndex]} ${year}`,
      periodKey: date.format("YYYY-MM"),
    });
  }

  return labels;
}

function calculateProjection(
  monthlyIncome: number,
  monthlyExpenses: number,
  startDate: Date,
): ChartDataPoint[] {
  const months = generateMonthLabels(startDate, PROJECTION_MONTHS);
  const monthlyBalance = monthlyIncome - monthlyExpenses;

  let cumulativeFreedom = 0;
  let cumulativeDeficit = 0;

  return months.map(({ period, periodKey }) => {
    if (monthlyBalance >= 0) {
      cumulativeFreedom += monthlyBalance;
    } else {
      cumulativeDeficit += monthlyBalance;
    }

    return {
      period,
      periodKey,
      income: monthlyIncome,
      expenses: monthlyExpenses,
      monthlyBalance,
      cumulativeFreedom,
      cumulativeDeficit,
    };
  });
}

// ============================================================================
// Hook
// ============================================================================

export function useSimulation({ people, transactions }: UseSimulationProps): UseSimulationReturn {
  // Initialize state
  const [state, setState] = useState<SimulationState>(() => ({
    participants: createInitialParticipants(people),
    scenario: "realistic",
    expenseOverrides: {
      ignoredExpenseIds: [],
      manualExpenses: [],
    },
  }));

  // Calculate recurring expenses (for minimalist scenario)
  const recurringExpenses = useMemo((): RecurringExpenseItem[] => {
    const expenseTransactions = transactions.filter((t) => t.type !== "income" && t.isRecurring);

    // Group by description and get average amount
    const grouped = new Map<
      string,
      { total: number; count: number; categoryId: string | null; id: string }
    >();

    for (const t of expenseTransactions) {
      const key = t.description.toLowerCase().trim();
      const existing = grouped.get(key);
      if (existing) {
        existing.total += t.amount;
        existing.count += 1;
      } else {
        grouped.set(key, {
          total: t.amount,
          count: 1,
          categoryId: t.categoryId,
          id: `recurring-${t.id}`,
        });
      }
    }

    const result: RecurringExpenseItem[] = [];
    grouped.forEach((value, description) => {
      result.push({
        id: value.id,
        description: description.charAt(0).toUpperCase() + description.slice(1),
        amount: value.total / value.count,
        categoryId: value.categoryId,
      });
    });

    return result.sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Calculate average expenses (for realistic scenario - 6 month average)
  const averageExpenses = useMemo(() => {
    const expenseTransactions = transactions.filter((t) => t.type !== "income");
    if (expenseTransactions.length === 0) return 0;

    const total = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    // Assume we have data for current period, approximate 6 month average
    return total;
  }, [transactions]);

  // Baseline calculations (actual values)
  const baselineIncome = useMemo(() => {
    return people.reduce((sum, p) => sum + p.income, 0);
  }, [people]);

  const baselineExpenses = useMemo(() => {
    return transactions.filter((t) => t.type !== "income").reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Simulated income (from participants)
  const simulatedIncome = useMemo(() => {
    return state.participants.reduce((sum, p) => {
      if (!p.isActive) return sum;
      return sum + p.realIncome * p.incomeMultiplier;
    }, 0);
  }, [state.participants]);

  // Calculate base expenses for each scenario
  const scenarioBaseExpenses = useMemo(() => {
    if (state.scenario === "minimalist") {
      return recurringExpenses.reduce((sum, e) => sum + e.amount, 0);
    }
    return averageExpenses;
  }, [state.scenario, recurringExpenses, averageExpenses]);

  // Editable expenses list
  const editableExpenses = useMemo((): EditableExpense[] => {
    const { ignoredExpenseIds, manualExpenses } = state.expenseOverrides;
    const expenses: EditableExpense[] = [];

    if (state.scenario === "minimalist") {
      // Show recurring expenses
      for (const expense of recurringExpenses) {
        expenses.push({
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          isRecurring: true,
          isIncluded: !ignoredExpenseIds.includes(expense.id),
          isManual: false,
        });
      }
    } else {
      // For realistic, we show a summary approach
      // Could be expanded to show individual categories
      expenses.push({
        id: "realistic-average",
        description: "Média de gastos (baseado no histórico)",
        amount: averageExpenses,
        isRecurring: false,
        isIncluded: !ignoredExpenseIds.includes("realistic-average"),
        isManual: false,
      });
    }

    // Add manual expenses
    for (const manual of manualExpenses) {
      expenses.push({
        id: manual.id,
        description: manual.description,
        amount: manual.amount,
        isRecurring: false,
        isIncluded: true,
        isManual: true,
      });
    }

    return expenses;
  }, [state.scenario, state.expenseOverrides, recurringExpenses, averageExpenses]);

  // Total simulated expenses
  const totalSimulatedExpenses = useMemo(() => {
    const { ignoredExpenseIds, manualExpenses } = state.expenseOverrides;
    let total = 0;

    if (state.scenario === "minimalist") {
      for (const expense of recurringExpenses) {
        if (!ignoredExpenseIds.includes(expense.id)) {
          total += expense.amount;
        }
      }
    } else {
      if (!ignoredExpenseIds.includes("realistic-average")) {
        total += averageExpenses;
      }
    }

    // Add manual expenses
    for (const manual of manualExpenses) {
      total += manual.amount;
    }

    return total;
  }, [state.scenario, state.expenseOverrides, recurringExpenses, averageExpenses]);

  // Calculate projection
  const projection = useMemo((): ProjectionResult => {
    const startDate = new Date();
    const chartData = calculateProjection(simulatedIncome, totalSimulatedExpenses, startDate);

    const monthlyBalance = simulatedIncome - totalSimulatedExpenses;
    const lastDataPoint = chartData[chartData.length - 1];

    // Find first deficit month
    let firstDeficitMonth: string | null = null;
    for (const point of chartData) {
      if (point.monthlyBalance < 0) {
        firstDeficitMonth = point.period;
        break;
      }
    }

    // Calculate income change percentage
    const incomeChangePercent =
      baselineIncome > 0 ? ((simulatedIncome - baselineIncome) / baselineIncome) * 100 : 0;

    // Calculate balance change percentage
    const baselineBalance = baselineIncome - baselineExpenses;
    const balanceChangePercent =
      baselineBalance !== 0
        ? ((monthlyBalance - baselineBalance) / Math.abs(baselineBalance)) * 100
        : 0;

    // Freedom target (simplified calculation)
    const freedomTarget = 150000; // Example target
    const monthsToFreedom =
      monthlyBalance > 0 ? Math.ceil(freedomTarget / monthlyBalance) : Number.POSITIVE_INFINITY;

    const freedomTargetDate =
      monthsToFreedom < Number.POSITIVE_INFINITY
        ? dayjs().add(monthsToFreedom, "month").format("MMM YYYY")
        : "Indefinido";

    // Calculate acceleration vs baseline
    const baselineMonthsToFreedom =
      baselineBalance > 0 ? Math.ceil(freedomTarget / baselineBalance) : Number.POSITIVE_INFINITY;

    const freedomAcceleration =
      baselineMonthsToFreedom === Number.POSITIVE_INFINITY
        ? 0
        : baselineMonthsToFreedom - monthsToFreedom;

    return {
      chartData,
      summary: {
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
      },
    };
  }, [simulatedIncome, totalSimulatedExpenses, baselineIncome, baselineExpenses]);

  // Check if there are changes from baseline
  const hasChanges = useMemo(() => {
    const hasParticipantChanges = state.participants.some(
      (p) => !p.isActive || p.incomeMultiplier !== 1,
    );
    const hasExpenseChanges =
      state.expenseOverrides.ignoredExpenseIds.length > 0 ||
      state.expenseOverrides.manualExpenses.length > 0;

    return hasParticipantChanges || hasExpenseChanges || state.scenario !== "realistic";
  }, [state]);

  // Actions
  const toggleParticipant = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.id === id
          ? {
              ...p,
              isActive: !p.isActive,
              simulatedIncome: !p.isActive ? p.realIncome * p.incomeMultiplier : 0,
            }
          : p,
      ),
    }));
  }, []);

  const setParticipantMultiplier = useCallback((id: string, multiplier: number) => {
    setState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.id === id
          ? {
              ...p,
              incomeMultiplier: multiplier,
              simulatedIncome: p.isActive ? p.realIncome * multiplier : 0,
            }
          : p,
      ),
    }));
  }, []);

  const setScenario = useCallback((scenario: ExpenseScenario) => {
    setState((prev) => ({
      ...prev,
      scenario,
      // Reset ignored expenses when changing scenario
      expenseOverrides: {
        ...prev.expenseOverrides,
        ignoredExpenseIds: [],
      },
    }));
  }, []);

  const toggleExpenseInclusion = useCallback((expenseId: string) => {
    setState((prev) => {
      const { ignoredExpenseIds } = prev.expenseOverrides;
      const isCurrentlyIgnored = ignoredExpenseIds.includes(expenseId);

      return {
        ...prev,
        expenseOverrides: {
          ...prev.expenseOverrides,
          ignoredExpenseIds: isCurrentlyIgnored
            ? ignoredExpenseIds.filter((id) => id !== expenseId)
            : [...ignoredExpenseIds, expenseId],
        },
      };
    });
  }, []);

  const addManualExpense = useCallback((description: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      expenseOverrides: {
        ...prev.expenseOverrides,
        manualExpenses: [
          ...prev.expenseOverrides.manualExpenses,
          {
            id: `manual-${Date.now()}`,
            description,
            amount,
          },
        ],
      },
    }));
  }, []);

  const removeManualExpense = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      expenseOverrides: {
        ...prev.expenseOverrides,
        manualExpenses: prev.expenseOverrides.manualExpenses.filter((e) => e.id !== id),
      },
    }));
  }, []);

  const resetToBaseline = useCallback(() => {
    setState({
      participants: createInitialParticipants(people),
      scenario: "realistic",
      expenseOverrides: {
        ignoredExpenseIds: [],
        manualExpenses: [],
      },
    });
  }, [people]);

  return {
    state,
    toggleParticipant,
    setParticipantMultiplier,
    setScenario,
    toggleExpenseInclusion,
    addManualExpense,
    removeManualExpense,
    resetToBaseline,
    projection,
    editableExpenses,
    totalSimulatedExpenses,
    baselineIncome,
    baselineExpenses,
    hasChanges,
    recurringExpenses,
    averageExpenses,
  };
}
