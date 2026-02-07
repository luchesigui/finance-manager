"use client";

import type {
  EditableExpense,
  ExpenseScenario,
  ProjectionResult,
  RecurringExpenseItem,
  SimulationState,
} from "@/features/simulation/types";
import type { Category, Person, Transaction } from "@/lib/types";
import { useCallback, useEffect, useMemo } from "react";

import {
  buildEditableExpenses,
  calculateTotalSimulatedExpenses,
} from "@/features/simulation/server/editableExpenses";
import {
  buildRecurringExpenses,
  filterValidExpenseTransactions,
} from "@/features/simulation/server/expenseFilters";
import { createInitialParticipants } from "@/features/simulation/server/participants";
import { buildProjectionResult } from "@/features/simulation/server/projectionCalculator";
import { useSimulationDraftStore } from "@/features/simulation/stores/simulationDraftStore";

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
  state: SimulationState;
  toggleParticipant: (participantId: string) => void;
  setParticipantMultiplier: (participantId: string, multiplier: number) => void;
  setScenario: (scenario: ExpenseScenario) => void;
  toggleExpenseInclusion: (expenseId: string) => void;
  addManualExpense: (description: string, amount: number) => void;
  removeManualExpense: (expenseId: string) => void;
  setCustomExpenses: (amount: number) => void;
  resetToBaseline: () => void;
  loadState: (state: SimulationState) => void;
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
// Hook
// ============================================================================

export function useSimulation({
  people,
  transactions,
  categories,
  emergencyFund,
}: UseSimulationProps): UseSimulationReturn {
  const state = useSimulationDraftStore((store) => store.state);
  const customExpensesValue = useSimulationDraftStore((store) => store.customExpensesValue);
  const setParticipants = useSimulationDraftStore((store) => store.setParticipants);
  const toggleParticipantAction = useSimulationDraftStore((store) => store.toggleParticipant);
  const setParticipantMultiplierAction = useSimulationDraftStore(
    (store) => store.setParticipantMultiplier,
  );
  const setScenarioAction = useSimulationDraftStore((store) => store.setScenario);
  const toggleExpenseInclusionAction = useSimulationDraftStore(
    (store) => store.toggleExpenseInclusion,
  );
  const addManualExpenseAction = useSimulationDraftStore((store) => store.addManualExpense);
  const removeManualExpenseAction = useSimulationDraftStore((store) => store.removeManualExpense);
  const setCustomExpensesValueAction = useSimulationDraftStore(
    (store) => store.setCustomExpensesValue,
  );
  const resetToBaselineAction = useSimulationDraftStore((store) => store.resetToBaseline);
  const loadStateAction = useSimulationDraftStore((store) => store.loadState);

  // Sync participants when people data changes (e.g., after initial load)
  useEffect(() => {
    const currentIds = new Set(state.participants.map((participant) => participant.id));
    const newIds = new Set(people.map((person) => person.id));

    const needsSync =
      (state.participants.length === 0 && people.length > 0) ||
      people.length !== state.participants.length ||
      people.some((person) => !currentIds.has(person.id)) ||
      state.participants.some((participant) => !newIds.has(participant.id));

    if (needsSync) {
      setParticipants(createInitialParticipants(people));
    }
  }, [people, state.participants, setParticipants]);

  const validExpenseTransactions = useMemo(
    () => filterValidExpenseTransactions(transactions, categories),
    [transactions, categories],
  );

  const currentMonthExpenses = useMemo(
    () => validExpenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    [validExpenseTransactions],
  );

  const recurringExpenses = useMemo(
    () => buildRecurringExpenses(validExpenseTransactions),
    [validExpenseTransactions],
  );

  const averageExpenses = useMemo(() => {
    if (validExpenseTransactions.length === 0) return 0;
    return validExpenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [validExpenseTransactions]);

  const baselineIncome = useMemo(
    () => people.reduce((sum, person) => sum + person.income, 0),
    [people],
  );

  const baselineExpenses = useMemo(
    () => validExpenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    [validExpenseTransactions],
  );

  const simulatedIncome = useMemo(
    () =>
      state.participants.reduce((sum, participant) => {
        if (!participant.isActive) return sum;
        return sum + participant.realIncome * participant.incomeMultiplier;
      }, 0),
    [state.participants],
  );

  const editableExpenses = useMemo(
    () =>
      buildEditableExpenses(
        state.scenario,
        state.expenseOverrides,
        recurringExpenses,
        currentMonthExpenses,
        averageExpenses,
        customExpensesValue,
      ),
    [
      state.scenario,
      state.expenseOverrides,
      recurringExpenses,
      currentMonthExpenses,
      averageExpenses,
      customExpensesValue,
    ],
  );

  const totalSimulatedExpenses = useMemo(
    () =>
      calculateTotalSimulatedExpenses(
        state.scenario,
        state.expenseOverrides,
        recurringExpenses,
        currentMonthExpenses,
        averageExpenses,
        customExpensesValue,
      ),
    [
      state.scenario,
      state.expenseOverrides,
      recurringExpenses,
      currentMonthExpenses,
      averageExpenses,
      customExpensesValue,
    ],
  );

  const projection = useMemo(
    () =>
      buildProjectionResult(
        simulatedIncome,
        totalSimulatedExpenses,
        baselineIncome,
        baselineExpenses,
        emergencyFund,
      ),
    [simulatedIncome, totalSimulatedExpenses, baselineIncome, baselineExpenses, emergencyFund],
  );

  const hasChanges = useMemo(() => {
    const hasParticipantChanges = state.participants.some(
      (participant) => !participant.isActive || participant.incomeMultiplier !== 1,
    );
    const hasExpenseChanges =
      state.expenseOverrides.ignoredExpenseIds.length > 0 ||
      state.expenseOverrides.manualExpenses.length > 0;

    return hasParticipantChanges || hasExpenseChanges || state.scenario !== "currentMonth";
  }, [state]);

  const resetToBaseline = useCallback(() => {
    resetToBaselineAction(createInitialParticipants(people));
  }, [people, resetToBaselineAction]);

  const loadState = useCallback(
    (newState: SimulationState) => {
      loadStateAction(newState);
    },
    [loadStateAction],
  );

  return {
    state,
    toggleParticipant: toggleParticipantAction,
    setParticipantMultiplier: setParticipantMultiplierAction,
    setScenario: setScenarioAction,
    toggleExpenseInclusion: toggleExpenseInclusionAction,
    addManualExpense: addManualExpenseAction,
    removeManualExpense: removeManualExpenseAction,
    setCustomExpenses: setCustomExpensesValueAction,
    resetToBaseline,
    loadState,
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
