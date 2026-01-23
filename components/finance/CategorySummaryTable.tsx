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
    <div className="noir-card overflow-hidden">
      <div className="p-4 border-b border-noir-border bg-noir-active/50">
        <h2 className="font-semibold text-heading flex items-center gap-2">
          <PieChart size={18} className="text-accent-primary" />
          Metas vs Realizado
        </h2>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="noir-table">
          <thead>
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
                  className="border-b border-noir-border last:border-0 hover:bg-noir-active/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium" style={getCategoryColorStyle(cat.name)}>
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-right text-heading tabular-nums">
                    {formatCurrency(cat.totalSpent)}
                  </td>
                  <td
                    className="px-4 py-3 text-center text-body"
                    title={formatCurrency(
                      Math.ceil((cat.targetPercent / 100) * totalIncome * 100) / 100,
                    )}
                  >
                    {cat.targetPercent}%
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-heading tabular-nums">
                    {cat.realPercentOfIncome.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    {showBadStatus ? (
                      <span className="noir-badge-negative font-semibold">{badStatusLabel}</span>
                    ) : (
                      <span className="noir-badge-positive font-semibold">Dentro</span>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-noir-active/50 font-bold">
              <td className="px-4 py-3 text-heading">TOTAL</td>
              <td className="px-4 py-3 text-right text-heading tabular-nums">
                {formatCurrency(totalExpensesAll)}
              </td>
              <td className="px-4 py-3 text-center text-body" title={formatCurrency(totalIncome)}>
                100%
              </td>
              <td className="px-4 py-3 text-center text-heading tabular-nums">
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
