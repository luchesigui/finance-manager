"use client";

import {
  CreditCard,
  Layers,
  MinusCircle,
  PlusCircle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  UserX,
} from "lucide-react";
import { useMemo } from "react";

import { useCategories } from "@/components/finance/contexts/CategoriesContext";
import { useCurrentMonth } from "@/components/finance/contexts/CurrentMonthContext";
import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { CrystalBallLine } from "@/components/ui/CrystalBallLine";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { MONTH_NAMES_PT_BR, shouldCategoryAutoExcludeFromSplit } from "@/lib/constants";
import { toYearMonthString } from "@/lib/dateUtils";
import type { NewTransactionFormState } from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

type MonthOption = {
  value: string;
  label: string;
};

type TransactionFormFieldsProps = {
  formState: NewTransactionFormState;
  setFormState: React.Dispatch<React.SetStateAction<NewTransactionFormState>>;
  /** If true, shows installment-related fields (for new transaction form). */
  showInstallmentFields?: boolean;
  /** If true, shows description field. */
  showDescription?: boolean;
  /** Prefix for input IDs to avoid conflicts when multiple forms are on the page. */
  idPrefix?: string;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates month options for the selector (2 months before and after current).
 */
function generateMonthOptions(currentDate: Date): MonthOption[] {
  const options: MonthOption[] = [];

  for (let offset = -2; offset <= 2; offset++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const value = `${year}-${String(month + 1).padStart(2, "0")}`;
    const label = `${MONTH_NAMES_PT_BR[month]} ${year}`;
    options.push({ value, label });
  }

  return options;
}

// ============================================================================
// Component
// ============================================================================

export function TransactionFormFields({
  formState,
  setFormState,
  showInstallmentFields = true,
  showDescription = true,
  idPrefix = "",
}: TransactionFormFieldsProps) {
  const { categories } = useCategories();
  const { people } = usePeople();
  const { selectedMonthDate } = useCurrentMonth();

  const monthOptions = useMemo(() => generateMonthOptions(selectedMonthDate), [selectedMonthDate]);
  const currentYearMonth = useMemo(() => toYearMonthString(selectedMonthDate), [selectedMonthDate]);

  const inputId = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);
  const isIncome = formState.type === "income";

  /**
   * Handles category change with auto-exclude logic.
   */
  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    const shouldAutoExclude = category ? shouldCategoryAutoExcludeFromSplit(category.name) : false;

    setFormState({
      ...formState,
      categoryId,
      excludeFromSplit: shouldAutoExclude,
    });
  };

  /**
   * Handles month/date selection change.
   */
  const handleDateSelectionChange = (value: string) => {
    if (value === "specific") {
      setFormState({
        ...formState,
        dateSelectionMode: "specific",
        date: formState.date || "",
      });
    } else {
      setFormState({
        ...formState,
        dateSelectionMode: "month",
        selectedMonth: value,
        date: `${value}-01`,
      });
    }
  };

  return (
    <>
      {/* Transaction Type Selector */}
      <div className="lg:col-span-4">
        <span className="block text-xs font-medium text-noir-text-muted mb-2">
          Tipo de Lançamento
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormState({ ...formState, type: "expense", isIncrement: true })}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-interactive transition-all ${
              !isIncome
                ? "bg-noir-accent-negative/20 text-noir-accent-negative glow-accent"
                : "bg-noir-bg-surface text-noir-text-body hover:bg-noir-bg-active"
            }`}
            style={{
              borderColor: !isIncome
                ? "var(--color-noir-accent-negative)"
                : "rgba(255, 255, 255, 0.05)",
              borderWidth: "2px",
              borderStyle: "solid",
            }}
          >
            <MinusCircle size={18} />
            <span className="font-medium">Despesa</span>
          </button>
          <button
            type="button"
            onClick={() => setFormState({ ...formState, type: "income", isIncrement: true })}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-interactive transition-all ${
              isIncome
                ? "bg-noir-accent-positive/20 text-noir-accent-positive glow-accent"
                : "bg-noir-bg-surface text-noir-text-body hover:bg-noir-bg-active"
            }`}
            style={{
              borderColor: isIncome
                ? "var(--color-noir-accent-positive)"
                : "rgba(255, 255, 255, 0.05)",
              borderWidth: "2px",
              borderStyle: "solid",
            }}
          >
            <PlusCircle size={18} />
            <span className="font-medium">Renda</span>
          </button>
        </div>
      </div>

      {/* Income Increment/Decrement Selector */}
      {isIncome && (
        <div className="lg:col-span-4 animate-in slide-in-from-top-2 duration-200">
          <span className="block text-xs font-medium text-noir-text-muted mb-2">Tipo de Renda</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormState({ ...formState, isIncrement: true })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-interactive transition-all ${
                formState.isIncrement
                  ? "bg-noir-accent-positive/20 text-noir-accent-positive"
                  : "bg-noir-bg-surface text-noir-text-body hover:bg-noir-bg-active"
              }`}
              style={{
                borderColor: formState.isIncrement
                  ? "var(--color-noir-accent-positive)"
                  : "rgba(255, 255, 255, 0.05)",
                borderWidth: "2px",
                borderStyle: "solid",
              }}
            >
              <TrendingUp size={16} />
              <span className="text-sm font-medium">Incremento</span>
              <span className="text-xs text-noir-text-muted">(Bônus, 13º salário)</span>
            </button>
            <button
              type="button"
              onClick={() => setFormState({ ...formState, isIncrement: false })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-interactive transition-all ${
                !formState.isIncrement
                  ? "bg-noir-accent-warning/20 text-noir-accent-warning"
                  : "bg-noir-bg-surface text-noir-text-body hover:bg-noir-bg-active"
              }`}
              style={{
                borderColor: !formState.isIncrement
                  ? "var(--color-noir-accent-warning)"
                  : "rgba(255, 255, 255, 0.05)",
                borderWidth: "2px",
                borderStyle: "solid",
              }}
            >
              <TrendingDown size={16} />
              <span className="text-sm font-medium">Decremento</span>
              <span className="text-xs text-noir-text-muted">(Dedução, Estorno)</span>
            </button>
          </div>
        </div>
      )}

      {/* Description Field */}
      {showDescription && (
        <div className="lg:col-span-2">
          <label
            htmlFor={inputId("description")}
            className="block text-xs font-medium text-noir-text-muted mb-1"
          >
            Descrição
          </label>
          <input
            id={inputId("description")}
            type="text"
            placeholder={
              isIncome ? "Ex: Salário, Freelance, Bônus..." : "Ex: Luz, Mercado, iFood..."
            }
            className="w-full bg-noir-bg-surface text-noir-text-body rounded-interactive p-2 focus:ring-2 focus:ring-noir-accent-primary focus:outline-none"
            style={{
              borderColor: "rgba(255, 255, 255, 0.05)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
            value={formState.description}
            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
            required
          />
        </div>
      )}

      {/* Amount Field */}
      <div className="lg:col-span-2">
        <label
          htmlFor={inputId("amount")}
          className="block text-xs font-medium text-noir-text-muted mb-1"
        >
          Valor (R$)
        </label>
        <CurrencyInput
          id={inputId("amount")}
          placeholder="R$ 0,00"
          className="w-full tabular-nums bg-noir-bg-surface text-noir-text-body rounded-interactive p-2 border focus:ring-2 focus:ring-noir-accent-primary focus:outline-none"
          value={formState.amount}
          onValueChange={(value) => setFormState({ ...formState, amount: value })}
          required
        />
      </div>

      {/* Category Selector (expenses only) */}
      {!isIncome && (
        <div className="lg:col-span-2">
          <label
            htmlFor={inputId("category")}
            className="block text-xs font-medium text-noir-text-muted mb-1"
          >
            Categoria
          </label>
          <select
            id={inputId("category")}
            className="w-full bg-noir-bg-surface text-noir-text-body rounded-interactive p-2 focus:ring-2 focus:ring-noir-accent-primary focus:outline-none"
            style={{
              borderColor: "rgba(255, 255, 255, 0.05)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
            value={formState.categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Checkbox Options */}
      <div className="lg:col-span-4 flex flex-wrap items-center gap-6 pb-2">
        {/* Recurring Checkbox */}
        {(showInstallmentFields ? !formState.isInstallment : true) && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={inputId("recurring")}
              checked={formState.isRecurring}
              onChange={(e) => setFormState({ ...formState, isRecurring: e.target.checked })}
              className="w-4 h-4 text-noir-accent-primary rounded-interactive focus:ring-noir-accent-primary"
              style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
            />
            <label
              htmlFor={inputId("recurring")}
              className="text-sm text-noir-text-body flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={14} /> Recorrente?
            </label>
          </div>
        )}

        {/* Installment Checkbox (expenses only) */}
        {!isIncome && showInstallmentFields && !formState.isRecurring && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={inputId("installment")}
              checked={formState.isInstallment}
              onChange={(e) => setFormState({ ...formState, isInstallment: e.target.checked })}
              className="w-4 h-4 text-noir-accent-primary rounded-interactive focus:ring-noir-accent-primary"
              style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
            />
            <label
              htmlFor={inputId("installment")}
              className="text-sm text-noir-text-body flex items-center gap-1 cursor-pointer"
            >
              <Layers size={14} /> Parcelado?
            </label>
          </div>
        )}

        {/* Exclude from Split (expenses only) */}
        {!isIncome && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={inputId("exclude-from-split")}
              checked={formState.excludeFromSplit}
              onChange={(e) => setFormState({ ...formState, excludeFromSplit: e.target.checked })}
              className="w-4 h-4 text-noir-accent-primary rounded-interactive focus:ring-noir-accent-primary"
              style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
            />
            <label
              htmlFor={inputId("exclude-from-split")}
              className="text-sm text-noir-text-body flex items-center gap-1 cursor-pointer"
            >
              <UserX size={14} /> Não entra na divisão?
            </label>
          </div>
        )}

        {/* Credit Card (expenses only) */}
        {!isIncome && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={inputId("credit-card")}
              checked={formState.isCreditCard}
              onChange={(e) => setFormState({ ...formState, isCreditCard: e.target.checked })}
              className="w-4 h-4 text-noir-accent-primary rounded-interactive focus:ring-noir-accent-primary"
              style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
            />
            <label
              htmlFor={inputId("credit-card")}
              className="text-sm text-noir-text-body flex items-center gap-1 cursor-pointer"
              title="Se marcado, o lançamento entra no mês seguinte"
            >
              <CreditCard size={14} /> Cartão de Crédito
            </label>
          </div>
        )}

        {/* Forecast */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={inputId("forecast")}
            checked={formState.isForecast}
            onChange={(e) => setFormState({ ...formState, isForecast: e.target.checked })}
            className="w-4 h-4 text-noir-accent-primary rounded-interactive focus:ring-noir-accent-primary"
            style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
          />
          <label
            htmlFor={inputId("forecast")}
            className="text-sm text-noir-text-body flex items-center gap-1 cursor-pointer"
            title="Pode ser considerada na conta no resumo"
          >
            <CrystalBallLine size={14} /> Previsão?
          </label>
        </div>

        {/* Installment Count */}
        {!isIncome && showInstallmentFields && formState.isInstallment && (
          <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
            <span className="text-sm tabular-nums text-noir-text-muted">x</span>
            <input
              type="number"
              min={2}
              max={60}
              value={formState.installments}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  installments: Number.parseInt(e.target.value, 10) || 2,
                })
              }
              className="w-16 tabular-nums bg-noir-bg-surface text-noir-text-body rounded-interactive px-2 py-1 text-sm"
              style={{
                borderColor: "rgba(255, 255, 255, 0.05)",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            />
            <span className="text-xs text-noir-text-muted">parcelas</span>
          </div>
        )}
      </div>

      {/* Additional Information (collapsible) */}
      <details
        className="lg:col-span-4 rounded-interactive bg-noir-bg-primary"
        style={{
          borderColor: "rgba(255, 255, 255, 0.05)",
          borderWidth: "1px",
          borderStyle: "solid",
        }}
      >
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-noir-text-body">
          Informações adicionais
          <span className="ml-2 text-xs font-normal text-noir-text-muted">(Data, Atribuído à)</span>
        </summary>
        <div className="px-4 pb-4 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Month/Date Selector */}
          <div>
            <label
              htmlFor={inputId("month-selector")}
              className="block text-xs font-medium text-noir-text-muted mb-1"
            >
              Mês {showInstallmentFields && "(Opcional)"}
            </label>
            <select
              id={inputId("month-selector")}
              className="w-full bg-noir-bg-surface text-noir-text-body rounded-interactive p-2 focus:ring-2 focus:ring-noir-accent-primary focus:outline-none"
              style={{
                borderColor: "rgba(255, 255, 255, 0.05)",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
              value={
                formState.dateSelectionMode === "specific"
                  ? "specific"
                  : formState.selectedMonth || currentYearMonth
              }
              onChange={(e) => handleDateSelectionChange(e.target.value)}
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              <option value="specific">Data específica</option>
            </select>
            {formState.dateSelectionMode === "specific" && (
              <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
                <input
                  id={inputId("date")}
                  type="date"
                  className="w-full bg-noir-bg-surface text-noir-text-body rounded-interactive p-2 focus:ring-2 focus:ring-noir-accent-primary focus:outline-none"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.05)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                  value={formState.date}
                  onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Person Selector */}
          <div>
            <label
              htmlFor={inputId("paid-by")}
              className="block text-xs font-medium text-noir-text-muted mb-1"
            >
              Atribuir à
            </label>
            <select
              id={inputId("paid-by")}
              className="w-full bg-noir-bg-surface text-noir-text-body rounded-interactive p-2 focus:ring-2 focus:ring-noir-accent-primary focus:outline-none"
              style={{
                borderColor: "rgba(255, 255, 255, 0.05)",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
              value={formState.paidBy}
              onChange={(e) => setFormState({ ...formState, paidBy: e.target.value })}
            >
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </details>
    </>
  );
}
