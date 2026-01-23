"use client";

import {
  BrainCircuit,
  Check,
  CreditCard,
  Filter,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MonthNavigator } from "@/components/finance/MonthNavigator";
import { TransactionFormFields } from "@/components/finance/TransactionFormFields";
import { useCategories } from "@/components/finance/contexts/CategoriesContext";
import { useCurrentMonth } from "@/components/finance/contexts/CurrentMonthContext";
import { useDefaultPayer } from "@/components/finance/contexts/DefaultPayerContext";
import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { useTransactions } from "@/components/finance/contexts/TransactionsContext";
import { CrystalBallLine } from "@/components/ui/CrystalBallLine";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { isSmartFillEnabled } from "@/lib/featureFlags";
import { formatCurrency, formatDateString, formatMonthYear } from "@/lib/format";
import { generateGeminiContent } from "@/lib/geminiClient";
import type { NewTransactionFormState, Transaction } from "@/lib/types";

// Fuzzy search function - checks if query characters appear in sequence
const fuzzyMatch = (text: string, query: string): boolean => {
  if (!query) return true;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let queryIndex = 0;
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === lowerQuery.length;
};

export function TransactionsView() {
  const { selectedMonthDate } = useCurrentMonth();
  const { people } = usePeople();
  const { categories } = useCategories();
  const { defaultPayerId } = useDefaultPayer();
  const {
    transactionsForSelectedMonth,
    transactionsForCalculations,
    addTransactionsFromFormState,
    deleteTransactionById,
    updateTransactionById,
    bulkUpdateTransactions,
    bulkDeleteTransactions,
  } = useTransactions();

  const [aiLoading, setAiLoading] = useState(false);
  const [smartInput, setSmartInput] = useState("");
  const [paidByFilter, setPaidByFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Bulk edit modal state
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkEditFormState, setBulkEditFormState] = useState<{
    categoryId: string | null;
    paidBy: string | null;
    isRecurring: boolean | null;
    isCreditCard: boolean | null;
    excludeFromSplit: boolean | null;
  }>({
    categoryId: null,
    paidBy: null,
    isRecurring: null,
    isCreditCard: null,
    excludeFromSplit: null,
  });

  // Helper to get current month string (YYYY-MM)
  const getCurrentYearMonth = () => {
    const year = selectedMonthDate.getFullYear();
    const month = String(selectedMonthDate.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  // Edit modal state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editFormState, setEditFormState] = useState<NewTransactionFormState>({
    description: "",
    amount: null,
    categoryId: "",
    paidBy: "",
    isRecurring: false,
    isCreditCard: false,
    dateSelectionMode: "month",
    selectedMonth: getCurrentYearMonth(),
    date: "",
    isInstallment: false,
    installments: 2,
    excludeFromSplit: false,
    isForecast: false,
    type: "expense",
    isIncrement: true,
  });

  const [newTrans, setNewTrans] = useState<NewTransactionFormState>({
    description: "",
    amount: null,
    categoryId: categories[0]?.id ?? "c1",
    paidBy: defaultPayerId,
    isRecurring: false,
    isCreditCard: false,
    dateSelectionMode: "month",
    selectedMonth: getCurrentYearMonth(),
    date: "",
    isInstallment: false,
    installments: 2,
    excludeFromSplit: false,
    isForecast: false,
    type: "expense",
    isIncrement: true,
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

  const matchesFilters = useCallback(
    (transaction: Transaction) => {
      if (paidByFilter !== "all" && transaction.paidBy !== paidByFilter) return false;
      if (typeFilter !== "all" && transaction.type !== typeFilter) return false;
      // Income transactions have no category, so they pass category filter if "all" or if specifically showing income
      if (categoryFilter !== "all") {
        if (transaction.categoryId === null) return false; // Income transactions don't match specific category filter
        if (transaction.categoryId !== categoryFilter) return false;
      }

      // Fuzzy search filter
      if (searchQuery.trim()) {
        const category = categories.find((cat) => cat.id === transaction.categoryId);
        const person = people.find((pers) => pers.id === transaction.paidBy);
        const searchableText = [
          transaction.description,
          category?.name ?? "",
          person?.name ?? "",
          transaction.date,
        ].join(" ");
        if (!fuzzyMatch(searchableText, searchQuery)) return false;
      }

      return true;
    },
    [paidByFilter, typeFilter, categoryFilter, searchQuery, categories, people],
  );

  const visibleTransactionsForSelectedMonth = useMemo(
    () => transactionsForSelectedMonth.filter(matchesFilters),
    [transactionsForSelectedMonth, matchesFilters],
  );
  const visibleTransactionsForCalculations = useMemo(
    () => transactionsForCalculations.filter(matchesFilters),
    [transactionsForCalculations, matchesFilters],
  );

  const visibleCalculationIds = useMemo(
    () => new Set(visibleTransactionsForCalculations.map((transaction) => transaction.id)),
    [visibleTransactionsForCalculations],
  );
  const visibleExcludedForecastCount = useMemo(
    () =>
      visibleTransactionsForSelectedMonth.filter(
        (transaction) => transaction.isForecast && !visibleCalculationIds.has(transaction.id),
      ).length,
    [visibleTransactionsForSelectedMonth, visibleCalculationIds],
  );

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
      dateSelectionMode: "month",
      selectedMonth: getCurrentYearMonth(),
      date: "",
      isInstallment: false,
      installments: 2,
      excludeFromSplit: false,
      isForecast: false,
      type: "expense",
      isIncrement: true,
    });

    setSmartInput("");
  };

  const handleOpenEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);

    // Determine if the transaction date is the 1st of a month (month mode) or a specific date
    const dateParts = transaction.date.split("-");
    const day = dateParts[2] ? Number.parseInt(dateParts[2], 10) : 1;
    const isFirstOfMonth = day === 1;
    const selectedMonth =
      dateParts[0] && dateParts[1] ? `${dateParts[0]}-${dateParts[1]}` : getCurrentYearMonth();

    setEditFormState({
      description: transaction.description,
      amount: transaction.amount,
      categoryId: transaction.categoryId ?? categories[0]?.id ?? "",
      paidBy: transaction.paidBy,
      isRecurring: transaction.isRecurring,
      isCreditCard: transaction.isCreditCard,
      dateSelectionMode: isFirstOfMonth ? "month" : "specific",
      selectedMonth: selectedMonth,
      date: transaction.date,
      isInstallment: false,
      installments: 2,
      excludeFromSplit: transaction.excludeFromSplit,
      isForecast: transaction.isForecast,
      type: transaction.type ?? "expense",
      isIncrement: transaction.isIncrement ?? true,
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
      isForecast: editFormState.isForecast,
      date: editFormState.date,
      type: editFormState.type,
      isIncrement: editFormState.isIncrement,
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

        setNewTrans((prev) => {
          // If AI returned a date, determine if it's a specific date or first of month
          let dateSelectionMode: "month" | "specific" = prev.dateSelectionMode;
          let selectedMonth = prev.selectedMonth;
          let dateValue = prev.date;

          if (data.date) {
            const dateParts = data.date.split("-");
            const day = dateParts[2] ? Number.parseInt(dateParts[2], 10) : 1;
            dateSelectionMode = day === 1 ? "month" : "specific";
            selectedMonth =
              dateParts[0] && dateParts[1] ? `${dateParts[0]}-${dateParts[1]}` : prev.selectedMonth;
            dateValue = data.date;
          }

          return {
            ...prev,
            description: data.description ?? prev.description,
            amount: data.amount ?? prev.amount,
            categoryId: data.categoryId ?? prev.categoryId,
            paidBy: data.paidBy ?? defaultPayerId,
            dateSelectionMode,
            selectedMonth,
            date: dateValue,
          };
        });
      }
    } catch (error) {
      console.error("Erro parsing AI JSON", error);
    } finally {
      setAiLoading(false);
    }
  };

  // Selection mode handlers
  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
    setIsSelectionMode(!isSelectionMode);
  };

  const toggleTransactionSelection = (transactionId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(transactionId)) {
        next.delete(transactionId);
      } else {
        next.add(transactionId);
      }
      return next;
    });
  };

  const selectAllVisibleTransactions = () => {
    const nonRecurringIds = visibleTransactionsForSelectedMonth
      .filter((transaction) => !transaction.isRecurring)
      .map((transaction) => transaction.id);
    setSelectedIds(new Set(nonRecurringIds));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleOpenBulkEditModal = () => {
    if (selectedIds.size === 0) return;
    setBulkEditFormState({
      categoryId: null,
      paidBy: null,
      isRecurring: null,
      isCreditCard: null,
      excludeFromSplit: null,
    });
    setIsBulkEditModalOpen(true);
  };

  const handleCloseBulkEditModal = () => {
    setIsBulkEditModalOpen(false);
  };

  const handleSaveBulkEdit = () => {
    if (selectedIds.size === 0) return;

    const patch: Record<string, unknown> = {};
    if (bulkEditFormState.categoryId !== null) patch.categoryId = bulkEditFormState.categoryId;
    if (bulkEditFormState.paidBy !== null) patch.paidBy = bulkEditFormState.paidBy;
    if (bulkEditFormState.isRecurring !== null) patch.isRecurring = bulkEditFormState.isRecurring;
    if (bulkEditFormState.isCreditCard !== null)
      patch.isCreditCard = bulkEditFormState.isCreditCard;
    if (bulkEditFormState.excludeFromSplit !== null)
      patch.excludeFromSplit = bulkEditFormState.excludeFromSplit;

    if (Object.keys(patch).length === 0) {
      setIsBulkEditModalOpen(false);
      return;
    }

    bulkUpdateTransactions(
      Array.from(selectedIds),
      patch as Parameters<typeof bulkUpdateTransactions>[1],
    );
    setIsBulkEditModalOpen(false);
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Excluir ${selectedIds.size} lançamento(s) selecionado(s)?`)) return;

    bulkDeleteTransactions(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <MonthNavigator />

      <div className="noir-card p-card-padding relative overflow-hidden border-accent-primary/30">
        <div className="absolute inset-0 bg-accent-primary/5" />
        <div className="relative">
          {isSmartFillEnabled && (
            <div className="mb-6 p-4 rounded-card bg-noir-active border border-noir-border">
              <label
                htmlFor="smart-input"
                className="text-xs font-bold text-accent-primary flex items-center gap-1.5 mb-2"
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
                  className="noir-input flex-1 text-sm"
                  onKeyDown={(event) => event.key === "Enter" && handleSmartFill()}
                />
                <button
                  type="button"
                  onClick={handleSmartFill}
                  disabled={aiLoading || !smartInput}
                  className="noir-btn-primary"
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

          <h3 className="font-semibold text-heading mb-4 flex items-center gap-2">
            <Plus
              className={`${newTrans.type === "income" ? "bg-accent-positive" : "bg-accent-primary"} text-white rounded-interactive p-1`}
              size={24}
            />
            {newTrans.type === "income" ? "Novo Lançamento de Renda" : "Nova Despesa Manual"}
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
                className={`w-full font-semibold py-3 px-4 rounded-interactive transition-all duration-200 flex items-center justify-center gap-2 ${
                  newTrans.type === "income"
                    ? "bg-accent-positive text-white hover:shadow-glow-positive"
                    : "bg-accent-primary text-white hover:shadow-glow-accent"
                }`}
              >
                <Plus size={18} />
                {newTrans.type === "income"
                  ? newTrans.isIncrement
                    ? "Adicionar Renda"
                    : "Adicionar Dedução de Renda"
                  : newTrans.isInstallment
                    ? `Lançar ${newTrans.installments}x Parcelas`
                    : "Adicionar Lançamento"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="noir-card overflow-hidden">
        <div className="p-4 border-b border-noir-border bg-noir-active/50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-heading">
            Histórico de {formatMonthYear(selectedMonthDate)}
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="noir-badge-muted w-fit">
              {visibleTransactionsForSelectedMonth.length} itens
            </span>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-1.5 rounded-interactive transition-all duration-200 ${
                isFilterOpen
                  ? "bg-accent-primary text-white shadow-glow-accent"
                  : "bg-noir-active text-body hover:text-heading hover:bg-noir-surface"
              }`}
              title="Filtrar lançamentos"
            >
              <Filter size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-1.5 rounded-interactive transition-all duration-200 ${
                isSearchOpen
                  ? "bg-accent-primary text-white shadow-glow-accent"
                  : "bg-noir-active text-body hover:text-heading hover:bg-noir-surface"
              }`}
              title="Buscar lançamentos"
            >
              <Search size={16} />
            </button>
            <button
              type="button"
              onClick={toggleSelectionMode}
              className={`text-xs px-3 py-1.5 rounded-interactive font-medium transition-all duration-200 ${
                isSelectionMode
                  ? "bg-accent-primary text-white shadow-glow-accent"
                  : "bg-noir-active text-body hover:text-heading hover:bg-noir-surface"
              }`}
            >
              {isSelectionMode ? "Cancelar Seleção" : "Selecionar"}
            </button>
          </div>
        </div>

        {/* Filter options */}
        {isFilterOpen && (
          <div className="p-3 border-b border-noir-border bg-noir-active/30 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-wrap items-center justify-end gap-3">
              {(typeFilter !== "all" || paidByFilter !== "all" || categoryFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter("all");
                    setPaidByFilter("all");
                    setCategoryFilter("all");
                  }}
                  className="text-xs text-accent-primary hover:text-blue-400 font-medium flex items-center gap-1"
                >
                  <X size={12} />
                  Limpar filtros
                </button>
              )}
              <div className="flex items-center gap-2">
                <label htmlFor="type-filter" className="text-xs font-medium text-body">
                  Tipo
                </label>
                <select
                  id="type-filter"
                  className="noir-select text-sm py-1"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="expense">Despesas</option>
                  <option value="income">Renda</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="paid-by-filter" className="text-xs font-medium text-body">
                  Atribuído à
                </label>
                <select
                  id="paid-by-filter"
                  className="noir-select text-sm py-1"
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
                <label htmlFor="category-filter" className="text-xs font-medium text-body">
                  Categoria
                </label>
                <select
                  id="category-filter"
                  className="noir-select text-sm py-1"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  disabled={typeFilter === "income"}
                >
                  <option value="all">Todas</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Search input */}
        {isSearchOpen && (
          <div className="p-3 border-b border-noir-border bg-noir-active/30 animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por descrição, categoria, pessoa..."
                className="noir-input w-full pl-9 pr-8 py-2 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bulk action bar */}
        {isSelectionMode && (
          <div className="p-3 border-b border-noir-border bg-accent-primary/10 flex flex-wrap items-center gap-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllVisibleTransactions}
                className="noir-btn-secondary text-xs px-2 py-1"
              >
                Selecionar Todos
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="noir-btn-secondary text-xs px-2 py-1"
              >
                Limpar
              </button>
            </div>
            <span className="text-xs text-accent-primary font-medium">
              {selectedIds.size} selecionado(s)
            </span>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenBulkEditModal}
                disabled={selectedIds.size === 0}
                className="noir-btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <Pencil size={12} />
                Editar em Massa
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0}
                className="noir-btn-danger text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <Trash2 size={12} />
                Excluir
              </button>
            </div>
          </div>
        )}
        <div className="divide-y divide-noir-border">
          {visibleTransactionsForSelectedMonth.length === 0 ? (
            <div className="p-8 text-center text-muted">
              {searchQuery.trim() ? (
                <>
                  Nenhum lançamento encontrado para &quot;{searchQuery}&quot;
                  {typeFilter !== "all" || paidByFilter !== "all" || categoryFilter !== "all"
                    ? " com os filtros selecionados"
                    : ""}
                  .
                </>
              ) : (
                <>
                  Nenhum lançamento neste mês
                  {typeFilter !== "all" &&
                    ` do tipo ${typeFilter === "income" ? "renda" : "despesa"}`}
                  {paidByFilter !== "all" && " para este pagador"}
                  {categoryFilter !== "all" && " nesta categoria"}.
                </>
              )}
            </div>
          ) : (
            visibleTransactionsForSelectedMonth.map((transaction) => {
              const selectedCategory = categories.find(
                (category) => category.id === transaction.categoryId,
              );
              const selectedPerson = people.find((person) => person.id === transaction.paidBy);
              const isSelected = selectedIds.has(transaction.id);
              const canSelect = !transaction.isRecurring;
              const isIncome = transaction.type === "income";
              const isIncrement = transaction.isIncrement ?? true;
              const isForecast = transaction.isForecast;

              return (
                <div
                  key={transaction.id}
                  className={`p-4 hover:bg-noir-active/30 transition-colors flex items-center justify-between group ${
                    isSelected ? "bg-accent-primary/10" : ""
                  } ${isIncome ? "border-l-2 border-l-accent-positive" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    {isSelectionMode && (
                      <button
                        type="button"
                        onClick={() => canSelect && toggleTransactionSelection(transaction.id)}
                        disabled={!canSelect}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? "bg-accent-primary border-accent-primary text-white"
                            : canSelect
                              ? "border-noir-border-light hover:border-accent-primary"
                              : "border-noir-border bg-noir-active cursor-not-allowed"
                        }`}
                        title={
                          !canSelect ? "Lançamentos recorrentes não podem ser selecionados" : ""
                        }
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </button>
                    )}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${
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
                        <span className="text-body">
                          {(selectedPerson?.name.substring(0, 2) ?? "?").toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-heading flex items-center gap-2 flex-wrap">
                        {transaction.description}
                        {isIncome && (
                          <span
                            className={`${isIncrement ? "noir-badge-positive" : "noir-badge-warning"} flex items-center gap-1`}
                          >
                            {isIncrement ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {isIncrement ? "Renda" : "Dedução"}
                          </span>
                        )}
                        {isForecast && (
                          <span className="noir-badge-warning flex items-center gap-1">
                            <CrystalBallLine size={10} /> Previsão
                          </span>
                        )}
                        {transaction.isRecurring && (
                          <span className="noir-badge-accent flex items-center gap-1">
                            <RefreshCw size={10} /> Recorrente
                          </span>
                        )}
                        {transaction.isCreditCard && (
                          <span className="noir-badge-accent flex items-center gap-1">
                            <CreditCard size={10} /> Cartão
                          </span>
                        )}
                        {transaction.excludeFromSplit && (
                          <span className="noir-badge-muted flex items-center gap-1">
                            <UserX size={10} /> Fora da divisão
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-muted flex gap-2">
                        {selectedCategory?.name && (
                          <>
                            <span>{selectedCategory.name}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{formatDateString(transaction.date)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold tabular-nums ${
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
                    {!isSelectionMode && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(transaction)}
                          className="text-muted hover:text-accent-primary p-2 transition-all rounded-interactive hover:bg-accent-primary/10"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        {!transaction.isRecurring ? (
                          <button
                            type="button"
                            onClick={() => deleteTransactionById(transaction.id)}
                            className="text-muted hover:text-accent-negative p-2 transition-all rounded-interactive hover:bg-accent-negative/10"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <div className="w-8" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Total row */}
        {visibleTransactionsForSelectedMonth.length > 0 && (
          <div className="p-4 border-t border-noir-border bg-noir-active/50 flex items-center justify-between">
            <span className="font-semibold text-heading">
              Total ({visibleTransactionsForCalculations.length} lançamento(s)
              {visibleExcludedForecastCount > 0
                ? ` + ${visibleExcludedForecastCount} previsão não considerada`
                : ""}
              )
            </span>
            <span className="font-bold text-lg text-heading tabular-nums">
              {formatCurrency(
                visibleTransactionsForCalculations.reduce((sum, t) => sum + t.amount, 0),
              )}
            </span>
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="noir-card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-noir-border flex items-center justify-between">
              <h3 className="font-semibold text-heading flex items-center gap-2">
                <Pencil className="text-accent-primary" size={20} />
                Editar Lançamento
              </h3>
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="text-muted hover:text-heading p-1 rounded-interactive hover:bg-noir-active transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label
                  htmlFor="edit-description"
                  className="block text-xs font-medium text-body mb-1"
                >
                  Descrição
                </label>
                <input
                  id="edit-description"
                  type="text"
                  placeholder="Ex: Luz, Mercado, iFood..."
                  className="noir-input w-full"
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
              <div className="flex gap-3 mt-6 pt-4 border-t border-noir-border">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="noir-btn-secondary flex-1 py-3"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="noir-btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  <Pencil size={18} />
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {isBulkEditModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="noir-card max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-noir-border flex items-center justify-between">
              <h3 className="font-semibold text-heading flex items-center gap-2">
                <Pencil className="text-accent-primary" size={20} />
                Editar em Massa
                <span className="noir-badge-muted">{selectedIds.size} lançamento(s)</span>
              </h3>
              <button
                type="button"
                onClick={handleCloseBulkEditModal}
                className="text-muted hover:text-heading p-1 rounded-interactive hover:bg-noir-active transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-body mb-4">
                Selecione os campos que deseja alterar. Apenas os campos selecionados serão
                atualizados em todos os lançamentos.
              </p>

              {/* Category */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    id="bulk-category-enable"
                    checked={bulkEditFormState.categoryId !== null}
                    onChange={(e) =>
                      setBulkEditFormState((prev) => ({
                        ...prev,
                        categoryId: e.target.checked ? (categories[0]?.id ?? "") : null,
                      }))
                    }
                    className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary"
                  />
                  <label
                    htmlFor="bulk-category-enable"
                    className="text-sm font-medium text-heading cursor-pointer"
                  >
                    Alterar Categoria
                  </label>
                </div>
                {bulkEditFormState.categoryId !== null && (
                  <select
                    id="bulk-category"
                    className="noir-select w-full animate-in slide-in-from-top-1 duration-200"
                    value={bulkEditFormState.categoryId}
                    onChange={(e) =>
                      setBulkEditFormState((prev) => ({ ...prev, categoryId: e.target.value }))
                    }
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Paid By */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    id="bulk-paidby-enable"
                    checked={bulkEditFormState.paidBy !== null}
                    onChange={(e) =>
                      setBulkEditFormState((prev) => ({
                        ...prev,
                        paidBy: e.target.checked ? (people[0]?.id ?? "") : null,
                      }))
                    }
                    className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary"
                  />
                  <label
                    htmlFor="bulk-paidby-enable"
                    className="text-sm font-medium text-heading cursor-pointer"
                  >
                    Alterar Pago por
                  </label>
                </div>
                {bulkEditFormState.paidBy !== null && (
                  <select
                    id="bulk-paidby"
                    className="noir-select w-full animate-in slide-in-from-top-1 duration-200"
                    value={bulkEditFormState.paidBy}
                    onChange={(e) =>
                      setBulkEditFormState((prev) => ({ ...prev, paidBy: e.target.value }))
                    }
                  >
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Boolean flags */}
              <div className="space-y-3 mb-4">
                {/* Is Recurring */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="bulk-recurring-enable"
                    checked={bulkEditFormState.isRecurring !== null}
                    onChange={(e) =>
                      setBulkEditFormState((prev) => ({
                        ...prev,
                        isRecurring: e.target.checked ? false : null,
                      }))
                    }
                    className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary"
                  />
                  <label
                    htmlFor="bulk-recurring-enable"
                    className="text-sm font-medium text-heading cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw size={14} /> Alterar Recorrente
                  </label>
                  {bulkEditFormState.isRecurring !== null && (
                    <select
                      className="noir-select ml-auto text-sm py-1 animate-in slide-in-from-left-1 duration-200"
                      value={bulkEditFormState.isRecurring ? "true" : "false"}
                      onChange={(e) =>
                        setBulkEditFormState((prev) => ({
                          ...prev,
                          isRecurring: e.target.value === "true",
                        }))
                      }
                    >
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  )}
                </div>

                {/* Is Credit Card */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="bulk-creditcard-enable"
                    checked={bulkEditFormState.isCreditCard !== null}
                    onChange={(e) =>
                      setBulkEditFormState((prev) => ({
                        ...prev,
                        isCreditCard: e.target.checked ? false : null,
                      }))
                    }
                    className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary"
                  />
                  <label
                    htmlFor="bulk-creditcard-enable"
                    className="text-sm font-medium text-heading cursor-pointer flex items-center gap-1"
                  >
                    <CreditCard size={14} /> Alterar Cartão de Crédito
                  </label>
                  {bulkEditFormState.isCreditCard !== null && (
                    <select
                      className="noir-select ml-auto text-sm py-1 animate-in slide-in-from-left-1 duration-200"
                      value={bulkEditFormState.isCreditCard ? "true" : "false"}
                      onChange={(e) =>
                        setBulkEditFormState((prev) => ({
                          ...prev,
                          isCreditCard: e.target.value === "true",
                        }))
                      }
                    >
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  )}
                </div>

                {/* Exclude from Split */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="bulk-exclude-enable"
                    checked={bulkEditFormState.excludeFromSplit !== null}
                    onChange={(e) =>
                      setBulkEditFormState((prev) => ({
                        ...prev,
                        excludeFromSplit: e.target.checked ? false : null,
                      }))
                    }
                    className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary"
                  />
                  <label
                    htmlFor="bulk-exclude-enable"
                    className="text-sm font-medium text-heading cursor-pointer flex items-center gap-1"
                  >
                    <UserX size={14} /> Alterar Fora da Divisão
                  </label>
                  {bulkEditFormState.excludeFromSplit !== null && (
                    <select
                      className="noir-select ml-auto text-sm py-1 animate-in slide-in-from-left-1 duration-200"
                      value={bulkEditFormState.excludeFromSplit ? "true" : "false"}
                      onChange={(e) =>
                        setBulkEditFormState((prev) => ({
                          ...prev,
                          excludeFromSplit: e.target.value === "true",
                        }))
                      }
                    >
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-noir-border">
                <button
                  type="button"
                  onClick={handleCloseBulkEditModal}
                  className="noir-btn-secondary flex-1 py-3"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBulkEdit}
                  disabled={
                    bulkEditFormState.categoryId === null &&
                    bulkEditFormState.paidBy === null &&
                    bulkEditFormState.isRecurring === null &&
                    bulkEditFormState.isCreditCard === null &&
                    bulkEditFormState.excludeFromSplit === null
                  }
                  className="noir-btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  <Pencil size={18} />
                  Aplicar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
