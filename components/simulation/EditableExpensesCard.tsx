"use client";

import { formatCurrency } from "@/lib/format";
import type { EditableExpense } from "@/lib/simulationTypes";
import { ChevronDown, ClipboardList, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

// ============================================================================
// Types
// ============================================================================

type EditableExpensesCardProps = {
  expenses: EditableExpense[];
  totalSimulatedExpenses: number;
  onToggleExpense: (expenseId: string) => void;
  onAddExpense: (description: string, amount: number) => void;
  onRemoveExpense: (expenseId: string) => void;
};

// ============================================================================
// Add Expense Form Component
// ============================================================================

type AddExpenseFormProps = {
  onAdd: (description: string, amount: number) => void;
};

function AddExpenseForm({ onAdd }: AddExpenseFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const parsedAmount = Number.parseFloat(amount.replace(",", "."));
      if (description.trim() && !Number.isNaN(parsedAmount) && parsedAmount > 0) {
        onAdd(description.trim(), parsedAmount);
        setDescription("");
        setAmount("");
      }
    },
    [description, amount, onAdd],
  );

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-3 bg-noir-active/50 rounded-card">
      <div className="flex items-center gap-2 mb-3">
        <Plus size={16} className="text-accent-primary" />
        <span className="text-sm font-medium text-heading">Adicionar Gasto na Simulação</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="noir-input flex-1 text-sm"
        />
        <input
          type="text"
          placeholder="R$ 0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="noir-input w-full sm:w-28 text-sm"
        />
        <button
          type="submit"
          disabled={!description.trim() || !amount}
          className="noir-btn-primary text-sm py-2 disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// Expense Row Component
// ============================================================================

type ExpenseRowProps = {
  expense: EditableExpense;
  onToggle: () => void;
  onRemove?: () => void;
};

function ExpenseRow({ expense, onToggle, onRemove }: ExpenseRowProps) {
  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-interactive cursor-pointer transition-all hover:bg-noir-active ${
        expense.isManual
          ? "bg-accent-primary/10 border-l-2 border-accent-primary"
          : expense.isIncluded
            ? "bg-noir-surface"
            : "bg-noir-active/30 opacity-60"
      }`}
      onClick={expense.isManual ? undefined : onToggle}
      role={expense.isManual ? undefined : "button"}
      tabIndex={expense.isManual ? undefined : 0}
      onKeyDown={(e) => {
        if (!expense.isManual && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {!expense.isManual && (
        <input
          type="checkbox"
          checked={expense.isIncluded}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-noir-border text-accent-primary focus:ring-accent-primary focus:ring-offset-0 bg-noir-active"
        />
      )}
      <span
        className={`flex-1 text-sm ${
          expense.isIncluded ? "text-heading" : "text-muted line-through"
        }`}
      >
        {expense.description}
        {expense.isRecurring && !expense.isIncluded && (
          <span className="text-xs text-muted ml-2">(ignorado)</span>
        )}
      </span>
      <span
        className={`font-medium tabular-nums text-sm ${
          expense.isIncluded ? "text-heading" : "text-muted"
        }`}
      >
        {formatCurrency(expense.amount)}
      </span>
      {expense.isManual && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 text-muted hover:text-accent-negative transition-colors rounded"
          aria-label="Remover gasto"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function EditableExpensesCard({
  expenses,
  totalSimulatedExpenses,
  onToggleExpense,
  onAddExpense,
  onRemoveExpense,
}: EditableExpensesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const recurringExpenses = expenses.filter((e) => !e.isManual);
  const manualExpenses = expenses.filter((e) => e.isManual);

  return (
    <div className="noir-card overflow-hidden">
      {/* Header - clickable to expand */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-noir-active/30 transition-colors"
      >
        <span className="flex items-center gap-2">
          <ClipboardList size={18} className="text-accent-primary" />
          <span className="font-semibold text-heading">Gastos Considerados na Simulação</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted tabular-nums">
            {formatCurrency(totalSimulatedExpenses)}/mês
          </span>
          <ChevronDown
            className={`transition-transform duration-300 text-muted ${
              isExpanded ? "rotate-180" : ""
            }`}
            size={20}
          />
        </div>
      </button>

      {/* Collapsible content */}
      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 border-t border-noir-border">
          {/* Recurring/System expenses */}
          {recurringExpenses.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted uppercase tracking-wide">
                  Gastos do Sistema
                </span>
                <span className="text-xs text-muted tabular-nums">
                  Total:{" "}
                  {formatCurrency(
                    recurringExpenses
                      .filter((e) => e.isIncluded)
                      .reduce((sum, e) => sum + e.amount, 0),
                  )}
                </span>
              </div>
              <div className="space-y-1">
                {recurringExpenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onToggle={() => onToggleExpense(expense.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Manual expenses */}
          {manualExpenses.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted uppercase tracking-wide">
                  Gastos Adicionados Manualmente
                </span>
                <span className="text-xs text-muted tabular-nums">
                  Total: {formatCurrency(manualExpenses.reduce((sum, e) => sum + e.amount, 0))}
                </span>
              </div>
              <div className="space-y-1">
                {manualExpenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onToggle={() => {}}
                    onRemove={() => onRemoveExpense(expense.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add expense form */}
          <AddExpenseForm onAdd={onAddExpense} />

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-noir-border flex items-center justify-between">
            <span className="font-semibold text-heading">TOTAL SIMULADO:</span>
            <span className="text-lg font-bold text-heading tabular-nums">
              {formatCurrency(totalSimulatedExpenses)}/mês
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
