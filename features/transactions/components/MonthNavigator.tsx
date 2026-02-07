"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import { useTransactionsData } from "@/features/transactions/hooks/useTransactionsData";
import { formatMonthYear } from "@/lib/format";
import { useCurrentMonth } from "@/lib/stores/currentMonthStore";

export function MonthNavigator() {
  const { selectedMonthDate, setSelectedMonthDate } = useCurrentMonth();
  const { transactionsForSelectedMonth } = useTransactionsData();

  const handlePrevMonth = () => {
    setSelectedMonthDate(
      new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setSelectedMonthDate(
      new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth() + 1, 1),
    );
  };

  return (
    <div className="flex items-center justify-between p-5 mb-2">
      <button
        type="button"
        onClick={handlePrevMonth}
        className="p-2.5 hover:bg-noir-active rounded-interactive text-muted hover:text-accent-primary transition-all duration-300 border border-transparent hover:border-noir-border"
      >
        <ChevronLeft size={20} />
      </button>
      <div className="text-center">
        <h2 className="text-4xl font-display text-heading capitalize tracking-tight">
          {formatMonthYear(selectedMonthDate)}
        </h2>
        <span className="text-[11px] text-muted font-medium tracking-wider uppercase mt-1 block">
          {transactionsForSelectedMonth.length} lançamentos
        </span>
      </div>
      <button
        type="button"
        onClick={handleNextMonth}
        className="p-2.5 hover:bg-noir-active rounded-interactive text-muted hover:text-accent-primary transition-all duration-300 border border-transparent hover:border-noir-border"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
