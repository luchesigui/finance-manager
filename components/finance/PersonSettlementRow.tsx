"use client";

import type { SettlementRow } from "@/components/finance/hooks/useFinanceCalculations";
import { formatCurrency, formatPercent } from "@/lib/format";

type PersonSettlementRowProps = {
  person: SettlementRow;
  totalExpenses: number;
};

export function PersonSettlementRow({ person, totalExpenses }: PersonSettlementRowProps) {
  const fairSharePercent = totalExpenses > 0 ? (person.fairShareAmount / totalExpenses) * 100 : 0;
  const paidPercent = totalExpenses > 0 ? (person.paidAmount / totalExpenses) * 100 : 0;
  const balance = person.balance;
  const isPositive = balance >= 0;

  return (
    <div className="relative">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="font-medium text-lg text-heading">{person.name}</span>
          <span className="text-xs text-muted ml-2">
            (Renda: {formatPercent(person.sharePercent * 100)})
          </span>
        </div>
        <div
          className={`text-sm font-semibold tabular-nums ${isPositive ? "text-accent-positive" : "text-accent-negative"}`}
        >
          {isPositive ? "+" : ""}
          {formatCurrency(balance)}
        </div>
      </div>

      {/* Progress bar with segmented style */}
      <div className="h-3 noir-progress-track flex relative">
        {/* Fair share indicator (background track) */}
        <div
          className="absolute h-full bg-noir-border transition-all duration-500 rounded-full"
          style={{ width: `${fairSharePercent}%` }}
          title="Parte Justa"
        />
        {/* Paid amount indicator */}
        <div
          className={`h-full rounded-full transition-all duration-500 relative z-10 ${
            paidPercent > fairSharePercent ? "bg-accent-positive" : "bg-accent-spending"
          }`}
          style={{ width: `${Math.min(paidPercent, 100)}%` }}
          title="Pagou"
        />
      </div>

      <div className="mt-2 text-xs text-body flex justify-between">
        <span>
          Pagou de fato:{" "}
          <strong className="text-heading tabular-nums">{formatCurrency(person.paidAmount)}</strong>
        </span>
        <span>
          Deveria pagar:{" "}
          <strong className="text-heading tabular-nums">
            {formatCurrency(person.fairShareAmount)}
          </strong>
        </span>
      </div>
    </div>
  );
}
