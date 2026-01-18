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

  const bgClass = isCurrentUser ? "bg-indigo-50" : "bg-slate-50";
  const borderClass = isCurrentUser ? "border-2 border-indigo-200" : "";
  const labelColorClass = isCurrentUser ? "text-indigo-700" : "text-slate-500";
  const inputBorderClass = isCurrentUser ? "border-indigo-300" : "border-slate-300";

  return (
    <div
      className={`flex flex-col md:flex-row gap-3 items-end p-3 rounded-lg ${bgClass} ${borderClass}`}
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
          className={`w-full bg-white border rounded px-2 py-1 text-sm ${inputBorderClass}`}
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
          className={`w-full bg-white border rounded px-2 py-1 text-sm ${inputBorderClass}`}
          placeholder="R$ 0,00"
        />
      </div>

      <div
        className={`w-full md:w-auto text-xs px-2 py-[6px] bg-white border rounded font-medium ${
          isCurrentUser ? "text-indigo-700 border-indigo-200" : "text-slate-500 border-slate-200"
        }`}
      >
        Porcentagem: {formatPercent(sharePercent * 100)}
      </div>

      {!isCurrentUser && onDelete && (
        <button
          type="button"
          onClick={() => onDelete(person.id)}
          disabled={isDeleting}
          className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          title="Remover participante"
        >
          <Trash2 size={16} />
          {isDeleting ? "Removendo..." : "Remover"}
        </button>
      )}
    </div>
  );
}
