"use client";

import { PieChart } from "lucide-react";

import {
  calculateCategorySummary,
  calculateTotalExpenses,
  calculateTotalIncome,
} from "@/components/finance/hooks/useFinanceCalculations";
import { getCategoryColorStyle } from "@/lib/categoryColors";
import { normalizeCategoryName } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { Category, Person, Transaction } from "@/lib/types";

type CategorySummaryTableProps = {
  categories: Category[];
  transactionsForSelectedMonth: Transaction[];
  people: Person[];
};

export function CategorySummaryTable({
  categories,
  transactionsForSelectedMonth,
  people,
}: CategorySummaryTableProps) {
  // Calculate totals and summaries
  const totalIncome = calculateTotalIncome(people);
  const totalExpensesAll = calculateTotalExpenses(transactionsForSelectedMonth);
  const categorySummary = calculateCategorySummary(
    categories,
    transactionsForSelectedMonth,
    totalIncome,
  );
  const goalsAndSavingsNames = new Set(
    ["liberdade financeira", "metas"].map((n) => normalizeCategoryName(n)),
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <PieChart size={18} />
          Metas vs Realizado
        </h2>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3 text-right">Gasto</th>
              <th className="px-4 py-3 text-center">% Previsto</th>
              <th className="px-4 py-3 text-center">% Real</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {categorySummary.map((cat) => {
              const normalizedName = normalizeCategoryName(cat.name);
              const isGoalOrSavings = goalsAndSavingsNames.has(normalizedName);
              const isOverBudget = cat.realPercentOfIncome > cat.targetPercent;
              const isBelowGoal = cat.realPercentOfIncome < cat.targetPercent;

              // For goals/savings, we WANT to reach/exceed the target
              const showBadStatus = isGoalOrSavings ? isBelowGoal : isOverBudget;
              const badStatusLabel = isGoalOrSavings ? "Faltando" : "Estourou";

              return (
                <tr
                  key={cat.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium" style={getCategoryColorStyle(cat.name)}>
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-right">{formatCurrency(cat.totalSpent)}</td>
                  <td
                    className="px-4 py-3 text-center"
                    title={formatCurrency(
                      Math.ceil((cat.targetPercent / 100) * totalIncome * 100) / 100,
                    )}
                  >
                    {cat.targetPercent}%
                  </td>
                  <td className="px-4 py-3 text-center font-bold">
                    {cat.realPercentOfIncome.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    {showBadStatus ? (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                        {badStatusLabel}
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                        Dentro
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-slate-50 font-bold">
              <td className="px-4 py-3">TOTAL</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totalExpensesAll)}</td>
              <td className="px-4 py-3 text-center" title={formatCurrency(totalIncome)}>
                100%
              </td>
              <td className="px-4 py-3 text-center">
                {totalIncome > 0 ? ((totalExpensesAll / totalIncome) * 100).toFixed(1) : 0}%
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
