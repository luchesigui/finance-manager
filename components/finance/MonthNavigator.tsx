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
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
      <button
        type="button"
        onClick={handlePrevMonth}
        className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-800 capitalize flex items-center gap-2 justify-center">
          <Calendar size={20} className="text-indigo-600" />
          {formatMonthYear(selectedMonthDate)}
        </h2>
        <span className="text-xs text-slate-400 font-medium">
          {transactionsForSelectedMonth.length} lançamentos neste mês
        </span>
      </div>
      <button
        type="button"
        onClick={handleNextMonth}
        className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
