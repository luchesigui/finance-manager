"use client";

import { CreditCard, Layers, RefreshCw, UserX } from "lucide-react";

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

  return (
    <>
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
            placeholder="Ex: Luz, Mercado, iFood..."
            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={formState.description}
            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
            required
          />
        </div>
      )}

      <div>
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

      <div>
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

        {showInstallmentFields && !formState.isRecurring && (
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

        {showInstallmentFields && formState.isInstallment && (
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

      <details
        className="lg:col-span-4 rounded-lg border border-slate-200 bg-slate-50"
        open={!showInstallmentFields}
      >
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
