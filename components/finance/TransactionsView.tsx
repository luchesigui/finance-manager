"use client";

import {
  BrainCircuit,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UserX,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { MonthNavigator } from "@/components/finance/MonthNavigator";
import { TransactionFormFields } from "@/components/finance/TransactionFormFields";
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
    updateTransactionById,
  } = useTransactions();

  const [aiLoading, setAiLoading] = useState(false);
  const [smartInput, setSmartInput] = useState("");
  const [paidByFilter, setPaidByFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Edit modal state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editFormState, setEditFormState] = useState<NewTransactionFormState>({
    description: "",
    amount: null,
    categoryId: "",
    paidBy: "",
    isRecurring: false,
    isCreditCard: false,
    date: "",
    isInstallment: false,
    installments: 2,
    excludeFromSplit: false,
  });

  const [newTrans, setNewTrans] = useState<NewTransactionFormState>({
    description: "",
    amount: null,
    categoryId: categories[0]?.id ?? "c1",
    paidBy: defaultPayerId,
    isRecurring: false,
    isCreditCard: false,
    date: "",
    isInstallment: false,
    installments: 2,
    excludeFromSplit: false,
  });

  useEffect(() => {
    setNewTrans((prev) => ({ ...prev, paidBy: defaultPayerId }));
  }, [defaultPayerId]);

  useEffect(() => {
    if (paidByFilter === "all") return;
    const stillExists = people.some((person) => person.id === paidByFilter);
    if (!stillExists) setPaidByFilter("all");
  }, [paidByFilter, people]);

  useEffect(() => {
    if (categoryFilter === "all") return;
    const stillExists = categories.some((category) => category.id === categoryFilter);
    if (!stillExists) setCategoryFilter("all");
  }, [categoryFilter, categories]);

  const visibleTransactionsForSelectedMonth = useMemo(() => {
    return transactionsForSelectedMonth.filter((transaction) => {
      if (paidByFilter !== "all" && transaction.paidBy !== paidByFilter) return false;
      if (categoryFilter !== "all" && transaction.categoryId !== categoryFilter) return false;
      return true;
    });
  }, [categoryFilter, paidByFilter, transactionsForSelectedMonth]);

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
      isCreditCard: false,
      date: "",
      isInstallment: false,
      installments: 2,
      excludeFromSplit: false,
    });

    setSmartInput("");
  };

  const handleOpenEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditFormState({
      description: transaction.description,
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      paidBy: transaction.paidBy,
      isRecurring: transaction.isRecurring,
      isCreditCard: transaction.isCreditCard,
      date: transaction.date,
      isInstallment: false,
      installments: 2,
      excludeFromSplit: transaction.excludeFromSplit,
    });
  };

  const handleCloseEditModal = () => {
    setEditingTransaction(null);
  };

  const handleSaveEdit = () => {
    if (!editingTransaction) return;
    if (!editFormState.description || editFormState.amount == null) return;

    updateTransactionById(editingTransaction.id, {
      description: editFormState.description,
      amount: editFormState.amount,
      categoryId: editFormState.categoryId,
      paidBy: editFormState.paidBy,
      isRecurring: editFormState.isRecurring,
      isCreditCard: editFormState.isCreditCard,
      excludeFromSplit: editFormState.excludeFromSplit,
      date: editFormState.date,
    });

    setEditingTransaction(null);
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
          <TransactionFormFields
            formState={newTrans}
            setFormState={setNewTrans}
            showInstallmentFields={true}
            showDescription={true}
            idPrefix="new-transaction"
          />

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
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-700">
            Histórico de {formatMonthYear(selectedMonthDate)}
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="paid-by-filter" className="text-xs font-medium text-slate-600">
                Pago por
              </label>
              <select
                id="paid-by-filter"
                className="border border-slate-300 rounded-lg px-2 py-1 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={paidByFilter}
                onChange={(e) => setPaidByFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="category-filter" className="text-xs font-medium text-slate-600">
                Categoria
              </label>
              <select
                id="category-filter"
                className="border border-slate-300 rounded-lg px-2 py-1 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full w-fit">
              {visibleTransactionsForSelectedMonth.length} itens
            </span>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {visibleTransactionsForSelectedMonth.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Nenhum lançamento neste mês
              {paidByFilter === "all" && categoryFilter === "all"
                ? ""
                : paidByFilter !== "all" && categoryFilter !== "all"
                  ? " para este pagador e categoria"
                  : paidByFilter !== "all"
                    ? " para este pagador"
                    : " para esta categoria"}
              .
            </div>
          ) : (
            visibleTransactionsForSelectedMonth.map((transaction) => {
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
                        {transaction.isCreditCard && (
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                            Cartão
                          </span>
                        )}
                        {transaction.excludeFromSplit && (
                          <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                            <UserX size={10} /> Fora da divisão
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
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">
                      {formatCurrency(transaction.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(transaction)}
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

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Pencil className="text-indigo-600" size={20} />
                Editar Lançamento
              </h3>
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label
                  htmlFor="edit-description"
                  className="block text-xs font-medium text-slate-500 mb-1"
                >
                  Descrição
                </label>
                <input
                  id="edit-description"
                  type="text"
                  placeholder="Ex: Luz, Mercado, iFood..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={editFormState.description}
                  onChange={(e) =>
                    setEditFormState({ ...editFormState, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <TransactionFormFields
                  formState={editFormState}
                  setFormState={setEditFormState}
                  showInstallmentFields={false}
                  showDescription={false}
                  idPrefix="edit-transaction"
                />
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Pencil size={18} />
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
