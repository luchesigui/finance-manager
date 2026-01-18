"use client";

import type { SettlementRow } from "@/components/finance/hooks/useFinanceCalculations";
import { formatCurrency, formatPercent } from "@/lib/format";

type PersonSettlementRowProps = {
  person: SettlementRow;
  totalExpenses: number;
};

export function PersonSettlementRow({ person, totalExpenses }: PersonSettlementRowProps) {
  const fairSharePercent = totalExpenses > 0 ? (person.fairShareAmount / totalExpenses) * 100 : 0;

  return (
    <div className="relative">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="font-medium text-lg text-slate-800">{person.name}</span>
          <span className="text-xs text-slate-500 ml-2">
            (Renda: {formatPercent(person.sharePercent * 100)})
          </span>
        </div>
      </div>

      <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-slate-300 opacity-50 transition-all duration-500"
          style={{ width: `${fairSharePercent}%` }}
          title="Parte Justa"
        />
      </div>

      <div className="mt-2 text-xs text-slate-500 flex justify-between">
        <span>
          Pagou de fato:{" "}
          <strong className="text-slate-700">{formatCurrency(person.paidAmount)}</strong>
        </span>
        <span>
          Deveria pagar:{" "}
          <strong className="text-slate-700">{formatCurrency(person.fairShareAmount)}</strong>
        </span>
      </div>
    </div>
  );
}
