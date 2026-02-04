"use client";

import { formatCurrency } from "@/lib/format";
import type { ChartDataPoint } from "@/lib/simulationTypes";
import { ChevronDown, TableProperties } from "lucide-react";
import { useState } from "react";

// ============================================================================
// Types
// ============================================================================

type MonthlyBreakdownTableProps = {
  data: ChartDataPoint[];
  isLoading?: boolean;
};

// ============================================================================
// Main Component
// ============================================================================

export function MonthlyBreakdownTable({ data, isLoading }: MonthlyBreakdownTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="noir-card overflow-hidden animate-pulse">
        <div className="p-4 border-b border-noir-border bg-noir-active/50 flex items-center gap-2">
          <div className="w-5 h-5 bg-noir-active rounded" />
          <div className="h-5 w-40 bg-noir-active rounded" />
        </div>
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-noir-active rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate totals
  const lastPoint = data[data.length - 1];
  const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
  const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);
  const avgBalance =
    data.length > 0 ? data.reduce((sum, d) => sum + d.monthlyBalance, 0) / data.length : 0;

  return (
    <div className="noir-card overflow-hidden">
      {/* Header - clickable to expand */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-noir-active/30 transition-colors border-b border-noir-border bg-noir-active/50"
      >
        <span className="flex items-center gap-2">
          <TableProperties size={18} className="text-accent-primary" />
          <span className="font-semibold text-heading">Detalhamento Mensal</span>
        </span>
        <ChevronDown
          className={`transition-transform duration-300 text-muted ${
            isExpanded ? "rotate-180" : ""
          }`}
          size={20}
        />
      </button>

      {/* Collapsible content */}
      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${
          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="noir-table w-full">
            <thead>
              <tr>
                <th className="text-left">Mês</th>
                <th className="text-right">Renda</th>
                <th className="text-right">Custo</th>
                <th className="text-right">Saldo/Mês</th>
                <th className="text-right">Liberdade</th>
                <th className="text-right">Prejuízo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.periodKey}>
                  <td className="font-medium text-heading">{row.period}</td>
                  <td className="text-right tabular-nums text-accent-primary">
                    {formatCurrency(row.income)}
                  </td>
                  <td className="text-right tabular-nums text-accent-negative">
                    {formatCurrency(row.expenses)}
                  </td>
                  <td
                    className={`text-right tabular-nums font-medium ${
                      row.monthlyBalance >= 0 ? "text-accent-positive" : "text-accent-negative"
                    }`}
                  >
                    {row.monthlyBalance >= 0 ? "+" : ""}
                    {formatCurrency(row.monthlyBalance)}
                  </td>
                  <td className="text-right tabular-nums text-accent-spending">
                    {row.cumulativeFreedom > 0 ? formatCurrency(row.cumulativeFreedom) : "—"}
                  </td>
                  <td className="text-right tabular-nums text-accent-negative">
                    {row.cumulativeDeficit < 0 ? formatCurrency(row.cumulativeDeficit) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-noir-border bg-noir-active/30">
              <tr className="font-semibold">
                <td className="text-heading">TOTAL</td>
                <td className="text-right tabular-nums text-accent-primary">
                  {formatCurrency(data[0]?.income || 0)}/mês
                </td>
                <td className="text-right tabular-nums text-accent-negative">
                  {formatCurrency(data[0]?.expenses || 0)}/mês
                </td>
                <td
                  className={`text-right tabular-nums ${
                    avgBalance >= 0 ? "text-accent-positive" : "text-accent-negative"
                  }`}
                >
                  {avgBalance >= 0 ? "+" : ""}
                  {formatCurrency(avgBalance)}/mês
                </td>
                <td className="text-right tabular-nums text-accent-spending">
                  {lastPoint?.cumulativeFreedom > 0
                    ? formatCurrency(lastPoint.cumulativeFreedom)
                    : "R$ 0"}
                </td>
                <td className="text-right tabular-nums text-accent-negative">
                  {lastPoint?.cumulativeDeficit < 0
                    ? formatCurrency(lastPoint.cumulativeDeficit)
                    : "R$ 0"}
                </td>
              </tr>
              <tr className="text-xs text-muted">
                <td />
                <td className="text-right" />
                <td className="text-right" />
                <td className="text-right" />
                <td className="text-right">em 12 meses</td>
                <td className="text-right">em 12 meses</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
