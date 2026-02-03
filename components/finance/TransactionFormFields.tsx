"use client";

import { useCategories } from "@/components/finance/contexts/CategoriesContext";
import { useCurrentMonth } from "@/components/finance/contexts/CurrentMonthContext";
import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { CrystalBallLine } from "@/components/ui/CrystalBallLine";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { FieldError } from "@/components/ui/FieldError";
import { MONTH_NAMES_PT_BR, shouldCategoryAutoExcludeFromSplit } from "@/lib/constants";
import { toYearMonthString } from "@/lib/dateUtils";
import { zodValidator } from "@/lib/form";
import { amountSchema, descriptionSchema } from "@/lib/formSchemas";
import type { NewTransactionFormState } from "@/lib/types";
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

// ============================================================================
// Types
// ============================================================================

type MonthOption = {
  value: string;
  label: string;
};

// TanStack Form has complex generic types. We use simplified interfaces
// that capture the methods we actually use from the form instance.
// biome-ignore lint/suspicious/noExplicitAny: Complex generic type from TanStack Form
type TransactionFormInstance = any;

// Simplified field state type for callback functions
type FieldState<T> = {
  state: {
    value: T;
    meta: {
      errors: string[];
    };
  };
  handleChange: (value: T) => void;
  handleBlur: () => void;
};

