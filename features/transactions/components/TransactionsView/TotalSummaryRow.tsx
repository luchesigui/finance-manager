import { formatCurrency } from "@/lib/format";

interface TotalSummaryRowProps {
  typeFilter: string;
  visibleCount: number;
  incomeCount: number;
  expenseCount: number;
  transferCount: number;
  incomeTotal: number;
  expenseTotal: number;
  transferTotal: number;
  totalVisible: number;
}

export function TotalSummaryRow({
  typeFilter,
  visibleCount,
  incomeCount,
  expenseCount,
  transferCount,
  incomeTotal,
  expenseTotal,
  transferTotal,
  totalVisible,
}: TotalSummaryRowProps) {
  if (totalVisible === 0) return null;

  return (
    <div className="p-4 border-t border-noir-border bg-noir-active/50 flex items-center justify-between">
      <span className="font-semibold text-heading">
        {typeFilter === "income" ? (
          <>Total de {incomeCount} recebimento(s)</>
        ) : typeFilter === "expense" ? (
          <>Total de {expenseCount} lançamento(s)</>
        ) : typeFilter === "transfer" ? (
          <>Total de {transferCount} transferência(s)</>
        ) : (
          <>
            Total de {totalVisible} lançamentos
            {incomeCount > 0 && (
              <span className="text-xs text-body ml-1">
                (+ {incomeCount} recebimentos não considerados na conta total)
              </span>
            )}
          </>
        )}
      </span>
      <span className="font-bold text-lg text-heading tabular-nums">
        {typeFilter === "income"
          ? formatCurrency(incomeTotal)
          : typeFilter === "transfer"
            ? formatCurrency(transferTotal)
            : formatCurrency(expenseTotal)}
      </span>
    </div>
  );
}
