import type {
  EditableExpense,
  ExpenseOverrides,
  ExpenseScenario,
  RecurringExpenseItem,
} from "@/lib/simulationTypes";

// ============================================================================
// Functions
// ============================================================================

export function buildEditableExpenses(
  scenario: ExpenseScenario,
  expenseOverrides: ExpenseOverrides,
  recurringExpenses: RecurringExpenseItem[],
  currentMonthExpenses: number,
  averageExpenses: number,
  customExpensesValue: number,
): EditableExpense[] {
  const { ignoredExpenseIds, manualExpenses } = expenseOverrides;
  const expenses: EditableExpense[] = [];

  if (scenario === "minimalist") {
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
  } else if (scenario === "currentMonth") {
    expenses.push({
      id: "current-month",
      description: "Gastos do mês atual",
      amount: currentMonthExpenses,
      isRecurring: false,
      isIncluded: !ignoredExpenseIds.includes("current-month"),
      isManual: false,
    });
  } else if (scenario === "realistic") {
    expenses.push({
      id: "realistic-average",
      description: "Média de gastos (baseado no histórico)",
      amount: averageExpenses,
      isRecurring: false,
      isIncluded: !ignoredExpenseIds.includes("realistic-average"),
      isManual: false,
    });
  } else if (scenario === "custom") {
    expenses.push({
      id: "custom-value",
      description: "Valor personalizado",
      amount: customExpensesValue,
      isRecurring: false,
      isIncluded: true,
      isManual: false,
    });
  }

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
}

export function calculateTotalSimulatedExpenses(
  scenario: ExpenseScenario,
  expenseOverrides: ExpenseOverrides,
  recurringExpenses: RecurringExpenseItem[],
  currentMonthExpenses: number,
  averageExpenses: number,
  customExpensesValue: number,
): number {
  const { ignoredExpenseIds, manualExpenses } = expenseOverrides;
  let total = 0;

  if (scenario === "minimalist") {
    for (const expense of recurringExpenses) {
      if (!ignoredExpenseIds.includes(expense.id)) {
        total += expense.amount;
      }
    }
  } else if (scenario === "currentMonth") {
    if (!ignoredExpenseIds.includes("current-month")) {
      total += currentMonthExpenses;
    }
  } else if (scenario === "realistic") {
    if (!ignoredExpenseIds.includes("realistic-average")) {
      total += averageExpenses;
    }
  } else if (scenario === "custom") {
    total += customExpensesValue;
  }

  for (const manual of manualExpenses) {
    total += manual.amount;
  }

  return total;
}
