"use client";

import { Trash2 } from "lucide-react";

import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { formatPercent } from "@/lib/format";
import type { Person } from "@/lib/types";

type PersonEditRowProps = {
  person: Person;
  editedIncome: number;
  edits: { name: string; income: number };
  totalIncome: number;
  onEditChange: (personId: string, field: "name" | "income", value: string | number) => void;
  onDelete?: (personId: string) => void;
  isDeleting?: boolean;
  isCurrentUser?: boolean;
};

export function PersonEditRow({
  person,
  editedIncome,
  edits,
  totalIncome,
  onEditChange,
  onDelete,
  isDeleting,
  isCurrentUser,
}: PersonEditRowProps) {
  // Calculate share percent based on edited income
  const safeTotal = totalIncome > 0 ? totalIncome : 1;
  const sharePercent = totalIncome > 0 ? editedIncome / safeTotal : 0;

  const bgClass = isCurrentUser ? "bg-noir-accent-primary/20" : "bg-noir-bg-primary";
  const borderStyle = isCurrentUser
    ? {
        borderColor: "var(--color-noir-accent-primary)",
        borderWidth: "2px",
        borderStyle: "solid" as const,
      }
    : {
        borderColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: "1px",
        borderStyle: "solid" as const,
      };
  const labelColorClass = isCurrentUser ? "text-noir-text-accent" : "text-noir-text-muted";
  const inputBorderStyle = isCurrentUser
    ? {
        borderColor: "var(--color-noir-accent-primary)",
        borderWidth: "1px",
        borderStyle: "solid" as const,
      }
    : {
        borderColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: "1px",
        borderStyle: "solid" as const,
      };

  return (
    <div
      className={`flex flex-col md:flex-row gap-3 items-end p-3 rounded-interactive ${bgClass}`}
      style={borderStyle}
    >
      <div className="flex-1 w-full">
        <label
          htmlFor={`person-name-${person.id}`}
          className={`text-xs font-medium ${labelColorClass}`}
        >
          Nome {isCurrentUser && "(Você)"}
        </label>
        <input
          id={`person-name-${person.id}`}
          type="text"
          value={edits.name}
          onChange={(e) => onEditChange(person.id, "name", e.target.value)}
          className="w-full bg-noir-bg-surface text-noir-text-body rounded-interactive px-2 py-1 text-sm"
          style={inputBorderStyle}
        />
      </div>

      <div className="w-full md:w-48">
        <label
          htmlFor={`person-income-${person.id}`}
          className={`text-xs font-medium ${labelColorClass}`}
        >
          Renda Mensal
        </label>
        <CurrencyInput
          id={`person-income-${person.id}`}
          value={edits.income}
          onValueChange={(value) => onEditChange(person.id, "income", value ?? 0)}
          className={`w-full tabular-nums bg-noir-bg-surface text-noir-text-body rounded-interactive px-2 py-1 text-sm border ${
            isCurrentUser ? "border-noir-text-accent" : ""
          }`}
          placeholder="R$ 0,00"
        />
      </div>

      <div
        className={`w-full md:w-auto text-xs tabular-nums px-2 py-[6px] bg-noir-bg-surface rounded-interactive font-medium ${
          isCurrentUser ? "text-noir-text-accent" : "text-noir-text-muted"
        }`}
        style={inputBorderStyle}
      >
        Porcentagem: {formatPercent(sharePercent * 100)}
      </div>

      {!isCurrentUser && onDelete && (
        <button
          type="button"
          onClick={() => onDelete(person.id)}
          disabled={isDeleting}
          className="px-3 py-1 bg-noir-accent-negative/20 text-noir-accent-negative rounded-interactive text-sm font-medium hover:bg-noir-accent-negative/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          title="Remover participante"
        >
          <Trash2 size={16} />
          {isDeleting ? "Removendo..." : "Remover"}
        </button>
      )}
    </div>
  );
}
