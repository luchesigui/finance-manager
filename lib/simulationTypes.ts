// ============================================================================
// Simulation State Types
// ============================================================================

/**
 * Participant state in simulation
 */
export type SimulationParticipant = {
  id: string;
  name: string;
  realIncome: number;
  isActive: boolean;
  incomeMultiplier: number; // 0 to 1.5 (0% to 150%)
  simulatedIncome: number; // Computed: realIncome * incomeMultiplier
};

/**
 * Expense scenario type
 */
export type ExpenseScenario = "minimalist" | "realistic";

/**
 * Manual expense added by user
 */
export type ManualExpense = {
  id: string;
  description: string;
  amount: number;
};

/**
 * Expense override state
 */
export type ExpenseOverrides = {
  ignoredExpenseIds: string[];
  manualExpenses: ManualExpense[];
};

/**
 * Editable expense for display
 */
export type EditableExpense = {
  id: string;
  description: string;
  amount: number;
  isRecurring: boolean;
  isIncluded: boolean;
  isManual: boolean;
};

/**
 * Main simulation state
 */
export type SimulationState = {
  participants: SimulationParticipant[];
  scenario: ExpenseScenario;
  expenseOverrides: ExpenseOverrides;
};

// ============================================================================
// Chart Data Types
// ============================================================================

/**
 * Data point for the projection chart
 */
export type ChartDataPoint = {
  period: string; // "Fev 2026"
  periodKey: string; // "2026-02"
  // Fixed monthly values
  income: number;
  expenses: number;
  // Cumulative values
  cumulativeFreedom: number;
  cumulativeDeficit: number;
  // Monthly balance (income - expenses)
  monthlyBalance: number;
};

/**
 * Summary of simulation results
 */
export type SimulationSummary = {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  totalFreedom: number;
  totalDeficit: number;
  firstDeficitMonth: string | null;
  freedomTargetDate: string;
  freedomAcceleration: number;
  incomeChangePercent: number;
  balanceChangePercent: number;
};

/**
 * Full projection result
 */
export type ProjectionResult = {
  chartData: ChartDataPoint[];
  summary: SimulationSummary;
};

// ============================================================================
// Monthly Breakdown Types
// ============================================================================

export type MonthlyBreakdownRow = {
  period: string;
  periodKey: string;
  income: number;
  expenses: number;
  monthlyBalance: number;
  cumulativeFreedom: number;
  cumulativeDeficit: number;
};

// ============================================================================
// Alert Types
// ============================================================================

export type AlertSeverity = "info" | "warning" | "critical" | "success";

export type SimulationAlert = {
  id: string;
  severity: AlertSeverity;
  icon: string;
  title: string;
  message: string;
};

// ============================================================================
// Recurring Expense for Minimalista Scenario
// ============================================================================

export type RecurringExpenseItem = {
  id: string;
  description: string;
  amount: number;
  categoryId: string | null;
};