type TransactionFormFieldsProps = {
  form: TransactionFormInstance;
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
  form,
  showInstallmentFields = true,
  showDescription = true,
  idPrefix = "",
}: TransactionFormFieldsProps) {
  const { categories } = useCategories();
  const { people } = usePeople();
  const { selectedMonthDate } = useCurrentMonth();

  const monthOptions = generateMonthOptions(selectedMonthDate);
  const currentYearMonth = toYearMonthString(selectedMonthDate);

  const inputId = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);

  /**
   * Handles category change with auto-exclude logic.
   */
  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    const shouldAutoExclude = category ? shouldCategoryAutoExcludeFromSplit(category.name) : false;

    form.setFieldValue("categoryId", categoryId);
    form.setFieldValue("excludeFromSplit", shouldAutoExclude);
  };

  /**
   * Handles month/date selection change.
   */
  const handleDateSelectionChange = (value: string) => {
    if (value === "specific") {
      form.setFieldValue("dateSelectionMode", "specific");
    } else {
      form.setFieldValue("dateSelectionMode", "month");
      form.setFieldValue("selectedMonth", value);
      form.setFieldValue("date", `${value}-01`);
    }
  };

  return (
    <form.Subscribe selector={(state: { values: NewTransactionFormState }) => state.values}>
      {(values: NewTransactionFormState) => {
        const isIncome = values.type === "income";

        return (
          <>
            {/* Transaction Type Selector */}
            <div className="lg:col-span-4">
              <span className="block text-xs font-medium text-body mb-2">Tipo de Lançamento</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    form.setFieldValue("type", "expense");
                    form.setFieldValue("isIncrement", true);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-interactive border-2 transition-all duration-200 ${
                    !isIncome
                      ? "border-accent-negative bg-accent-negative/10 text-accent-negative"
                      : "border-noir-border bg-noir-active text-body hover:border-noir-border-light hover:text-heading"
                  }`}
                >
                  <MinusCircle size={18} />
                  <span className="font-medium">Despesa</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    form.setFieldValue("type", "income");
                    form.setFieldValue("isIncrement", true);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-interactive border-2 transition-all duration-200 ${
                    isIncome
                      ? "border-accent-positive bg-accent-positive/10 text-accent-positive"
                      : "border-noir-border bg-noir-active text-body hover:border-noir-border-light hover:text-heading"
                  }`}
                >
                  <PlusCircle size={18} />
                  <span className="font-medium">Renda</span>
                </button>
              </div>
            </div>

            {/* Income Increment/Decrement Selector */}
            {isIncome && (
              <div className="lg:col-span-4 animate-in slide-in-from-top-2 duration-200">
                <span className="block text-xs font-medium text-body mb-2">Tipo de Renda</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => form.setFieldValue("isIncrement", true)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-interactive border-2 transition-all duration-200 ${
                      values.isIncrement
                        ? "border-accent-positive bg-accent-positive/10 text-accent-positive"
                        : "border-noir-border bg-noir-active text-body hover:border-noir-border-light hover:text-heading"
                    }`}
                  >
                    <TrendingUp size={16} />
                    <span className="text-sm font-medium">Incremento</span>
                    <span className="text-xs text-muted">(Bônus, 13º salário)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => form.setFieldValue("isIncrement", false)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-interactive border-2 transition-all duration-200 ${
                      !values.isIncrement
                        ? "border-accent-warning bg-accent-warning/10 text-accent-warning"
                        : "border-noir-border bg-noir-active text-body hover:border-noir-border-light hover:text-heading"
                    }`}
                  >
                    <TrendingDown size={16} />
                    <span className="text-sm font-medium">Decremento</span>
                    <span className="text-xs text-muted">(Dedução, Estorno)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Description Field */}
            {showDescription && (
              <div className="lg:col-span-2">
                <form.Field
                  name="description"
                  validators={{
                    onBlur: zodValidator(descriptionSchema),
                  }}
                >
                  {(field: FieldState<string>) => (
                    <>
                      <label
                        htmlFor={inputId("description")}
                        className="block text-xs font-medium text-body mb-1"
                      >
                        Descrição
                      </label>
                      <input
                        id={inputId("description")}
                        type="text"
                        placeholder={
                          isIncome
                            ? "Ex: Salário, Freelance, Bônus..."
                            : "Ex: Luz, Mercado, iFood..."
                        }
                        className={`noir-input w-full ${
                          field.state.meta.errors.length > 0 ? "border-accent-negative" : ""
                        }`}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        required
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </>
                  )}
                </form.Field>
              </div>
            )}

            {/* Amount Field */}
            <div className="lg:col-span-2">
              <form.Field
                name="amount"
                validators={{
                  onBlur: zodValidator(amountSchema),
                }}
              >
                {(field: FieldState<number | null>) => (
                  <>
                    <label
                      htmlFor={inputId("amount")}
                      className="block text-xs font-medium text-body mb-1"
                    >
                      Valor (R$)
                    </label>
                    <CurrencyInput
                      id={inputId("amount")}
                      placeholder="R$ 0,00"
                      className={`noir-input w-full ${
                        field.state.meta.errors.length > 0 ? "border-accent-negative" : ""
                      }`}
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                      required
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </>
                )}
              </form.Field>
            </div>

            {/* Category Selector (expenses only) */}
            {!isIncome && (
              <div className="lg:col-span-2">
                <form.Field name="categoryId">
                  {(field: FieldState<string>) => (
                    <>
                      <label
                        htmlFor={inputId("category")}
                        className="block text-xs font-medium text-body mb-1"
                      >
                        Categoria
                      </label>
                      <select
                        id={inputId("category")}
                        className="noir-select w-full"
                        value={field.state.value}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </form.Field>
              </div>
            )}

            {/* Checkbox Options */}
            <div className="lg:col-span-4 flex flex-wrap items-center gap-6 pb-2">
              {/* Recurring Checkbox */}
              {(showInstallmentFields ? !values.isInstallment : true) && (
                <div className="flex items-center gap-2">
                  <form.Field name="isRecurring">
                    {(field: FieldState<boolean>) => (
                      <>
                        <input
                          type="checkbox"
                          id={inputId("recurring")}
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                          className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary focus:ring-offset-noir-primary"
                        />
                        <label
                          htmlFor={inputId("recurring")}
                          className="text-sm text-body flex items-center gap-1 cursor-pointer hover:text-heading transition-colors"
                        >
                          <RefreshCw size={14} /> Recorrente?
                        </label>
                      </>
                    )}
                  </form.Field>
                </div>
              )}

              {/* Installment Checkbox (expenses only) */}
              {!isIncome && showInstallmentFields && !values.isRecurring && (
                <div className="flex items-center gap-2">
                  <form.Field name="isInstallment">
                    {(field: FieldState<boolean>) => (
                      <>
                        <input
                          type="checkbox"
                          id={inputId("installment")}
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                          className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary focus:ring-offset-noir-primary"
                        />
                        <label
                          htmlFor={inputId("installment")}
                          className="text-sm text-body flex items-center gap-1 cursor-pointer hover:text-heading transition-colors"
                        >
                          <Layers size={14} /> Parcelado?
                        </label>
                      </>
                    )}
                  </form.Field>
                </div>
              )}

              {/* Exclude from Split (expenses only) */}
              {!isIncome && (
                <div className="flex items-center gap-2">
                  <form.Field name="excludeFromSplit">
                    {(field: FieldState<boolean>) => (
                      <>
                        <input
                          type="checkbox"
                          id={inputId("exclude-from-split")}
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                          className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary focus:ring-offset-noir-primary"
                        />
                        <label
                          htmlFor={inputId("exclude-from-split")}
                          className="text-sm text-body flex items-center gap-1 cursor-pointer hover:text-heading transition-colors"
                        >
                          <UserX size={14} /> Não entra na divisão?
                        </label>
                      </>
                    )}
                  </form.Field>
                </div>
              )}

              {/* Credit Card (expenses only) */}
              {!isIncome && (
                <div className="flex items-center gap-2">
                  <form.Field name="isCreditCard">
                    {(field: FieldState<boolean>) => (
                      <>
                        <input
                          type="checkbox"
                          id={inputId("credit-card")}
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                          className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary focus:ring-offset-noir-primary"
                        />
                        <label
                          htmlFor={inputId("credit-card")}
                          className="text-sm text-body flex items-center gap-1 cursor-pointer hover:text-heading transition-colors"
                          title="Se marcado, o lançamento entra no mês seguinte"
                        >
                          <CreditCard size={14} /> Próxima Fatura
                        </label>
                      </>
                    )}
                  </form.Field>
                </div>
              )}

              {/* Forecast */}
              <div className="flex items-center gap-2">
                <form.Field name="isForecast">
                  {(field: FieldState<boolean>) => (
                    <>
                      <input
                        type="checkbox"
                        id={inputId("forecast")}
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                        className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary focus:ring-offset-noir-primary"
                      />
                      <label
                        htmlFor={inputId("forecast")}
                        className="text-sm text-body flex items-center gap-1 cursor-pointer hover:text-heading transition-colors"
                        title="Pode ser considerada na conta no resumo"
                      >
                        <CrystalBallLine size={14} /> Previsão?
                      </label>
                    </>
                  )}
                </form.Field>
              </div>

              {/* Installment Count */}
              {!isIncome && showInstallmentFields && values.isInstallment && (
                <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                  <span className="text-sm text-muted">x</span>
                  <form.Field name="installments">
                    {(field: FieldState<number>) => (
                      <input
                        type="number"
                        min={2}
                        max={60}
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number.parseInt(e.target.value, 10) || 2)
                        }
                        className="noir-input w-16 text-sm py-1 text-center"
                      />
                    )}
                  </form.Field>
                  <span className="text-xs text-muted">parcelas</span>
                </div>
              )}
            </div>

            {/* Additional Information (collapsible) */}
            <details className="lg:col-span-4 rounded-card border border-noir-border bg-noir-active/50 group">
              <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-heading hover:bg-noir-active transition-colors rounded-card">
                Informações adicionais
                <span className="ml-2 text-xs font-normal text-muted">(Data, Atribuído à)</span>
              </summary>
              <div className="px-4 pb-4 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-noir-border">
                {/* Month/Date Selector */}
                <div>
                  <label
                    htmlFor={inputId("month-selector")}
                    className="block text-xs font-medium text-body mb-1"
                  >
                    Mês {showInstallmentFields && "(Opcional)"}
                  </label>
                  <select
                    id={inputId("month-selector")}
                    className="noir-select w-full"
                    value={
                      values.dateSelectionMode === "specific"
                        ? "specific"
                        : values.selectedMonth || currentYearMonth
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
                  {values.dateSelectionMode === "specific" && (
                    <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
                      <form.Field name="date">
                        {(field: FieldState<string>) => (
                          <input
                            id={inputId("date")}
                            type="date"
                            className="noir-input w-full"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        )}
                      </form.Field>
                    </div>
                  )}
                </div>

                {/* Person Selector */}
                <div>
                  <form.Field name="paidBy">
                    {(field: FieldState<string>) => (
                      <>
                        <label
                          htmlFor={inputId("paid-by")}
                          className="block text-xs font-medium text-body mb-1"
                        >
                          Atribuir à
                        </label>
                        <select
                          id={inputId("paid-by")}
                          className="noir-select w-full"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        >
                          {people.map((person) => (
                            <option key={person.id} value={person.id}>
                              {person.name}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                  </form.Field>
                </div>
              </div>
            </details>
          </>
        );
      }}
    </form.Subscribe>
  );
}
