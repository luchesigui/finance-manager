"use client";

import { dayjs } from "@/lib/dateUtils";
import type {
  ChartDataPoint,
  EditableExpense,
  ExpenseScenario,
  ProjectionResult,
  RecurringExpenseItem,
  SimulationParticipant,
  SimulationState,
} from "@/lib/simulationTypes";
import type { Category, Person, Transaction } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";

// ============================================================================
// Constants
// ============================================================================

const PROJECTION_MONTHS = 12;
const LIBERDADE_FINANCEIRA_CATEGORY = "Liberdade Financeira";
const LOCAL_STORAGE_KEY = "simulation-config";

// ============================================================================
// Persisted State Type
// ============================================================================

type PersistedSimulationConfig = {
  participants: {
    id: string;
    isActive: boolean;
    incomeMultiplier: number;
  }[];
  scenario: ExpenseScenario;
  ignoredExpenseIds: string[];
  manualExpenses: {
    id: string;
    description: string;
    amount: number;
  }[];
  customExpensesValue: number;
};

// ============================================================================
// Types
// ============================================================================

type UseSimulationProps = {
  people: Person[];
  transactions: Transaction[];
  categories: Category[];
  emergencyFund: number;
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
  setCustomExpenses: (amount: number) => void;
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
  currentMonthExpenses: number;
  averageExpenses: number;
  customExpenses: number;
  emergencyFund: number;
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

/**
 * Loads persisted simulation config from local storage
 */
function loadPersistedConfig(): PersistedSimulationConfig | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as PersistedSimulationConfig;
  } catch {
    return null;
  }
}

/**
 * Saves simulation config to local storage
 */
function savePersistedConfig(config: PersistedSimulationConfig): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage errors (e.g., quota exceeded)
  }
}

/**
 * Creates initial participants, applying persisted config if available
 */
