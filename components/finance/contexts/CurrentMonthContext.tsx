"use client";

import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";

type CurrentMonthContextValue = {
  selectedMonthDate: Date;
  setSelectedMonthDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedYear: number;
  selectedMonthNumber: number;
};

const CurrentMonthContext = createContext<CurrentMonthContextValue | null>(null);

export function CurrentMonthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date());

  const selectedYear = selectedMonthDate.getFullYear();
  const selectedMonthNumber = selectedMonthDate.getMonth() + 1;

  const contextValue = useMemo<CurrentMonthContextValue>(
    () => ({
      selectedMonthDate,
      setSelectedMonthDate,
      selectedYear,
      selectedMonthNumber,
    }),
    [selectedMonthDate, selectedYear, selectedMonthNumber],
  );

  return (
    <CurrentMonthContext.Provider value={contextValue}>{children}</CurrentMonthContext.Provider>
  );
}

export function useCurrentMonth(): CurrentMonthContextValue {
  const contextValue = useContext(CurrentMonthContext);
  if (!contextValue) {
    throw new Error("useCurrentMonth must be used within CurrentMonthProvider");
  }
  return contextValue;
}
