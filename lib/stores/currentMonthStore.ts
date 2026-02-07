import { create } from "zustand";

// ============================================================================
// Types
// ============================================================================

type CurrentMonthState = {
  selectedMonthDate: Date;
};

type CurrentMonthActions = {
  setSelectedMonthDate: (date: Date | ((previous: Date) => Date)) => void;
};

// ============================================================================
// Store
// ============================================================================

export const useCurrentMonthStore = create<CurrentMonthState & CurrentMonthActions>((set) => ({
  selectedMonthDate: new Date(),
  setSelectedMonthDate: (dateOrUpdater) => {
    set((state) => {
      const nextDate =
        typeof dateOrUpdater === "function"
          ? dateOrUpdater(state.selectedMonthDate)
          : dateOrUpdater;
      return { selectedMonthDate: nextDate };
    });
  },
}));

// ============================================================================
// Selectors (use complete words per coding standards)
// ============================================================================

export function useSelectedMonthDate() {
  return useCurrentMonthStore((store) => store.selectedMonthDate);
}

export function useSetSelectedMonthDate() {
  return useCurrentMonthStore((store) => store.setSelectedMonthDate);
}

export function useSelectedYear() {
  return useCurrentMonthStore((store) => store.selectedMonthDate.getFullYear());
}

export function useSelectedMonthNumber() {
  return useCurrentMonthStore((store) => store.selectedMonthDate.getMonth() + 1);
}

/**
 * Hook with the same interface as the legacy useCurrentMonth from CurrentMonthContext.
 * Use this when migrating from context to store.
 */
export function useCurrentMonth() {
  const selectedMonthDate = useCurrentMonthStore((store) => store.selectedMonthDate);
  const setSelectedMonthDate = useCurrentMonthStore((store) => store.setSelectedMonthDate);
  const selectedYear = selectedMonthDate.getFullYear();
  const selectedMonthNumber = selectedMonthDate.getMonth() + 1;

  return {
    selectedMonthDate,
    setSelectedMonthDate,
    selectedYear,
    selectedMonthNumber,
  };
}
