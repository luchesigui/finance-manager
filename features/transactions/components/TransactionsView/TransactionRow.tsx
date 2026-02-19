"use client";

import { CrystalBallLine } from "@/components/ui/CrystalBallLine";
import { formatCurrency, formatDateString } from "@/lib/format";
import type { Category, Person, Transaction } from "@/lib/types";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Pencil,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserX,
} from "lucide-react";

type TransactionRowProps = {
  transaction: Transaction;
  category: Category | undefined;
  person: Person | undefined;
  isOutlier: boolean;
  isSelectionMode: boolean;
  isSelected: boolean;
  canSelect: boolean;
  /** When set, overrides whether to show the "Próxima Fatura" tag (e.g. only when tx date is in selected month). */
  displayNextBillingTag?: boolean;
  onToggleSelection: () => void;
  onEdit: () => void;
  onMarkAsHappened?: () => void;
  onDelete?: () => void;
};

export function TransactionRow({
  transaction,
  category,
  person,
  isOutlier,
  isSelectionMode,
  isSelected,
  canSelect,
  displayNextBillingTag,
  onToggleSelection,
  onEdit,
  onMarkAsHappened,
  onDelete,
}: TransactionRowProps) {
  const isIncome = transaction.type === "income";
  const isIncrement = transaction.isIncrement ?? true;
  const isForecast = transaction.isForecast;
  const isFromTemplate = transaction.recurringTemplateId != null;

  return (
    <div
      role={isSelectionMode && canSelect ? "button" : undefined}
      tabIndex={isSelectionMode && canSelect ? 0 : undefined}
      className={`p-4 md:p-5 hover:bg-noir-active/30 transition-colors group cursor-pointer ${
        isSelected ? "bg-accent-primary/10" : ""
      } ${isIncome ? "border-l-2 border-l-accent-positive" : ""}`}
      onClick={() => {
        if (isSelectionMode && canSelect) {
          onToggleSelection();
        } else if (!isSelectionMode) {
          onEdit();
        }
      }}
      onKeyDown={(event) => {
        if (isSelectionMode && canSelect && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onToggleSelection();
        }
      }}
    >
      <div className="flex items-start gap-3 md:items-center md:gap-4">
        {isSelectionMode && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (canSelect) onToggleSelection();
            }}
            disabled={!canSelect}
            className={`w-5 h-5 mt-0.5 md:mt-0 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              isSelected
                ? "bg-accent-primary border-accent-primary text-white"
                : canSelect
                  ? "border-noir-border-light hover:border-accent-primary"
                  : "border-noir-border bg-noir-active cursor-not-allowed"
            }`}
            title={!canSelect ? "Lançamentos recorrentes não podem ser selecionados" : ""}
          >
            {isSelected && <Check size={12} strokeWidth={3} />}
          </button>
        )}
        <div
          className={`hidden md:flex w-10 h-10 min-w-[40px] rounded-full items-center justify-center text-white font-bold text-xs flex-shrink-0 ${
            isIncome
              ? isIncrement
                ? "bg-accent-positive/80"
                : "bg-accent-warning/80"
              : "bg-noir-active"
          }`}
        >
          {isIncome ? (
            isIncrement ? (
              <TrendingUp size={18} />
            ) : (
              <TrendingDown size={18} />
            )
          ) : (
            <span className="text-body">{(person?.name.substring(0, 2) ?? "?").toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-medium text-heading truncate">{transaction.description}</h4>
            <span
              className={`font-bold tabular-nums flex-shrink-0 ${
                isIncome
                  ? isIncrement
                    ? "text-accent-positive"
                    : "text-accent-warning"
                  : "text-heading"
              }`}
            >
              {isIncome && isIncrement ? "+" : isIncome && !isIncrement ? "-" : ""}
              {formatCurrency(transaction.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <p className="text-xs text-muted flex gap-1.5 flex-shrink-0">
                {category?.name && (
                  <>
                    <span>{category.name}</span>
                    <span>•</span>
                  </>
                )}
                <span>{formatDateString(transaction.date)}</span>
              </p>
              {isIncome && (
                <span
                  className={`${
                    isIncrement ? "noir-badge-positive" : "noir-badge-warning"
                  } flex items-center gap-1`}
                >
                  {isIncrement ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  <span className="hidden md:inline">{isIncrement ? "Renda" : "Dedução"}</span>
                </span>
              )}
              {isForecast && (
                <span className="noir-badge-warning flex items-center gap-1">
                  <CrystalBallLine size={13} />
                  <span className="hidden md:inline">Previsão</span>
                </span>
              )}
              {isFromTemplate && (
                <span className="noir-badge-accent flex items-center gap-1">
                  <RefreshCw size={13} />
                  <span className="hidden md:inline">Recorrente</span>
                </span>
              )}
              {transaction.isCreditCard && (
                <span className="noir-badge-accent flex items-center gap-1">
                  <CreditCard size={13} />
                  <span className="hidden md:inline">Cartão</span>
                </span>
              )}
              {(displayNextBillingTag !== undefined
                ? displayNextBillingTag
                : transaction.isNextBilling) && (
                <span className="noir-badge-warning flex items-center gap-1">
                  <ArrowRight size={13} />
                  <span className="hidden md:inline">Próxima Fatura</span>
                </span>
              )}
              {transaction.excludeFromSplit && (
                <span className="noir-badge-muted flex items-center gap-1">
                  <UserX size={13} />
                  <span className="hidden md:inline">Fora da divisão</span>
                </span>
              )}
              {isOutlier && (
                <span className="noir-badge-negative flex items-center gap-1">
                  <AlertTriangle size={13} />
                  <span className="hidden md:inline">Fora do padrão</span>
                </span>
              )}
            </div>
            {!isSelectionMode && (
              <div className="hidden md:flex items-center gap-1 mt-1 flex-shrink-0">
                {isForecast && onMarkAsHappened && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onMarkAsHappened();
                    }}
                    className="text-muted hover:text-accent-positive p-1.5 transition-all rounded-interactive hover:bg-accent-positive/10"
                    title="Marcar como acontecido"
                    aria-label={`Marcar lançamento como acontecido: ${transaction.description}`}
                  >
                    <CheckCircle2 size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit();
                  }}
                  className="text-muted hover:text-accent-primary p-1.5 transition-all rounded-interactive hover:bg-accent-primary/10"
                  title="Editar"
                  aria-label={`Editar lançamento: ${transaction.description}`}
                >
                  <Pencil size={15} />
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete();
                    }}
                    className="text-muted hover:text-accent-negative p-1.5 transition-all rounded-interactive hover:bg-accent-negative/10"
                    title="Excluir"
                    aria-label={`Excluir lançamento: ${transaction.description}`}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
