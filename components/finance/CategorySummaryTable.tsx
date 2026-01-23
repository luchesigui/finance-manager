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
    <div
      className="bg-noir-bg-surface rounded-card border"
      style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
    >
      <div
        className="p-4 border-b bg-noir-bg-primary"
        style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
      >
        <h2 className="font-semibold text-noir-text-heading flex items-center gap-2">
          <PieChart size={18} />
          Metas vs Realizado
        </h2>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-sm text-left text-noir-text-body">
          <thead className="text-xs text-noir-text-muted uppercase bg-noir-bg-primary">
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
                  className="border-b last:border-0 hover:bg-noir-bg-active"
                  style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
                >
                  <td className="px-4 py-3 font-medium" style={getCategoryColorStyle(cat.name)}>
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(cat.totalSpent)}
                  </td>
                  <td
                    className="px-4 py-3 text-center tabular-nums"
                    title={formatCurrency(
                      Math.ceil((cat.targetPercent / 100) * totalIncome * 100) / 100,
                    )}
                  >
                    {cat.targetPercent}%
                  </td>
                  <td className="px-4 py-3 text-center font-bold tabular-nums">
                    {cat.realPercentOfIncome.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    {showBadStatus ? (
                      <span className="bg-noir-accent-negative/20 text-noir-accent-negative px-2 py-1 rounded-interactive text-xs font-bold">
                        {badStatusLabel}
                      </span>
                    ) : (
                      <span className="bg-noir-accent-positive/20 text-noir-accent-positive px-2 py-1 rounded-interactive text-xs font-bold">
                        Dentro
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-noir-bg-primary font-bold">
              <td className="px-4 py-3 text-noir-text-heading">TOTAL</td>
              <td className="px-4 py-3 text-right text-noir-text-heading tabular-nums">
                {formatCurrency(totalExpensesAll)}
              </td>
              <td
                className="px-4 py-3 text-center text-noir-text-heading tabular-nums"
                title={formatCurrency(totalIncome)}
              >
                100%
              </td>
              <td className="px-4 py-3 text-center text-noir-text-heading tabular-nums">
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
