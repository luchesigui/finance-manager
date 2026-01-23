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
    <div className="flex items-center justify-between noir-card p-4 mb-6">
      <button
        type="button"
        onClick={handlePrevMonth}
        className="p-2 hover:bg-noir-active rounded-interactive text-body hover:text-heading transition-all duration-200"
      >
        <ChevronLeft size={24} />
      </button>
      <div className="text-center">
        <h2 className="text-lg font-bold text-heading capitalize flex items-center gap-2 justify-center">
          <Calendar size={20} className="text-accent-primary" />
          {formatMonthYear(selectedMonthDate)}
        </h2>
        <span className="text-xs text-muted font-medium">
          {transactionsForSelectedMonth.length} lançamentos neste mês
        </span>
      </div>
      <button
        type="button"
        onClick={handleNextMonth}
        className="p-2 hover:bg-noir-active rounded-interactive text-body hover:text-heading transition-all duration-200"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
