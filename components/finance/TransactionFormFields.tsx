"use client";

import { CreditCard, Layers, MinusCircle, PlusCircle, RefreshCw, TrendingDown, TrendingUp, UserX } from "lucide-react";

import { useCategories } from "@/components/finance/contexts/CategoriesContext";
import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import type { NewTransactionFormState } from "@/lib/types";

type TransactionFormFieldsProps = {
  formState: NewTransactionFormState;
  setFormState: React.Dispatch<React.SetStateAction<NewTransactionFormState>>;
  /**
   * If true, shows installment-related fields (for new transaction form).
   * If false, hides installment fields (for editing).
   */
  showInstallmentFields?: boolean;
  /**
   * If true, shows description field.
   */
  showDescription?: boolean;
  /**
   * Prefix for input IDs to avoid conflicts when multiple forms are on the page.
   */
  idPrefix?: string;
};

export function TransactionFormFields({
  formState,
  setFormState,
  showInstallmentFields = true,
  showDescription = true,
  idPrefix = "",
}: TransactionFormFieldsProps) {
  const { categories } = useCategories();
  const { people } = usePeople();

  const inputId = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);

  const isIncome = formState.type === "income";

  return (
    <>
      {/* Transaction Type Selector */}
      <div className="lg:col-span-4">
        <label className="block text-xs font-medium text-slate-500 mb-2">Tipo de Lançamento</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormState({ ...formState, type: "expense", isIncrement: true })}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
              !isIncome
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <MinusCircle size={18} />
            <span className="font-medium">Despesa</span>
          </button>
          <button
            type="button"
            onClick={() => setFormState({ ...formState, type: "income", isIncrement: true })}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
              isIncome
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <PlusCircle size={18} />
            <span className="font-medium">Renda</span>
          </button>
        </div>
      </div>

      {/* Income Increment/Decrement Selector - Only show for income type */}
      {isIncome && (
        <div className="lg:col-span-4 animate-in slide-in-from-top-2 duration-200">
          <label className="block text-xs font-medium text-slate-500 mb-2">Tipo de Renda</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormState({ ...formState, isIncrement: true })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                formState.isIncrement
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <TrendingUp size={16} />
              <span className="text-sm font-medium">Incremento</span>
              <span className="text-xs text-slate-500">(Salário, Bônus)</span>
            </button>
            <button
              type="button"
              onClick={() => setFormState({ ...formState, isIncrement: false })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                !formState.isIncrement
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <TrendingDown size={16} />
              <span className="text-sm font-medium">Decremento</span>
              <span className="text-xs text-slate-500">(Dedução, Estorno)</span>
            </button>
          </div>
        </div>
      )}

      {showDescription && (
        <div className="lg:col-span-2">
          <label
            htmlFor={inputId("description")}
            className="block text-xs font-medium text-slate-500 mb-1"
          >
            Descrição
          </label>
          <input
            id={inputId("description")}
            type="text"
            placeholder={isIncome ? "Ex: Salário, Freelance, Bônus..." : "Ex: Luz, Mercado, iFood..."}
            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={formState.description}
            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
            required
          />
        </div>
      )}

      <div className="lg:col-span-2">
        <label
          htmlFor={inputId("amount")}
          className="block text-xs font-medium text-slate-500 mb-1"
        >
          Valor (R$)
        </label>
        <CurrencyInput
          id={inputId("amount")}
          placeholder="R$ 0,00"
          className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          value={formState.amount}
          onValueChange={(amountValue) => setFormState({ ...formState, amount: amountValue })}
          required
        />
      </div>

      <div className="lg:col-span-2">
        <label
          htmlFor={inputId("category")}
          className="block text-xs font-medium text-slate-500 mb-1"
        >
          Categoria
        </label>
        <select
          id={inputId("category")}
          className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          value={formState.categoryId}
          onChange={(e) => setFormState({ ...formState, categoryId: e.target.value })}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="lg:col-span-4 flex flex-wrap items-center gap-6 pb-2">
        {/* Recurring checkbox - available for both expense and income */}
        {showInstallmentFields && !formState.isInstallment && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={inputId("recurring")}
              checked={formState.isRecurring}
              onChange={(e) => setFormState({ ...formState, isRecurring: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label
              htmlFor={inputId("recurring")}
              className="text-sm text-slate-600 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={14} /> Recorrente?
            </label>
          </div>
        )}

        {!showInstallmentFields && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={inputId("recurring")}
              checked={formState.isRecurring}
              onChange={(e) => setFormState({ ...formState, isRecurring: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label
              htmlFor={inputId("recurring")}
              className="text-sm text-slate-600 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={14} /> Recorrente?
            </label>
          </div>
        )}

        {/* Installment checkbox - only for expenses */}
        {!isIncome && showInstallmentFields && !formState.isRecurring && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={inputId("installment")}
              checked={formState.isInstallment}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  isInstallment: e.target.checked,
                })
              }
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label
              htmlFor={inputId("installment")}
              className="text-sm text-slate-600 flex items-center gap-1 cursor-pointer"
            >
              <Layers size={14} /> Parcelado?
            </label>
          </div>
        )}

        {/* Exclude from split - only for expenses */}
        {!isIncome && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={inputId("exclude-from-split")}
              checked={formState.excludeFromSplit}
              onChange={(e) => setFormState({ ...formState, excludeFromSplit: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label
              htmlFor={inputId("exclude-from-split")}
              className="text-sm text-slate-600 flex items-center gap-1 cursor-pointer"
            >
              <UserX size={14} /> Não entra na divisão?
            </label>
          </div>
        )}

        {/* Credit card - only for expenses */}
        {!isIncome && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={inputId("credit-card")}
              checked={formState.isCreditCard}
              onChange={(e) => setFormState({ ...formState, isCreditCard: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label
              htmlFor={inputId("credit-card")}
              className="text-sm text-slate-600 flex items-center gap-1 cursor-pointer"
              title="Se marcado, o lançamento entra no mês seguinte"
            >
              <CreditCard size={14} /> Cartão de Crédito
            </label>
          </div>
        )}

        {/* Installment count - only for expenses */}
        {!isIncome && showInstallmentFields && formState.isInstallment && (
          <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
            <span className="text-sm text-slate-500">x</span>
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
              className="w-16 border border-slate-300 rounded px-2 py-1 text-sm"
            />
            <span className="text-xs text-slate-400">parcelas</span>
          </div>
        )}
      </div>

      <details className="lg:col-span-4 rounded-lg border border-slate-200 bg-slate-50">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-slate-700">
          Informações adicionais
          <span className="ml-2 text-xs font-normal text-slate-500">(Data, Pago por)</span>
        </summary>
        <div className="px-4 pb-4 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={inputId("date")}
              className="block text-xs font-medium text-slate-500 mb-1"
            >
              Data {showInstallmentFields && "(Opcional)"}
            </label>
            <input
              id={inputId("date")}
              type="date"
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-600 bg-white"
              value={formState.date}
              onChange={(e) => setFormState({ ...formState, date: e.target.value })}
            />
          </div>

          <div>
            <label
              htmlFor={inputId("paid-by")}
              className="block text-xs font-medium text-slate-500 mb-1"
            >
              Pago por
            </label>
            <select
              id={inputId("paid-by")}
              className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
