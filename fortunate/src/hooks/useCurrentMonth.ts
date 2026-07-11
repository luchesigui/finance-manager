import React from "react";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const padZero = (n: number) => n.toString().padStart(2, "0");
const toMonthString = (date: Date) => `${date.getFullYear()}-${padZero(date.getMonth() + 1)}`;
const toMonthDate = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1, 1);
};
const addMonths = (month: string, delta: number) => {
  const date = toMonthDate(month);
  date.setMonth(date.getMonth() + delta);
  return toMonthString(date);
};

let currentMonth = toMonthString(new Date());
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => currentMonth;

function setCurrentMonth(month: string) {
  if (month === currentMonth) return;
  currentMonth = month;
  for (const listener of listeners) listener();
}

export function resetCurrentMonthForTest(month = toMonthString(new Date())) {
  setCurrentMonth(month);
}

export function useCurrentMonth() {
  const currentMonthStr = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const currentDate = React.useMemo(() => toMonthDate(currentMonthStr), [currentMonthStr]);
  const monthLabel = `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  return {
    currentDate,
    currentMonthStr,
    monthLabel,
    handlePrevMonth: () => setCurrentMonth(addMonths(currentMonthStr, -1)),
    handleNextMonth: () => setCurrentMonth(addMonths(currentMonthStr, 1)),
    setCurrentMonth,
  };
}