function createParticipantsWithConfig(
  people: Person[],
  persistedConfig: PersistedSimulationConfig | null,
): SimulationParticipant[] {
  return people.map((person) => {
    const persisted = persistedConfig?.participants.find((p) => p.id === person.id);
    return {
      id: person.id,
      name: person.name,
      realIncome: person.income,
      isActive: persisted?.isActive ?? true,
      incomeMultiplier: persisted?.incomeMultiplier ?? 1,
      simulatedIncome:
        (persisted?.isActive ?? true) ? person.income * (persisted?.incomeMultiplier ?? 1) : 0,
    };
  });
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
          // No deficit accumulated yet - covered by emergency fund
        } else {
          // Partial coverage - the rest becomes deficit
          const uncoveredDeficit = deficitThisMonth - emergencyFundRemaining;
          emergencyFundRemaining = 0;
          cumulativeDeficit -= uncoveredDeficit;
        }
      } else {
        // Emergency fund depleted, accumulate deficit
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

/**
 * Filters transactions to exclude:
 * - Transactions in "Liberdade Financeira" category
 * - Transactions without any category
 */
function filterValidExpenseTransactions(
  transactions: Transaction[],
  categories: Category[],
): Transaction[] {
  // Find the Liberdade Financeira category ID
  const liberdadeCategory = categories.find((cat) => cat.name === LIBERDADE_FINANCEIRA_CATEGORY);
  const liberdadeCategoryId = liberdadeCategory?.id;

  return transactions.filter((t) => {
    // Only expense transactions
    if (t.type === "income") return false;
    // Must have a category
    if (!t.categoryId) return false;
    // Must not be Liberdade Financeira
    if (liberdadeCategoryId && t.categoryId === liberdadeCategoryId) return false;
    return true;
  });
}

// ============================================================================
// Hook
// ============================================================================

export function useSimulation({
  people,
  transactions,
  categories,
  emergencyFund,
}: UseSimulationProps): UseSimulationReturn {
  // Load persisted config on mount
  const [persistedConfig] = useState<PersistedSimulationConfig | null>(() => loadPersistedConfig());

  // Initialize state with persisted values
  const [state, setState] = useState<SimulationState>(() => ({
    participants: createParticipantsWithConfig(people, persistedConfig),
    scenario: persistedConfig?.scenario ?? "currentMonth",
    expenseOverrides: {
      ignoredExpenseIds: persistedConfig?.ignoredExpenseIds ?? [],
      manualExpenses: persistedConfig?.manualExpenses ?? [],
    },
  }));

  // Custom expenses value (for custom scenario)
  const [customExpensesValue, setCustomExpensesValue] = useState(
    persistedConfig?.customExpensesValue ?? 0,
  );

  // Persist state changes to local storage
  useEffect(() => {
    const config: PersistedSimulationConfig = {
      participants: state.participants.map((p) => ({
        id: p.id,
        isActive: p.isActive,
        incomeMultiplier: p.incomeMultiplier,
      })),
      scenario: state.scenario,
      ignoredExpenseIds: state.expenseOverrides.ignoredExpenseIds,
      manualExpenses: state.expenseOverrides.manualExpenses,
      customExpensesValue,
    };
    savePersistedConfig(config);
  }, [state, customExpensesValue]);

  // Filter valid expense transactions (exclude Liberdade Financeira and uncategorized)
  const validExpenseTransactions = useMemo(
    () => filterValidExpenseTransactions(transactions, categories),
    [transactions, categories],
  );

  // Calculate current month expenses
  const currentMonthExpenses = useMemo(() => {
    return validExpenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [validExpenseTransactions]);

  // Calculate recurring expenses (for minimalist scenario)
  const recurringExpenses = useMemo((): RecurringExpenseItem[] => {
    const expenseTransactions = validExpenseTransactions.filter((t) => t.isRecurring);

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
  }, [validExpenseTransactions]);

  // Calculate average expenses (for realistic scenario - uses current data as approximation)
  const averageExpenses = useMemo(() => {
    if (validExpenseTransactions.length === 0) return 0;
    return validExpenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [validExpenseTransactions]);

  // Baseline calculations (actual values)
  const baselineIncome = useMemo(() => {
    return people.reduce((sum, p) => sum + p.income, 0);
  }, [people]);

  const baselineExpenses = useMemo(() => {
    return validExpenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [validExpenseTransactions]);

  // Simulated income (from participants)
  const simulatedIncome = useMemo(() => {
    return state.participants.reduce((sum, p) => {
      if (!p.isActive) return sum;
      return sum + p.realIncome * p.incomeMultiplier;
    }, 0);
  }, [state.participants]);

  // Get base expenses based on scenario
  const getScenarioBaseExpenses = useCallback(() => {
    switch (state.scenario) {
      case "currentMonth":
        return currentMonthExpenses;
      case "minimalist":
        return recurringExpenses.reduce((sum, e) => sum + e.amount, 0);
      case "realistic":
        return averageExpenses;
      case "custom":
        return customExpensesValue;
      default:
        return currentMonthExpenses;
    }
  }, [
    state.scenario,
    currentMonthExpenses,
    recurringExpenses,
    averageExpenses,
    customExpensesValue,
  ]);

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
    } else if (state.scenario === "currentMonth") {
      // Show current month as a single item
      expenses.push({
        id: "current-month",
        description: "Gastos do mês atual",
        amount: currentMonthExpenses,
        isRecurring: false,
        isIncluded: !ignoredExpenseIds.includes("current-month"),
        isManual: false,
      });
    } else if (state.scenario === "realistic") {
      // Show average as a single item
      expenses.push({
        id: "realistic-average",
        description: "Média de gastos (baseado no histórico)",
        amount: averageExpenses,
        isRecurring: false,
        isIncluded: !ignoredExpenseIds.includes("realistic-average"),
        isManual: false,
      });
    } else if (state.scenario === "custom") {
      // Show custom value
      expenses.push({
        id: "custom-value",
        description: "Valor personalizado",
        amount: customExpensesValue,
        isRecurring: false,
        isIncluded: true,
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
  }, [
    state.scenario,
    state.expenseOverrides,
    recurringExpenses,
    currentMonthExpenses,
    averageExpenses,
    customExpensesValue,
  ]);

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
    } else if (state.scenario === "currentMonth") {
      if (!ignoredExpenseIds.includes("current-month")) {
        total += currentMonthExpenses;
      }
    } else if (state.scenario === "realistic") {
      if (!ignoredExpenseIds.includes("realistic-average")) {
        total += averageExpenses;
      }
    } else if (state.scenario === "custom") {
      total += customExpensesValue;
    }

    // Add manual expenses
    for (const manual of manualExpenses) {
      total += manual.amount;
    }

    return total;
  }, [
    state.scenario,
    state.expenseOverrides,
    recurringExpenses,
    currentMonthExpenses,
    averageExpenses,
    customExpensesValue,
  ]);

  // Calculate projection
  const projection = useMemo((): ProjectionResult => {
    const startDate = new Date();
    const chartData = calculateProjection(
      simulatedIncome,
      totalSimulatedExpenses,
      startDate,
      emergencyFund,
    );

    const monthlyBalance = simulatedIncome - totalSimulatedExpenses;
    const lastDataPoint = chartData[chartData.length - 1];

    // Find first deficit month (when emergency fund is depleted)
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
    const freedomTarget = 150000;
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

    // Calculate how many months the emergency fund will last
    const emergencyFundMonths =
      monthlyBalance < 0
        ? Math.floor(emergencyFund / Math.abs(monthlyBalance))
        : Number.POSITIVE_INFINITY;

    // Calculate baseline total freedom for comparison
    const baselineChartData = calculateProjection(
      baselineIncome,
      baselineExpenses,
      startDate,
      emergencyFund,
    );
    const baselineTotalFreedom = baselineChartData[baselineChartData.length - 1].cumulativeFreedom;

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
        emergencyFundMonths,
        emergencyFundDepleted: lastDataPoint.emergencyFundRemaining === 0 && emergencyFund > 0,
        emergencyFundDepletedMonth,
        baselineMonthlyBalance: baselineBalance,
        baselineTotalFreedom,
      },
    };
  }, [simulatedIncome, totalSimulatedExpenses, baselineIncome, baselineExpenses, emergencyFund]);

  // Check if there are changes from baseline
  const hasChanges = useMemo(() => {
    const hasParticipantChanges = state.participants.some(
      (p) => !p.isActive || p.incomeMultiplier !== 1,
    );
    const hasExpenseChanges =
      state.expenseOverrides.ignoredExpenseIds.length > 0 ||
      state.expenseOverrides.manualExpenses.length > 0;

    return hasParticipantChanges || hasExpenseChanges || state.scenario !== "currentMonth";
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

  const setCustomExpenses = useCallback((amount: number) => {
    setCustomExpensesValue(amount);
  }, []);

  const resetToBaseline = useCallback(() => {
    setState({
      participants: createInitialParticipants(people),
      scenario: "currentMonth",
      expenseOverrides: {
        ignoredExpenseIds: [],
        manualExpenses: [],
      },
    });
    setCustomExpensesValue(0);
    // Clear persisted config
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [people]);

  return {
    state,
    toggleParticipant,
    setParticipantMultiplier,
    setScenario,
    toggleExpenseInclusion,
    addManualExpense,
    removeManualExpense,
    setCustomExpenses,
    resetToBaseline,
    projection,
    editableExpenses,
    totalSimulatedExpenses,
    baselineIncome,
    baselineExpenses,
    hasChanges,
    recurringExpenses,
    currentMonthExpenses,
    averageExpenses,
    customExpenses: customExpensesValue,
    emergencyFund,
  };
}
