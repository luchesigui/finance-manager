import type {
  ExpenseOverrides,
  ExpenseScenario,
  ManualExpense,
  SimulationParticipant,
  SimulationState,
} from "@/features/simulation/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = "simulation_draft_store";

// ============================================================================
// Types
// ============================================================================

type SimulationDraftState = {
  state: SimulationState;
  customExpensesValue: number;
};

type SimulationDraftActions = {
  setState: (state: SimulationState) => void;
  setParticipants: (participants: SimulationParticipant[]) => void;
  setScenario: (scenario: ExpenseScenario) => void;
  setExpenseOverrides: (overrides: ExpenseOverrides) => void;
  setCustomExpensesValue: (value: number) => void;
  toggleParticipant: (participantId: string) => void;
  setParticipantMultiplier: (participantId: string, multiplier: number) => void;
  toggleExpenseInclusion: (expenseId: string) => void;
  addManualExpense: (description: string, amount: number) => void;
  removeManualExpense: (expenseId: string) => void;
  resetToBaseline: (participants: SimulationParticipant[]) => void;
  loadState: (state: SimulationState) => void;
  clearStorage: () => void;
};

// ============================================================================
// Store
// ============================================================================

export const useSimulationDraftStore = create<SimulationDraftState & SimulationDraftActions>()(
  persist(
    (set) => ({
      state: {
        participants: [],
        scenario: "currentMonth",
        expenseOverrides: {
          ignoredExpenseIds: [],
          manualExpenses: [],
        },
      },
      customExpensesValue: 0,

      setState: (state) => set({ state }),

      setParticipants: (participants) =>
        set((store) => ({
          state: { ...store.state, participants },
        })),

      setScenario: (scenario) =>
        set((store) => ({
          state: {
            ...store.state,
            scenario,
            expenseOverrides: {
              ...store.state.expenseOverrides,
              ignoredExpenseIds: [],
            },
          },
        })),

      setExpenseOverrides: (expenseOverrides) =>
        set((store) => ({
          state: { ...store.state, expenseOverrides },
        })),

      setCustomExpensesValue: (customExpensesValue) => set({ customExpensesValue }),

      toggleParticipant: (participantId) =>
        set((store) => ({
          state: {
            ...store.state,
            participants: store.state.participants.map((participant) =>
              participant.id === participantId
                ? {
                    ...participant,
                    isActive: !participant.isActive,
                    simulatedIncome: !participant.isActive
                      ? participant.realIncome * participant.incomeMultiplier
                      : 0,
                  }
                : participant,
            ),
          },
        })),

      setParticipantMultiplier: (participantId, multiplier) =>
        set((store) => ({
          state: {
            ...store.state,
            participants: store.state.participants.map((participant) =>
              participant.id === participantId
                ? {
                    ...participant,
                    incomeMultiplier: multiplier,
                    simulatedIncome: participant.isActive ? participant.realIncome * multiplier : 0,
                  }
                : participant,
            ),
          },
        })),

      toggleExpenseInclusion: (expenseId) =>
        set((store) => {
          const ignoredExpenseIds = store.state.expenseOverrides.ignoredExpenseIds;
          const isCurrentlyIgnored = ignoredExpenseIds.includes(expenseId);
          return {
            state: {
              ...store.state,
              expenseOverrides: {
                ...store.state.expenseOverrides,
                ignoredExpenseIds: isCurrentlyIgnored
                  ? ignoredExpenseIds.filter((id) => id !== expenseId)
                  : [...ignoredExpenseIds, expenseId],
              },
            },
          };
        }),

      addManualExpense: (description, amount) =>
        set((store) => {
          const manualExpense: ManualExpense = {
            id: `manual-${Date.now()}`,
            description,
            amount,
          };
          return {
            state: {
              ...store.state,
              expenseOverrides: {
                ...store.state.expenseOverrides,
                manualExpenses: [...store.state.expenseOverrides.manualExpenses, manualExpense],
              },
            },
          };
        }),

      removeManualExpense: (expenseId) =>
        set((store) => ({
          state: {
            ...store.state,
            expenseOverrides: {
              ...store.state.expenseOverrides,
              manualExpenses: store.state.expenseOverrides.manualExpenses.filter(
                (expense) => expense.id !== expenseId,
              ),
            },
          },
        })),

      resetToBaseline: (participants) =>
        set({
          state: {
            participants,
            scenario: "currentMonth",
            expenseOverrides: {
              ignoredExpenseIds: [],
              manualExpenses: [],
            },
          },
          customExpensesValue: 0,
        }),

      loadState: (state) => set({ state }),

      clearStorage: () => {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            // Ignore
          }
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (store) => ({
        state: store.state,
        customExpensesValue: store.customExpensesValue,
      }),
    },
  ),
);
