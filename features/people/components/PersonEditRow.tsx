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

  return (
    <div
      className={`flex flex-col md:flex-row gap-3 items-end p-3 rounded-card transition-all duration-200 ${
        isCurrentUser
          ? "bg-accent-primary/10 border-2 border-accent-primary/30"
          : "bg-noir-active border border-noir-border"
      }`}
    >
      <div className="flex-1 w-full">
        <label
          htmlFor={`person-name-${person.id}`}
          className={`text-xs font-medium ${isCurrentUser ? "text-accent-primary" : "text-body"}`}
        >
          Nome {isCurrentUser && "(Você)"}
        </label>
        <input
          id={`person-name-${person.id}`}
          type="text"
          value={edits.name}
          onChange={(e) => onEditChange(person.id, "name", e.target.value)}
          className={`noir-input w-full text-sm ${
            isCurrentUser ? "border-accent-primary/30 focus:border-accent-primary" : ""
          }`}
        />
      </div>

      <div className="w-full md:w-48">
        <label
          htmlFor={`person-income-${person.id}`}
          className={`text-xs font-medium ${isCurrentUser ? "text-accent-primary" : "text-body"}`}
        >
          Renda Mensal
        </label>
        <CurrencyInput
          id={`person-income-${person.id}`}
          value={edits.income}
          onValueChange={(value) => onEditChange(person.id, "income", value ?? 0)}
          className={`noir-input w-full text-sm ${
            isCurrentUser ? "border-accent-primary/30 focus:border-accent-primary" : ""
          }`}
          placeholder="R$ 0,00"
        />
      </div>

      <div
        className={`w-full md:w-auto text-xs px-3 py-2 rounded-interactive font-medium tabular-nums ${
          isCurrentUser
            ? "text-accent-primary bg-accent-primary/10 border border-accent-primary/30"
            : "text-body bg-noir-surface border border-noir-border"
        }`}
      >
        Porcentagem: {formatPercent(sharePercent * 100)}
      </div>

      {!isCurrentUser && onDelete && (
        <button
          type="button"
          onClick={() => onDelete(person.id)}
          disabled={isDeleting}
          className="noir-btn-danger px-3 py-1.5 text-sm flex items-center gap-1"
          title="Remover participante"
        >
          <Trash2 size={16} />
          {isDeleting ? "Removendo..." : "Remover"}
        </button>
      )}
    </div>
  );
}
