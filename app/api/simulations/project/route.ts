import { NextResponse } from "next/server";

import {
  buildEditableExpenses,
  calculateTotalSimulatedExpenses,
} from "@/components/simulation/calculations/editableExpenses";
import {
  buildRecurringExpenses,
  filterValidExpenseTransactions,
} from "@/components/simulation/calculations/expenseFilters";
import { buildProjectionResult } from "@/components/simulation/calculations/projectionCalculator";
import { simulationProjectBodySchema } from "@/lib/schemas";
import { readJsonBody, requireAuth, validateBody } from "@/lib/server/requestBodyValidation";
import type { Category, Person, Transaction } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/simulations/project
 * Computes projection, editable expenses, and totals for simulation state.
 * Offloads calculation logic from the client.
 */
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const body = await readJsonBody(request);
  const validation = validateBody(body, simulationProjectBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    const { people, transactions, categories, emergencyFund, state, customExpensesValue } =
      validation.data;

    const normalizedTransactions: Transaction[] = transactions.map((transaction) => ({
      ...transaction,
      isCreditCard: transaction.isCreditCard ?? false,
      excludeFromSplit: transaction.excludeFromSplit ?? false,
      isForecast: transaction.isForecast ?? false,
      type: transaction.type ?? "expense",
      isIncrement: transaction.isIncrement ?? true,
    }));

    const normalizedCategories: Category[] = categories;
    const normalizedPeople: Person[] = people;

    const validExpenseTransactions = filterValidExpenseTransactions(
      normalizedTransactions,
      normalizedCategories,
    );

    const currentMonthExpenses = validExpenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    );
    const recurringExpenses = buildRecurringExpenses(validExpenseTransactions);
    const averageExpenses =
      validExpenseTransactions.length > 0
        ? validExpenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
        : 0;
    const baselineIncome = normalizedPeople.reduce((sum, person) => sum + person.income, 0);
    const baselineExpenses = validExpenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0,
    );

    const simulatedIncome = state.participants.reduce((sum, participant) => {
      if (!participant.isActive) return sum;
      return sum + participant.realIncome * participant.incomeMultiplier;
    }, 0);

    const editableExpenses = buildEditableExpenses(
      state.scenario,
      state.expenseOverrides,
      recurringExpenses,
      currentMonthExpenses,
      averageExpenses,
      customExpensesValue,
    );

    const totalSimulatedExpenses = calculateTotalSimulatedExpenses(
      state.scenario,
      state.expenseOverrides,
      recurringExpenses,
      currentMonthExpenses,
      averageExpenses,
      customExpensesValue,
    );

    const projection = buildProjectionResult(
      simulatedIncome,
      totalSimulatedExpenses,
      baselineIncome,
      baselineExpenses,
      emergencyFund,
    );

    return NextResponse.json({
      projection,
      editableExpenses,
      totalSimulatedExpenses,
      baselineIncome,
      baselineExpenses,
      recurringExpenses,
      currentMonthExpenses,
      averageExpenses,
    });
  } catch (error) {
    console.error("Failed to compute simulation projection:", error);
    return NextResponse.json({ error: "Failed to compute simulation projection" }, { status: 500 });
  }
}
