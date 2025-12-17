"use client";

import { BrainCircuit, Layers, Loader2, Pencil, Plus, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { MonthNavigator } from "@/components/finance/MonthNavigator";
import { useCategories } from "@/components/finance/contexts/CategoriesContext";
import { useCurrentMonth } from "@/components/finance/contexts/CurrentMonthContext";
import { useDefaultPayer } from "@/components/finance/contexts/DefaultPayerContext";
import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { useTransactions } from "@/components/finance/contexts/TransactionsContext";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { isSmartFillEnabled } from "@/lib/featureFlags";
import { formatCurrency, formatDateString, formatMonthYear } from "@/lib/format";
import { generateGeminiContent } from "@/lib/geminiClient";
import type { NewTransactionFormState, Transaction } from "@/lib/types";

export function TransactionsView() {
  const { selectedMonthDate } = useCurrentMonth();
  const { people } = usePeople();
  const { categories } = useCategories();
  const { defaultPayerId } = useDefaultPayer();
  const {
    transactionsForSelectedMonth,
    addTransactionsFromFormState,
    deleteTransactionById,
    updateTransaction,
  } = useTransactions();

  const [aiLoading, setAiLoading] = useState(false);
  const [smartInput, setSmartInput] = useState("");

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [editScope, setEditScope] = useState<"single" | "all" | "future">("single");

  const [newTrans, setNewTrans] = useState<NewTransactionFormState>({
    description: "",
    amount: null,
    categoryId: categories[0]?.id ?? "c1",
    paidBy: defaultPayerId,
    isRecurring: false,
    date: "",
    isInstallment: false,
    installments: 2,
  });

  useEffect(() => {
    setNewTrans((prev) => ({ ...prev, paidBy: defaultPayerId }));
  }, [defaultPayerId]);

  useEffect(() => {
    setNewTrans((prev) => ({
      ...prev,
      categoryId: categories[0]?.id ?? prev.categoryId,
    }));
  }, [categories]);

  const handleAddTransaction = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    addTransactionsFromFormState(newTrans);

    setNewTrans({
      description: "",
      amount: null,
      categoryId: categories[0]?.id ?? "c1",
      paidBy: defaultPayerId,
      isRecurring: false,
      date: "",
      isInstallment: false,
      installments: 2,
    });

    setSmartInput("");
  };

  const handleSmartFill = async () => {
    if (!smartInput.trim()) return;
    setAiLoading(true);

    const categoriesPrompt = categories
      .map((category) => `${category.id}:${category.name}`)
      .join(", ");
    const peoplePrompt = people.map((person) => `${person.id}:${person.name}`).join(", ");
    const todayStr = new Date().toISOString().split("T")[0];

    const prompt = `
Analise o seguinte texto de despesa: "${smartInput}".
Data de hoje: ${todayStr}.

Extraia os dados para JSON com as chaves:
- description (string)
- amount (number)
- categoryId (string, escolha o ID mais adequado de: ${categoriesPrompt})
- paidBy (string, escolha o ID mais adequado de: ${peoplePrompt}. Se não mencionado, use null)
- date (string, formato YYYY-MM-DD. Se "hoje", use ${todayStr}. Se "ontem", calcule.)

Retorne APENAS o JSON, sem markdown.
`;

    try {
      const result = await generateGeminiContent(prompt);
      if (result) {
        const cleanJson = result
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const data = JSON.parse(cleanJson) as {
          description?: string;
          amount?: number;
          categoryId?: string;
          paidBy?: string | null;
          date?: string;
        };

        setNewTrans((prev) => ({
          ...prev,
          description: data.description ?? prev.description,
          amount: data.amount ?? prev.amount,
          categoryId: data.categoryId ?? prev.categoryId,
          paidBy: data.paidBy ?? defaultPayerId,
          date: data.date ?? prev.date,
        }));
      }
    } catch (error) {
      console.error("Erro parsing AI JSON", error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleEditClick = (t: Transaction) => {
    setEditingTransaction(t);
    setEditForm({
      description: t.description,
      amount: t.amount,
      categoryId: t.categoryId,
      paidBy: t.paidBy,
      date: t.date,
      isRecurring: t.isRecurring,
    });
    setEditScope("single");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    updateTransaction(editingTransaction.id, editForm, editScope);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <MonthNavigator />

      <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 relative overflow-hidden">
        {isSmartFillEnabled && (
          <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <label
              htmlFor="smart-input"
              className="text-xs font-bold text-indigo-600 flex items-center gap-1 mb-2"
            >
              <Sparkles size={14} />
              PREENCHIMENTO INTELIGENTE (BETA)
            </label>
            <div className="flex gap-2">
              <input
                id="smart-input"
                type="text"
                value={smartInput}
                onChange={(event) => setSmartInput(event.target.value)}
                placeholder="Ex: Almoço com Amanda hoje custou 45 reais"
                className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                onKeyDown={(event) => event.key === "Enter" && handleSmartFill()}
              />
              <button
                type="button"
                onClick={handleSmartFill}
                disabled={aiLoading || !smartInput}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {aiLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <BrainCircuit size={18} />
                )}
              </button>
            </div>
          </div>
        )}

        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Plus className="bg-indigo-600 text-white rounded-full p-1" size={24} />
          Nova Despesa Manual
        </h3>

        <form
          onSubmit={handleAddTransaction}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        >
          <div className="lg:col-span-2">
            <label
              htmlFor="transaction-description"
              className="block text-xs font-medium text-slate-500 mb-1"
            >
              Descrição
            </label>
            <input
              id="transaction-description"
              type="text"
              placeholder="Ex: Luz, Mercado, iFood..."
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={newTrans.description}
              onChange={(e) => setNewTrans({ ...newTrans, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label
              htmlFor="transaction-amount"
              className="block text-xs font-medium text-slate-500 mb-1"
            >
              Valor (R$)
            </label>
            <CurrencyInput
              id="transaction-amount"
              placeholder="R$ 0,00"
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={newTrans.amount}
              onValueChange={(amountValue) => setNewTrans({ ...newTrans, amount: amountValue })}
              required
            />
          </div>

          <div>
            <label
              htmlFor="transaction-category"
              className="block text-xs font-medium text-slate-500 mb-1"
            >
              Categoria
            </label>
            <select
              id="transaction-category"
              className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={newTrans.categoryId}
              onChange={(e) => setNewTrans({ ...newTrans, categoryId: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-4 flex flex-wrap items-center gap-6 pb-2">
            {!newTrans.isInstallment && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newTrans.isRecurring}
                  onChange={(e) => setNewTrans({ ...newTrans, isRecurring: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label
                  htmlFor="recurring"
                  className="text-sm text-slate-600 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={14} /> Recorrente?
                </label>
              </div>
            )}

            {!newTrans.isRecurring && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="installment"
                  checked={newTrans.isInstallment}
                  onChange={(e) =>
                    setNewTrans({
                      ...newTrans,
                      isInstallment: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label
                  htmlFor="installment"
                  className="text-sm text-slate-600 flex items-center gap-1 cursor-pointer"
                >
                  <Layers size={14} /> Parcelado?
                </label>
              </div>
            )}

            {newTrans.isInstallment && (
              <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                <span className="text-sm text-slate-500">x</span>
                <input
                  type="number"
                  min={2}
                  max={60}
                  value={newTrans.installments}
                  onChange={(e) =>
                    setNewTrans({
                      ...newTrans,
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
                  htmlFor="transaction-date"
                  className="block text-xs font-medium text-slate-500 mb-1"
                >
                  Data (Opcional)
                </label>
                <input
                  id="transaction-date"
                  type="date"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-600 bg-white"
                  value={newTrans.date}
                  onChange={(e) => setNewTrans({ ...newTrans, date: e.target.value })}
                />
              </div>

              <div>
                <label
                  htmlFor="transaction-paid-by"
                  className="block text-xs font-medium text-slate-500 mb-1"
                >
                  Pago por
                </label>
                <select
                  id="transaction-paid-by"
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={newTrans.paidBy}
                  onChange={(e) => setNewTrans({ ...newTrans, paidBy: e.target.value })}
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

          <div className="lg:col-span-4 mt-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {newTrans.isInstallment
                ? `Lançar ${newTrans.installments}x Parcelas`
                : "Adicionar Lançamento"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-700">
            Histórico de {formatMonthYear(selectedMonthDate)}
          </h2>
          <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
            {transactionsForSelectedMonth.length} itens
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {transactionsForSelectedMonth.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nenhum lançamento neste mês.</div>
          ) : (
            transactionsForSelectedMonth.map((transaction) => {
              const selectedCategory = categories.find(
                (category) => category.id === transaction.categoryId,
              );
              const selectedPerson = people.find((person) => person.id === transaction.paidBy);
              return (
                <div
                  key={transaction.id}
                  className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs bg-gray-400">
                      {(selectedPerson?.name.substring(0, 2) ?? "?").toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 flex items-center gap-2">
                        {transaction.description}
                        {transaction.isRecurring && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                            <RefreshCw size={10} /> Recorrente
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 flex gap-2">
                        <span>{selectedCategory?.name}</span>
                        <span>•</span>
                        <span>{formatDateString(transaction.date)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-700 mr-2">
                      {formatCurrency(transaction.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEditClick(transaction)}
                      className="text-slate-300 hover:text-indigo-500 p-2 transition-all"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    {!transaction.isRecurring ? (
                      <button
                        type="button"
                        onClick={() => deleteTransactionById(transaction.id)}
                        className="text-slate-300 hover:text-red-500 p-2 transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <div className="w-8" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {editingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-50 duration-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Editar Despesa</h3>
              <button
                type="button"
                onClick={() => setEditingTransaction(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-xs font-medium text-slate-500 mb-1"
                >
                  Descrição
                </label>
                <input
                  id="edit-description"
                  type="text"
                  value={editForm.description ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-amount"
                    className="block text-xs font-medium text-slate-500 mb-1"
                  >
                    Valor
                  </label>
                  <CurrencyInput
                    id="edit-amount"
                    value={editForm.amount ?? null}
                    onValueChange={(val) => setEditForm({ ...editForm, amount: val ?? undefined })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-date"
                    className="block text-xs font-medium text-slate-500 mb-1"
                  >
                    Data
                  </label>
                  <input
                    id="edit-date"
                    type="date"
                    value={editForm.date ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-600 bg-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-category"
                    className="block text-xs font-medium text-slate-500 mb-1"
                  >
                    Categoria
                  </label>
                  <select
                    id="edit-category"
                    value={editForm.categoryId}
                    onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="edit-paid-by"
                    className="block text-xs font-medium text-slate-500 mb-1"
                  >
                    Pago por
                  </label>
                  <select
                    id="edit-paid-by"
                    value={editForm.paidBy}
                    onChange={(e) => setEditForm({ ...editForm, paidBy: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(editingTransaction.recurringId || editingTransaction.isRecurring) && (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <label className="block text-xs font-bold text-indigo-700 mb-2">
                    Esta é uma despesa recorrente/parcelada. Aplicar alterações para:
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scope"
                        value="single"
                        checked={editScope === "single"}
                        onChange={() => setEditScope("single")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">Apenas esta despesa</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scope"
                        value="all"
                        checked={editScope === "all"}
                        onChange={() => setEditScope("all")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">Todas as ocorrências</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scope"
                        value="future"
                        checked={editScope === "future"}
                        onChange={() => setEditScope("future")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">Esta e as futuras</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
