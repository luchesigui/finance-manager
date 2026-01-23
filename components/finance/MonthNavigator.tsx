"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import { useCurrentMonth } from "@/components/finance/contexts/CurrentMonthContext";
import { useTransactions } from "@/components/finance/contexts/TransactionsContext";
import { formatMonthYear } from "@/lib/format";

export function MonthNavigator() {
  const { selectedMonthDate, setSelectedMonthDate } = useCurrentMonth();
  const { transactionsForSelectedMonth } = useTransactions();

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
    <div
      className="flex items-center justify-between bg-noir-bg-surface p-4 rounded-card shadow-sm mb-6"
      style={{ borderColor: "rgba(255, 255, 255, 0.05)", borderWidth: "1px", borderStyle: "solid" }}
    >
      <button
        type="button"
        onClick={handlePrevMonth}
        className="p-2 hover:bg-noir-bg-active rounded-pill text-noir-text-body transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <div className="text-center">
        <h2 className="text-lg font-bold text-noir-text-heading capitalize flex items-center gap-2 justify-center">
          <Calendar size={20} className="text-noir-text-accent" />
          {formatMonthYear(selectedMonthDate)}
        </h2>
        <span className="text-xs tabular-nums text-noir-text-muted font-medium">
          {transactionsForSelectedMonth.length} lançamentos neste mês
        </span>
      </div>
      <button
        type="button"
        onClick={handleNextMonth}
        className="p-2 hover:bg-noir-bg-active rounded-pill text-noir-text-body transition-colors"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
