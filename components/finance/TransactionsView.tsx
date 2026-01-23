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

      <div
        className="bg-noir-bg-surface p-card rounded-card shadow-lg relative overflow-hidden"
        style={{
          borderColor: "rgba(255, 255, 255, 0.05)",
          borderWidth: "1px",
          borderStyle: "solid",
        }}
      >
        {isSmartFillEnabled && (
          <div
            className="mb-6 bg-noir-bg-primary p-4 rounded-interactive"
            style={{
              borderColor: "rgba(255, 255, 255, 0.05)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            <label
              htmlFor="smart-input"
              className="text-xs font-bold text-noir-text-accent flex items-center gap-1 mb-2"
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
                className="flex-1 text-sm bg-noir-bg-surface text-noir-text-body rounded-interactive px-3 py-2 focus:ring-2 focus:ring-noir-accent-primary focus:outline-none"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.05)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
                onKeyDown={(event) => event.key === "Enter" && handleSmartFill()}
              />
              <button
                type="button"
                onClick={handleSmartFill}
                disabled={aiLoading || !smartInput}
                className="bg-noir-accent-primary text-noir-text-on-accent px-4 py-2 rounded-interactive hover:bg-noir-accent-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors glow-accent"
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

        <h3 className="font-semibold text-noir-text-body mb-4 flex items-center gap-2">
          <Plus
            className={`${newTrans.type === "income" ? "bg-noir-accent-positive" : "bg-noir-accent-primary"} text-noir-text-on-accent rounded-pill p-1`}
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
              className={`w-full ${newTrans.type === "income" ? "bg-noir-accent-positive hover:bg-noir-accent-positive-hover" : "bg-noir-accent-primary hover:bg-noir-accent-primary-hover"} text-noir-text-on-accent font-medium py-3 px-4 rounded-interactive transition-colors flex items-center justify-center gap-2 glow-accent`}
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

      <div
        className="bg-noir-bg-surface rounded-card shadow-sm overflow-hidden"
        style={{
          borderColor: "rgba(255, 255, 255, 0.05)",
          borderWidth: "1px",
          borderStyle: "solid",
        }}
      >
        <div
          className="p-4 bg-noir-bg-primary flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}
        >
          <h2 className="font-semibold text-noir-text-body">
            Histórico de {formatMonthYear(selectedMonthDate)}
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-xs tabular-nums text-noir-text-muted bg-noir-bg-active px-2 py-1 rounded-pill w-fit">
              {visibleTransactionsForSelectedMonth.length} itens
            </span>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-1.5 rounded-interactive transition-colors ${
                isFilterOpen
                  ? "bg-noir-accent-primary text-noir-text-on-accent glow-accent"
                  : "bg-noir-bg-active text-noir-text-body hover:bg-noir-bg-surface"
              }`}
              title="Filtrar lançamentos"
            >
              <Filter size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-1.5 rounded-interactive transition-colors ${
                isSearchOpen
                  ? "bg-noir-accent-primary text-noir-text-on-accent glow-accent"
                  : "bg-noir-bg-active text-noir-text-body hover:bg-noir-bg-surface"
              }`}
              title="Buscar lançamentos"
            >
              <Search size={16} />
            </button>
            <button
              type="button"
              onClick={toggleSelectionMode}
              className={`text-xs px-3 py-1.5 rounded-interactive font-medium transition-colors ${
                isSelectionMode
                  ? "bg-noir-accent-primary text-noir-text-on-accent glow-accent"
                  : "bg-noir-bg-active text-noir-text-body hover:bg-noir-bg-surface"
              }`}
            >
              {isSelectionMode ? "Cancelar Seleção" : "Selecionar"}
            </button>
          </div>
        </div>

        {/* Filter options */}
        {isFilterOpen && (
          <div
            className="p-3 bg-noir-bg-primary animate-in slide-in-from-top-2 duration-200"
            style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}
          >
            <div className="flex flex-wrap items-center justify-end gap-3">
              {(typeFilter !== "all" || paidByFilter !== "all" || categoryFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter("all");
                    setPaidByFilter("all");
                    setCategoryFilter("all");
                  }}
                  className="text-xs text-noir-text-accent hover:text-noir-text-body font-medium flex items-center gap-1"
                >
                  <X size={12} />
                  Limpar filtros
                </button>
              )}
              <div className="flex items-center gap-2">
                <label htmlFor="type-filter" className="text-xs font-medium text-noir-text-body">
                  Tipo
                </label>
                <select
                  id="type-filter"
                  className="bg-noir-bg-surface text-noir-text-body rounded-interactive px-2 py-1 text-sm focus:ring-2 focus:ring-noir-accent-primary focus:outline-none"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.05)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="expense">Despesas</option>
                  <option value="income">Renda</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="paid-by-filter" className="text-xs font-medium text-noir-text-body">
                  Atribuído à
                </label>
                <select
                  id="paid-by-filter"
                  className="bg-noir-bg-surface text-noir-text-body rounded-interactive px-2 py-1 text-sm focus:ring-2 focus:ring-noir-accent-primary focus:outline-none"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.05)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
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
                <label
                  htmlFor="category-filter"
                  className="text-xs font-medium text-noir-text-body"
                >
                  Categoria
                </label>
                <select
                  id="category-filter"
                  className="bg-noir-bg-surface text-noir-text-body rounded-interactive px-2 py-1 text-sm focus:ring-2 focus:ring-noir-accent-primary focus:outline-none"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.05)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
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
          <div
            className="p-3 bg-noir-bg-primary animate-in slide-in-from-top-2 duration-200"
            style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}
          >
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por descrição, categoria, pessoa..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-noir-bg-surface text-noir-text-body rounded-interactive focus:ring-2 focus:ring-noir-accent-primary focus:outline-none"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.05)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-text-muted hover:text-noir-text-body"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bulk action bar */}
        {isSelectionMode && (
          <div
            className="p-3 bg-noir-accent-primary/20 flex flex-wrap items-center gap-3 animate-in slide-in-from-top-2 duration-200"
            style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllVisibleTransactions}
                className="text-xs px-2 py-1 bg-noir-bg-surface text-noir-text-body rounded-interactive hover:bg-noir-bg-active transition-colors"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.05)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
              >
                Selecionar Todos
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs px-2 py-1 bg-noir-bg-surface text-noir-text-body rounded-interactive hover:bg-noir-bg-active transition-colors"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.05)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
              >
                Limpar
              </button>
            </div>
            <span className="text-xs tabular-nums text-noir-text-accent font-medium">
              {selectedIds.size} selecionado(s)
            </span>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenBulkEditModal}
                disabled={selectedIds.size === 0}
                className="text-xs px-3 py-1.5 bg-noir-accent-primary text-noir-text-on-accent rounded-interactive hover:bg-noir-accent-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 glow-accent"
              >
                <Pencil size={12} />
                Editar em Massa
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0}
                className="text-xs px-3 py-1.5 bg-noir-accent-negative text-noir-text-on-accent rounded-interactive hover:bg-noir-accent-negative-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} />
                Excluir
              </button>
            </div>
          </div>
        )}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
          {visibleTransactionsForSelectedMonth.length === 0 ? (
            <div className="p-8 text-center text-noir-text-muted">
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
                  className={`p-4 hover:bg-noir-bg-primary transition-colors flex items-center justify-between group ${
                    isSelected ? "bg-noir-accent-primary/20" : ""
                  } ${isIncome ? "border-l-4 border-l-noir-accent-positive" : ""}`}
                  style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}
                >
                  <div className="flex items-center gap-4">
                    {isSelectionMode && (
                      <button
                        type="button"
                        onClick={() => canSelect && toggleTransactionSelection(transaction.id)}
                        disabled={!canSelect}
                        className={`w-5 h-5 rounded-interactive flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-noir-accent-primary text-noir-text-on-accent"
                            : canSelect
                              ? "hover:bg-noir-accent-primary/20"
                              : "bg-noir-bg-active cursor-not-allowed"
                        }`}
                        style={{
                          borderColor: isSelected ? "transparent" : "rgba(255, 255, 255, 0.05)",
                          borderWidth: "2px",
                          borderStyle: "solid",
                        }}
                        title={
                          !canSelect ? "Lançamentos recorrentes não podem ser selecionados" : ""
                        }
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </button>
                    )}
                    <div
                      className={`w-10 h-10 rounded-pill flex items-center justify-center text-noir-text-on-accent font-bold text-xs ${isIncome ? (isIncrement ? "bg-noir-accent-positive" : "bg-noir-accent-warning") : "bg-noir-bg-active text-noir-text-body"}`}
                    >
                      {isIncome ? (
                        isIncrement ? (
                          <TrendingUp size={18} />
                        ) : (
                          <TrendingDown size={18} />
                        )
                      ) : (
                        (selectedPerson?.name.substring(0, 2) ?? "?").toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-noir-text-heading flex items-center gap-2">
                        {transaction.description}
                        {isIncome && (
                          <span
                            className={`${isIncrement ? "bg-noir-accent-positive/20 text-noir-accent-positive" : "bg-noir-accent-warning/20 text-noir-accent-warning"} text-[10px] px-1.5 py-0.5 rounded-interactive flex items-center gap-1`}
                          >
                            {isIncrement ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {isIncrement ? "Renda" : "Dedução"}
                          </span>
                        )}
                        {isForecast && (
                          <span className="bg-noir-accent-warning/20 text-noir-accent-spending text-[10px] px-1.5 py-0.5 rounded-interactive flex items-center gap-1">
                            <CrystalBallLine size={10} className="text-noir-accent-spending" />{" "}
                            Previsão
                          </span>
                        )}
                        {transaction.isRecurring && (
                          <span className="bg-noir-accent-primary/20 text-noir-text-accent text-[10px] px-1.5 py-0.5 rounded-interactive flex items-center gap-1">
                            <RefreshCw size={10} /> Recorrente
                          </span>
                        )}
                        {transaction.isCreditCard && (
                          <span className="bg-noir-accent-primary/20 text-noir-text-accent text-[10px] px-1.5 py-0.5 rounded-interactive flex items-center gap-1">
                            Cartão
                          </span>
                        )}
                        {transaction.excludeFromSplit && (
                          <span className="bg-noir-bg-active text-noir-text-body text-[10px] px-1.5 py-0.5 rounded-interactive flex items-center gap-1">
                            <UserX size={10} /> Fora da divisão
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-noir-text-muted flex gap-2">
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
                      className={`font-bold tabular-nums ${isIncome ? (isIncrement ? "text-noir-accent-positive" : "text-noir-accent-warning") : "text-noir-text-body"}`}
                    >
                      {isIncome && isIncrement ? "+" : isIncome && !isIncrement ? "-" : ""}
                      {formatCurrency(transaction.amount)}
                    </span>
                    {!isSelectionMode && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(transaction)}
                          className="text-noir-text-muted hover:text-noir-text-accent p-2 transition-all"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        {!transaction.isRecurring ? (
                          <button
                            type="button"
                            onClick={() => deleteTransactionById(transaction.id)}
                            className="text-noir-text-muted hover:text-noir-accent-negative p-2 transition-all"
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
          <div
            className="p-4 bg-noir-bg-primary flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}
          >
            <span className="font-semibold text-noir-text-body">
              Total ({visibleTransactionsForCalculations.length} lançamento(s)
              {visibleExcludedForecastCount > 0
                ? ` + ${visibleExcludedForecastCount} previsão não considerada`
                : ""}
              )
            </span>
            <span className="font-bold text-lg tabular-nums text-noir-text-heading">
              {formatCurrency(
                visibleTransactionsForCalculations.reduce((sum, t) => sum + t.amount, 0),
              )}
            </span>
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-noir-bg-surface rounded-card shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
            style={{
              borderColor: "rgba(255, 255, 255, 0.05)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            <div
              className="p-6 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}
            >
              <h3 className="font-semibold text-noir-text-body flex items-center gap-2">
                <Pencil className="text-noir-text-accent" size={20} />
                Editar Lançamento
              </h3>
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="text-noir-text-muted hover:text-noir-text-body p-1 rounded-pill hover:bg-noir-bg-active transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label
                  htmlFor="edit-description"
                  className="block text-xs font-medium text-noir-text-muted mb-1"
                >
                  Descrição
                </label>
                <input
                  id="edit-description"
                  type="text"
                  placeholder="Ex: Luz, Mercado, iFood..."
                  className="w-full bg-noir-bg-primary text-noir-text-body rounded-interactive p-2 focus:ring-2 focus:ring-noir-accent-primary focus:outline-none"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.05)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                  value={editFormState.description}
                  onChange={(e) =>
                    setEditFormState({ ...editFormState, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-grid items-end">
                <TransactionFormFields
                  formState={editFormState}
                  setFormState={setEditFormState}
                  showInstallmentFields={false}
                  showDescription={false}
                  idPrefix="edit-transaction"
                />
              </div>
              <div
                className="flex gap-3 mt-6 pt-4"
                style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}
              >
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="flex-1 bg-noir-bg-active hover:bg-noir-bg-primary text-noir-text-body font-medium py-3 px-4 rounded-interactive transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 bg-noir-accent-primary hover:bg-noir-accent-primary-hover text-noir-text-on-accent font-medium py-3 px-4 rounded-interactive transition-colors flex items-center justify-center gap-2 glow-accent"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-noir-bg-surface rounded-card shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
            style={{
              borderColor: "rgba(255, 255, 255, 0.05)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            <div
              className="p-6 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}
            >
              <h3 className="font-semibold text-noir-text-body flex items-center gap-2">
                <Pencil className="text-noir-text-accent" size={20} />
                Editar em Massa
                <span className="text-xs tabular-nums font-normal text-noir-text-muted bg-noir-bg-active px-2 py-0.5 rounded-pill">
                  {selectedIds.size} lançamento(s)
                </span>
              </h3>
              <button
                type="button"
                onClick={handleCloseBulkEditModal}
                className="text-noir-text-muted hover:text-noir-text-body p-1 rounded-pill hover:bg-noir-bg-active transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-noir-text-body mb-4">
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
                    className="w-4 h-4 text-noir-accent-primary rounded-interactive focus:ring-noir-accent-primary"
                    style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
                  />
                  <label
                    htmlFor="bulk-category-enable"
                    className="text-sm font-medium text-noir-text-body cursor-pointer"
                  >
                    Alterar Categoria
                  </label>
                </div>
                {bulkEditFormState.categoryId !== null && (
                  <select
                    id="bulk-category"
                    className="w-full bg-noir-bg-primary text-noir-text-body rounded-interactive p-2 focus:ring-2 focus:ring-noir-accent-primary focus:outline-none animate-in slide-in-from-top-1 duration-200"
                    style={{
                      borderColor: "rgba(255, 255, 255, 0.05)",
                      borderWidth: "1px",
                      borderStyle: "solid",
                    }}
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
                    className="w-4 h-4 text-noir-accent-primary rounded-interactive focus:ring-noir-accent-primary"
                    style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
                  />
                  <label
                    htmlFor="bulk-paidby-enable"
                    className="text-sm font-medium text-noir-text-body cursor-pointer"
                  >
                    Alterar Pago por
                  </label>
                </div>
                {bulkEditFormState.paidBy !== null && (
                  <select
                    id="bulk-paidby"
                    className="w-full bg-noir-bg-primary text-noir-text-body rounded-interactive p-2 focus:ring-2 focus:ring-noir-accent-primary focus:outline-none animate-in slide-in-from-top-1 duration-200"
                    style={{
                      borderColor: "rgba(255, 255, 255, 0.05)",
                      borderWidth: "1px",
                      borderStyle: "solid",
                    }}
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
                    className="w-4 h-4 text-noir-accent-primary rounded-interactive focus:ring-noir-accent-primary"
                    style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
                  />
                  <label
                    htmlFor="bulk-recurring-enable"
                    className="text-sm font-medium text-noir-text-body cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw size={14} /> Alterar Recorrente
                  </label>
                  {bulkEditFormState.isRecurring !== null && (
                    <select
                      className="ml-auto bg-noir-bg-primary text-noir-text-body rounded-interactive px-2 py-1 text-sm focus:ring-2 focus:ring-noir-accent-primary focus:outline-none animate-in slide-in-from-left-1 duration-200"
                      style={{
                        borderColor: "rgba(255, 255, 255, 0.05)",
                        borderWidth: "1px",
                        borderStyle: "solid",
                      }}
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
                    className="w-4 h-4 text-noir-accent-primary rounded-interactive focus:ring-noir-accent-primary"
                    style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
                  />
                  <label
                    htmlFor="bulk-creditcard-enable"
                    className="text-sm font-medium text-noir-text-body cursor-pointer flex items-center gap-1"
                  >
                    <CreditCard size={14} /> Alterar Cartão de Crédito
                  </label>
                  {bulkEditFormState.isCreditCard !== null && (
                    <select
                      className="ml-auto bg-noir-bg-primary text-noir-text-body rounded-interactive px-2 py-1 text-sm focus:ring-2 focus:ring-noir-accent-primary focus:outline-none animate-in slide-in-from-left-1 duration-200"
                      style={{
                        borderColor: "rgba(255, 255, 255, 0.05)",
                        borderWidth: "1px",
                        borderStyle: "solid",
                      }}
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
                    className="w-4 h-4 text-noir-accent-primary rounded-interactive focus:ring-noir-accent-primary"
                    style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
                  />
                  <label
                    htmlFor="bulk-exclude-enable"
                    className="text-sm font-medium text-noir-text-body cursor-pointer flex items-center gap-1"
                  >
                    <UserX size={14} /> Alterar Fora da Divisão
                  </label>
                  {bulkEditFormState.excludeFromSplit !== null && (
                    <select
                      className="ml-auto bg-noir-bg-primary text-noir-text-body rounded-interactive px-2 py-1 text-sm focus:ring-2 focus:ring-noir-accent-primary focus:outline-none animate-in slide-in-from-left-1 duration-200"
                      style={{
                        borderColor: "rgba(255, 255, 255, 0.05)",
                        borderWidth: "1px",
                        borderStyle: "solid",
                      }}
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

              <div
                className="flex gap-3 mt-6 pt-4"
                style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}
              >
                <button
                  type="button"
                  onClick={handleCloseBulkEditModal}
                  className="flex-1 bg-noir-bg-active hover:bg-noir-bg-primary text-noir-text-body font-medium py-3 px-4 rounded-interactive transition-colors"
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
                  className="flex-1 bg-noir-accent-primary hover:bg-noir-accent-primary-hover text-noir-text-on-accent font-medium py-3 px-4 rounded-interactive transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed glow-accent"
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
