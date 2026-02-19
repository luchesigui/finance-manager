"use client";

import { useForm } from "@tanstack/react-form";
import {
  AlertTriangle,
  ChevronDown,
  CreditCard,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Repeat,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCategoriesData } from "@/features/categories/hooks/useCategoriesData";
import { useDefaultPayerData } from "@/features/people/hooks/useDefaultPayerData";
import { usePeopleData } from "@/features/people/hooks/usePeopleData";
import { useRecurringTemplateMutations } from "@/features/recurring-templates/hooks/useRecurringTemplateMutations";
import { MonthNavigator } from "@/features/transactions/components/MonthNavigator";
import { TransactionFormFields } from "@/features/transactions/components/TransactionFormFields";
import { BulkEditModal } from "@/features/transactions/components/TransactionsView/BulkEditModal";
import { EditTransactionModal } from "@/features/transactions/components/TransactionsView/EditTransactionModal";
import { SmartFillSection } from "@/features/transactions/components/TransactionsView/SmartFillSection";
import { TransactionRow } from "@/features/transactions/components/TransactionsView/TransactionRow";
import { fuzzyMatch } from "@/features/transactions/components/TransactionsView/fuzzyMatch";
import { useOutlierDetection } from "@/features/transactions/hooks/useOutlierDetection";
import { useTransactionsData } from "@/features/transactions/hooks/useTransactionsData";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { generateGeminiContent } from "@/lib/geminiClient";
import { useCurrentMonth } from "@/lib/stores/currentMonthStore";
import type { NewTransactionFormState, Transaction } from "@/lib/types";

// ============================================================================
// Helper Functions
// ============================================================================

function createDefaultFormState(
  categoryId: string,
  paidBy: string,
  yearMonth: string,
): NewTransactionFormState {
  return {
    description: "",
    amount: null,
    categoryId,
    paidBy,
    isRecurring: false,
    dayOfMonth: 1,
    isCreditCard: false,
    isNextBilling: false,
    dateSelectionMode: "month",
    selectedMonth: yearMonth,
    date: "",
    isInstallment: false,
    installments: 2,
    excludeFromSplit: false,
    isForecast: false,
    type: "expense",
    isIncrement: true,
  };
}

// ============================================================================
// Component
// ============================================================================

export function TransactionsView() {
  const { selectedMonthDate } = useCurrentMonth();
  const { people } = usePeopleData();
  const { categories } = useCategoriesData();
  const { defaultPayerId } = useDefaultPayerData();
  const {
    transactionsForSelectedMonth,
    transactionsForCalculations,
    addTransactionsFromFormState,
    deleteTransactionById,
    updateTransactionById,
    bulkUpdateTransactions,
    bulkDeleteTransactions,
  } = useTransactionsData();
  const {
    createRecurringTemplate,
    updateRecurringTemplate,
    deleteRecurringTemplate,
    deleteRecurringTemplateAsync,
    isDeletingRecurringTemplate,
  } = useRecurringTemplateMutations();

  const { isOutlier } = useOutlierDetection(
    selectedMonthDate.getFullYear(),
    selectedMonthDate.getMonth() + 1,
  );

  const searchParams = useSearchParams();
  const initialCategoryId = searchParams.get("categoryId");

  const [viewMode, setViewMode] = useState<"general" | "creditCard">("general");
  const [hideNextBilling, setHideNextBilling] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [smartInput, setSmartInput] = useState("");
  const [paidByFilter, setPaidByFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(() => {
    if (initialCategoryId) {
      return new Set([initialCategoryId]);
    }
    return new Set();
  });
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [creditCardFilter, setCreditCardFilter] = useState<string>("all");
  const [isNextBillingFilter, setIsNextBillingFilter] = useState<"all" | "yes" | "no">("all");
  const [recurringFilter, setRecurringFilter] = useState<"all" | "yes" | "no">("all");
  const [outlierFilter, setOutlierFilter] = useState<"all" | "yes" | "no">("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const getActiveFilterCount = () => {
    let count = 0;
    if (paidByFilter !== "all") count++;
    if (categoryFilter.size > 0) count++;
    if (viewMode === "general" && creditCardFilter !== "all") count++;
    if (isNextBillingFilter !== "all") count++;
    if (recurringFilter !== "all") count++;
    if (outlierFilter !== "all") count++;
    return count;
  };

  // Recurring delete modal state
  const [deletingRecurringTemplateId, setDeletingRecurringTemplateId] = useState<number | null>(
    null,
  );

  // Recurring edit scope: when editing a recurring transaction, which scope to apply
  const [recurringEditScope, setRecurringEditScope] = useState<"template_only" | "full_history">(
    "template_only",
  );

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Bulk edit modal state
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkEditFormState, setBulkEditFormState] = useState<{
    categoryId: string | null;
    paidBy: string | null;
    isCreditCard: boolean | null;
    isNextBilling: boolean | null;
    excludeFromSplit: boolean | null;
  }>({
    categoryId: null,
    paidBy: null,
    isCreditCard: null,
    isNextBilling: null,
    excludeFromSplit: null,
  });

  // Ref for category dropdown click outside handling
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };

    if (isCategoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isCategoryDropdownOpen]);

  // Helper to get current month string (YYYY-MM)
  const getCurrentYearMonth = () => {
    const year = selectedMonthDate.getFullYear();
    const month = String(selectedMonthDate.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const isTransactionDateInSelectedMonth = (dateStr: string) => {
    const prefix = getCurrentYearMonth();
    return dateStr.startsWith(prefix);
  };

  // Edit modal state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // TanStack Form for new transaction
  const newTransactionForm = useForm({
    defaultValues: createDefaultFormState(
      categories[0]?.id ?? "c1",
      defaultPayerId,
      getCurrentYearMonth(),
    ),
    onSubmit: async ({ value }) => {
      const preserveNextBilling = value.isNextBilling;
      addTransactionsFromFormState(value);
      newTransactionForm.reset();
      newTransactionForm.setFieldValue("categoryId", categories[0]?.id ?? "c1");
      newTransactionForm.setFieldValue("paidBy", defaultPayerId);
      newTransactionForm.setFieldValue("selectedMonth", getCurrentYearMonth());
      if (viewMode === "creditCard") {
        newTransactionForm.setFieldValue("isCreditCard", true);
        newTransactionForm.setFieldValue("isNextBilling", preserveNextBilling);
      }
      setSmartInput("");
    },
  });

  // TanStack Form for edit transaction
  const editTransactionForm = useForm({
    defaultValues: createDefaultFormState(
      categories[0]?.id ?? "",
      defaultPayerId,
      getCurrentYearMonth(),
    ),
    onSubmit: async ({ value }) => {
      if (!editingTransaction) return;
      if (!value.description || value.amount == null) return;

      if (editingTransaction.recurringTemplateId != null) {
        const selectedDay = (() => {
          if (value.dayOfMonth) return value.dayOfMonth;
          const day = Number.parseInt(value.date.split("-")[2] ?? "1", 10);
          return Number.isFinite(day) ? day : 1;
        })();

        updateRecurringTemplate(
          editingTransaction.recurringTemplateId,
          {
            description: value.description,
            amount: value.amount,
            categoryId: value.type === "income" ? null : value.categoryId,
            paidBy: value.paidBy,
            type: value.type,
            isIncrement: value.isIncrement,
            isCreditCard: value.type === "income" ? false : value.isCreditCard,
            isNextBilling: value.type === "income" ? false : value.isNextBilling,
            excludeFromSplit: value.type === "income" ? false : value.excludeFromSplit,
            dayOfMonth: selectedDay,
            isActive: value.isRecurring,
          },
          { scope: recurringEditScope },
        );
        setEditingTransaction(null);
        return;
      }

      updateTransactionById(editingTransaction.id, {
        description: value.description,
        amount: value.amount,
        categoryId: value.categoryId,
        paidBy: value.paidBy,
        isCreditCard: value.isCreditCard,
        isNextBilling: value.isNextBilling,
        excludeFromSplit: value.excludeFromSplit,
        isForecast: value.isForecast,
        date: value.date,
        type: value.type,
        isIncrement: value.isIncrement,
      });

      setEditingTransaction(null);
    },
  });

  // Update default payer when it changes
  useEffect(() => {
    newTransactionForm.setFieldValue("paidBy", defaultPayerId);
  }, [defaultPayerId, newTransactionForm]);

  // Update category when categories change
  useEffect(() => {
    if (categories[0]) {
      newTransactionForm.setFieldValue("categoryId", categories[0].id);
    }
  }, [categories, newTransactionForm]);

  useEffect(() => {
    if (paidByFilter === "all") return;
    const stillExists = people.some((person) => person.id === paidByFilter);
    if (!stillExists) setPaidByFilter("all");
  }, [paidByFilter, people]);

  useEffect(() => {
    if (categoryFilter.size === 0) return;
    const categoryIds = new Set(categories.map((cat) => cat.id));
    const validIds = new Set(Array.from(categoryFilter).filter((id) => categoryIds.has(id)));
    if (validIds.size !== categoryFilter.size) {
      setCategoryFilter(validIds);
    }
  }, [categoryFilter, categories]);

  // Sync category filter with URL parameter
  useEffect(() => {
    const categoryIdFromUrl = searchParams.get("categoryId");
    if (categoryIdFromUrl) {
      // Only set if category exists in categories list
      const categoryExists = categories.some((cat) => cat.id === categoryIdFromUrl);
      if (categoryExists) {
        setCategoryFilter((prev) => {
          if (prev.size === 1 && prev.has(categoryIdFromUrl)) return prev;
          return new Set([categoryIdFromUrl]);
        });
      }
    } else {
      // Clear filter if URL parameter is removed
      setCategoryFilter((prev) => (prev.size === 0 ? prev : new Set()));
    }
  }, [searchParams, categories]);

  const matchesFilters = (transaction: Transaction) => {
    // Credit card view: filter by actual date and isCreditCard
    if (viewMode === "creditCard") {
      if (!transaction.isCreditCard) return false;

      // Filter by actual date month (not accounting month)
      const txDate = new Date(`${transaction.date}T00:00:00`);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth() + 1;
      const selYear = selectedMonthDate.getFullYear();
      const selMonth = selectedMonthDate.getMonth() + 1;
      if (txYear !== selYear || txMonth !== selMonth) return false;

      // Hide next billing toggle
      if (hideNextBilling && transaction.isNextBilling) return false;
    }

    // General view: hide current-month + next-billing credit card transactions (they only show in credit card mode)
    if (
      viewMode === "general" &&
      transaction.isCreditCard &&
      transaction.isNextBilling &&
      isTransactionDateInSelectedMonth(transaction.date)
    ) {
      return false;
    }

    if (paidByFilter !== "all" && transaction.paidBy !== paidByFilter) return false;
    if (typeFilter !== "all" && transaction.type !== typeFilter) return false;

    // Multi-category filter
    if (categoryFilter.size > 0) {
      if (transaction.categoryId === null) return false;
      if (!categoryFilter.has(transaction.categoryId)) return false;
    }

    // Credit card filter (only in general view)
    if (viewMode === "general" && creditCardFilter !== "all") {
      const isCreditCard = creditCardFilter === "yes";
      if (transaction.isCreditCard !== isCreditCard) return false;
    }

    // Next billing filter: "yes" = ocultar gastos da próxima fatura (hide is_next_billing transactions)
    if (isNextBillingFilter === "yes" && transaction.isNextBilling) return false;

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

    // Outlier filter
    if (outlierFilter !== "all") {
      const isOutlierTransaction = isOutlier(transaction);
      if (outlierFilter === "yes" && !isOutlierTransaction) return false;
      if (outlierFilter === "no" && isOutlierTransaction) return false;
    }

    // Recurring filter
    if (recurringFilter !== "all") {
      const isRecurring = transaction.recurringTemplateId != null;
      if (recurringFilter === "yes" && !isRecurring) return false;
      if (recurringFilter === "no" && isRecurring) return false;
    }

    return true;
  };

  const visibleTransactionsForSelectedMonth = transactionsForSelectedMonth.filter(matchesFilters);
  const visibleTransactionsForCalculations = transactionsForCalculations
    .filter(matchesFilters)
    .filter((transaction) => transaction.type !== "income");
  const visibleCalculationIds = new Set(
    visibleTransactionsForCalculations.map((transaction) => transaction.id),
  );
  const visibleExcludedForecastAndIncomeCount = visibleTransactionsForSelectedMonth.filter(
    (transaction) =>
      (transaction.isForecast || transaction.type === "income") &&
      !visibleCalculationIds.has(transaction.id),
  ).length;

  const visibleExpenseCount = visibleTransactionsForSelectedMonth.filter(
    (t) => t.type !== "income",
  ).length;
  const visibleIncomeCount = visibleTransactionsForSelectedMonth.filter(
    (t) => t.type === "income",
  ).length;
  const visibleIncomeTotal = visibleTransactionsForSelectedMonth
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const visibleExpenseTotal = visibleTransactionsForCalculations.reduce(
    (sum, t) => sum + t.amount,
    0,
  );

  const handleOpenEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setRecurringEditScope("template_only");

    // Determine if the transaction date is the 1st of a month (month mode) or a specific date
    const dateParts = transaction.date.split("-");
    const day = dateParts[2] ? Number.parseInt(dateParts[2], 10) : 1;
    const isFirstOfMonth = day === 1;
    const selectedMonth =
      dateParts[0] && dateParts[1] ? `${dateParts[0]}-${dateParts[1]}` : getCurrentYearMonth();

    // Reset and populate the edit form
    editTransactionForm.reset();
    editTransactionForm.setFieldValue("description", transaction.description);
    editTransactionForm.setFieldValue("amount", transaction.amount);
    editTransactionForm.setFieldValue(
      "categoryId",
      transaction.categoryId ?? categories[0]?.id ?? "",
    );
    editTransactionForm.setFieldValue("paidBy", transaction.paidBy);
    editTransactionForm.setFieldValue("isRecurring", transaction.recurringTemplateId != null);
    editTransactionForm.setFieldValue("dayOfMonth", day);
    editTransactionForm.setFieldValue("isCreditCard", transaction.isCreditCard);
    editTransactionForm.setFieldValue("isNextBilling", transaction.isNextBilling);
    editTransactionForm.setFieldValue("dateSelectionMode", isFirstOfMonth ? "month" : "specific");
    editTransactionForm.setFieldValue("selectedMonth", selectedMonth);
    editTransactionForm.setFieldValue("date", transaction.date);
    editTransactionForm.setFieldValue("excludeFromSplit", transaction.excludeFromSplit);
    editTransactionForm.setFieldValue("isForecast", transaction.isForecast);
    editTransactionForm.setFieldValue("type", transaction.type ?? "expense");
    editTransactionForm.setFieldValue("isIncrement", transaction.isIncrement ?? true);
  };

  const handleCloseEditModal = () => {
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

        // Update form with AI-parsed values
        if (data.description) {
          newTransactionForm.setFieldValue("description", data.description);
        }
        if (data.amount) {
          newTransactionForm.setFieldValue("amount", data.amount);
        }
        if (data.categoryId) {
          newTransactionForm.setFieldValue("categoryId", data.categoryId);
        }
        if (data.paidBy) {
          newTransactionForm.setFieldValue("paidBy", data.paidBy);
        } else {
          newTransactionForm.setFieldValue("paidBy", defaultPayerId);
        }
        if (data.date) {
          const dateParts = data.date.split("-");
          const day = dateParts[2] ? Number.parseInt(dateParts[2], 10) : 1;
          if (day === 1) {
            newTransactionForm.setFieldValue("dateSelectionMode", "month");
            newTransactionForm.setFieldValue(
              "selectedMonth",
              dateParts[0] && dateParts[1]
                ? `${dateParts[0]}-${dateParts[1]}`
                : getCurrentYearMonth(),
            );
          } else {
            newTransactionForm.setFieldValue("dateSelectionMode", "specific");
          }
          newTransactionForm.setFieldValue("date", data.date);
        }
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
      .filter((transaction) => transaction.recurringTemplateId == null)
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
      isCreditCard: null,
      isNextBilling: null,
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
    if (bulkEditFormState.isCreditCard !== null)
      patch.isCreditCard = bulkEditFormState.isCreditCard;
    if (bulkEditFormState.isNextBilling !== null)
      patch.isNextBilling = bulkEditFormState.isNextBilling;
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
          <SmartFillSection
            smartInput={smartInput}
            onSmartInputChange={setSmartInput}
            onSmartFill={handleSmartFill}
            isLoading={aiLoading}
          />

          <newTransactionForm.Subscribe selector={(state) => state.values}>
            {(values) => (
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-heading flex items-center gap-2">
                  <Plus
                    className={`${
                      values.type === "income" ? "bg-accent-positive" : "bg-accent-primary"
                    } text-white rounded-interactive p-1`}
                    size={24}
                  />
                  {values.type === "income" ? "Novo Lançamento de Renda" : "Nova Despesa Manual"}
                </h3>
                {values.type !== "income" && (
                  <div className="flex items-center gap-2 select-none">
                    <Label
                      htmlFor="view-mode-switch"
                      className="text-xs font-medium text-body mr-2 cursor-pointer"
                    >
                      Cartão de crédito
                    </Label>
                    <Switch
                      id="view-mode-switch"
                      checked={viewMode === "creditCard"}
                      onCheckedChange={(checked) => {
                        const next = checked ? "creditCard" : "general";
                        setViewMode(next);
                        newTransactionForm.setFieldValue("isCreditCard", next === "creditCard");
                        if (next === "general")
                          newTransactionForm.setFieldValue("isNextBilling", false);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </newTransactionForm.Subscribe>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              newTransactionForm.handleSubmit();
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
          >
            <TransactionFormFields
              form={newTransactionForm}
              showInstallmentFields={true}
              showDescription={true}
              idPrefix="new-transaction"
              viewMode={viewMode}
            />

            <div className="lg:col-span-4 mt-2">
              <newTransactionForm.Subscribe selector={(state) => state.values}>
                {(values) => (
                  <button
                    type="submit"
                    className={`w-full font-semibold py-3 px-4 rounded-interactive transition-all duration-200 flex items-center justify-center gap-2 ${
                      values.type === "income"
                        ? "bg-accent-positive text-white hover:shadow-glow-positive"
                        : "bg-accent-primary text-white hover:shadow-glow-accent"
                    }`}
                  >
                    <Plus size={18} />
                    {values.type === "income"
                      ? values.isIncrement
                        ? "Adicionar Renda"
                        : "Adicionar Dedução de Renda"
                      : values.isInstallment
                        ? `Lançar ${values.installments}x Parcelas`
                        : "Adicionar Lançamento"}
                  </button>
                )}
              </newTransactionForm.Subscribe>
            </div>
          </form>
        </div>
      </div>

      <div className="noir-card">
        <div className="p-4 border-b border-noir-border bg-noir-active/30 flex flex-wrap items-center gap-3">
          {viewMode === "general" && (
            <div className="bg-noir-active p-1 rounded-interactive flex gap-1 border border-noir-border">
              <button
                type="button"
                onClick={() => setTypeFilter(typeFilter === "expense" ? "all" : "expense")}
                className={`px-4 py-1.5 text-sm font-medium rounded-interactive transition-all duration-200 ${
                  typeFilter === "expense"
                    ? "bg-accent-primary text-white shadow-glow-accent"
                    : "text-body hover:text-heading hover:bg-noir-surface"
                }`}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter(typeFilter === "income" ? "all" : "income")}
                className={`px-4 py-1.5 text-sm font-medium rounded-interactive transition-all duration-200 ${
                  typeFilter === "income"
                    ? "bg-accent-primary text-white shadow-glow-accent"
                    : "text-body hover:text-heading hover:bg-noir-surface"
                }`}
              >
                Renda
              </button>
            </div>
          )}

          {people.length > 1 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-[42px] rounded-interactive bg-noir-active border-noir-border text-body hover:text-heading hover:bg-noir-surface flex items-center gap-2"
                >
                  <Plus size={16} className="text-muted" />
                  {paidByFilter === "all"
                    ? "Atribuído à"
                    : people.find((p) => p.id === paidByFilter)?.name}
                  <ChevronDown size={14} className="text-muted" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-1 bg-noir-surface border-noir-border">
                <button
                  type="button"
                  className="w-full text-left p-2 text-sm text-heading hover:bg-noir-active cursor-pointer rounded-interactive border-0 bg-transparent"
                  onClick={() => setPaidByFilter("all")}
                >
                  Todos
                </button>
                {people.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    className="w-full text-left p-2 text-sm text-heading hover:bg-noir-active cursor-pointer rounded-interactive border-0 bg-transparent"
                    onClick={() => setPaidByFilter(person.id)}
                  >
                    {person.name}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-[42px] rounded-interactive bg-noir-active border-noir-border text-body hover:text-heading hover:bg-noir-surface flex items-center gap-2"
              >
                <Plus size={16} className="text-muted" />
                Categoria
                {categoryFilter.size > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-accent-primary text-white">
                    {categoryFilter.size}
                  </Badge>
                )}
                <ChevronDown size={14} className="text-muted" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 bg-noir-surface border-noir-border">
              <div className="max-h-[300px] overflow-y-auto p-1">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-noir-active/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={categoryFilter.has(category.id)}
                      onChange={(e) => {
                        const newSet = new Set(categoryFilter);
                        if (e.target.checked) {
                          newSet.add(category.id);
                        } else {
                          newSet.delete(category.id);
                        }
                        setCategoryFilter(newSet);
                      }}
                      className="w-4 h-4 text-accent-primary rounded border-noir-border bg-noir-active focus:ring-accent-primary"
                    />
                    <span className="text-sm text-heading">{category.name}</span>
                  </label>
                ))}
              </div>
              <div className="p-2 border-t border-noir-border flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryFilter(new Set(categories.map((c) => c.id)))}
                  className="text-xs px-3 py-1.5 rounded-interactive font-medium transition-all duration-200 bg-accent-primary text-white shadow-glow-accent"
                >
                  Selecionar Todas
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter(new Set())}
                  className="text-xs px-3 py-1.5 rounded-interactive font-medium transition-all duration-200 bg-noir-active text-body hover:text-heading hover:bg-noir-surface"
                >
                  Limpar
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <input type="hidden" id="type-filter" value={typeFilter} readOnly aria-hidden />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-[42px] rounded-interactive bg-noir-active border-noir-border text-body hover:text-heading hover:bg-noir-surface flex items-center gap-2"
                aria-label="Filtrar lançamentos"
              >
                <SlidersHorizontal size={16} className="text-muted" />
                Mais filtros
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-accent-primary text-white">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-noir-surface border-noir-border space-y-6">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider">
                Filtros Avançados
              </h4>

              <div className="space-y-4">
                {viewMode === "general" && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="card-filter" className="text-sm font-medium text-heading">
                      Cartão
                    </Label>
                    <Switch
                      id="card-filter"
                      size="sm"
                      checked={creditCardFilter === "yes"}
                      onCheckedChange={(checked) => setCreditCardFilter(checked ? "yes" : "all")}
                      className="data-[state=unchecked]:bg-noir-active"
                    />
                  </div>
                )}

                {viewMode === "creditCard" && (
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="next-billing-filter"
                      className="text-sm font-medium text-heading"
                    >
                      Ocultar gastos da próxima fatura
                    </Label>
                    <Switch
                      id="next-billing-filter"
                      size="sm"
                      checked={isNextBillingFilter === "yes"}
                      onCheckedChange={(checked) => setIsNextBillingFilter(checked ? "yes" : "all")}
                      className="data-[state=unchecked]:bg-noir-active"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="recurring-adv-filter"
                    className="text-sm font-medium text-heading"
                  >
                    Recorrente
                  </Label>
                  <Switch
                    id="recurring-adv-filter"
                    size="sm"
                    checked={recurringFilter === "yes"}
                    onCheckedChange={(checked) => setRecurringFilter(checked ? "yes" : "all")}
                    className="data-[state=unchecked]:bg-noir-active"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="outlier-adv-filter" className="text-sm font-medium text-heading">
                    Fora do padrão
                  </Label>
                  <Switch
                    id="outlier-adv-filter"
                    size="sm"
                    checked={outlierFilter === "yes"}
                    onCheckedChange={(checked) => setOutlierFilter(checked ? "yes" : "all")}
                    className="data-[state=unchecked]:bg-noir-active"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-noir-border flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter("all");
                    setPaidByFilter("all");
                    setCategoryFilter(new Set());
                    setCreditCardFilter("all");
                    setIsNextBillingFilter("all");
                    setRecurringFilter("all");
                    setOutlierFilter("all");
                  }}
                  className="text-xs px-3 py-1.5 rounded-interactive font-medium transition-all duration-200 bg-noir-active text-body hover:text-heading hover:bg-noir-surface"
                >
                  Limpar
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-1.5 rounded-interactive transition-all duration-200 ${
                isSearchOpen
                  ? "bg-accent-primary text-white shadow-glow-accent"
                  : "bg-noir-active text-body hover:text-heading hover:bg-noir-surface"
              }`}
              title="Buscar lançamentos"
              aria-label="Buscar lançamentos"
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
          <div className="border-b border-noir-border bg-accent-primary/10 animate-in slide-in-from-top-2 duration-200">
            <div className="p-3 flex flex-wrap items-center gap-3">
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
            <div className="px-3 pb-3 pt-0 flex items-center gap-2 border-t border-noir-border mt-0 pt-3">
              <button
                type="button"
                onClick={selectAllVisibleTransactions}
                className="text-xs px-3 py-1.5 rounded-interactive font-medium transition-all duration-200 bg-accent-primary text-white shadow-glow-accent"
              >
                Selecionar Todos
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs px-3 py-1.5 rounded-interactive font-medium transition-all duration-200 bg-noir-active text-body hover:text-heading hover:bg-noir-surface"
              >
                Limpar
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
                  {typeFilter !== "all" ||
                  paidByFilter !== "all" ||
                  categoryFilter.size > 0 ||
                  creditCardFilter !== "all"
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
                  {categoryFilter.size > 0 && " nas categorias selecionadas"}
                  {creditCardFilter !== "all" &&
                    ` ${creditCardFilter === "yes" ? "no cartão" : "fora do cartão"}`}
                  .
                </>
              )}
            </div>
          ) : (
            visibleTransactionsForSelectedMonth.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                category={categories.find((category) => category.id === transaction.categoryId)}
                person={people.find((person) => person.id === transaction.paidBy)}
                isOutlier={isOutlier(transaction)}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.has(transaction.id)}
                canSelect={transaction.recurringTemplateId == null}
                displayNextBillingTag={
                  transaction.isNextBilling && isTransactionDateInSelectedMonth(transaction.date)
                }
                onToggleSelection={() => toggleTransactionSelection(transaction.id)}
                onEdit={() => handleOpenEditModal(transaction)}
                onMarkAsHappened={
                  transaction.isForecast
                    ? () => updateTransactionById(transaction.id, { isForecast: false })
                    : undefined
                }
                onDelete={
                  transaction.recurringTemplateId != null
                    ? () =>
                        setDeletingRecurringTemplateId(transaction.recurringTemplateId as number)
                    : () => deleteTransactionById(transaction.id)
                }
              />
            ))
          )}
        </div>

        {/* Total row */}
        {visibleTransactionsForSelectedMonth.length > 0 && (
          <div className="p-4 border-t border-noir-border bg-noir-active/50 flex items-center justify-between">
            <span className="font-semibold text-heading">
              {typeFilter === "income" ? (
                <>Total de {visibleIncomeCount} recebimento(s)</>
              ) : typeFilter === "expense" ? (
                <>Total de {visibleExpenseCount} lançamento(s)</>
              ) : (
                <>
                  Total de {visibleTransactionsForSelectedMonth.length} lançamentos
                  {visibleIncomeCount > 0 && (
                    <span className="text-xs text-body ml-1">
                      (+ {visibleIncomeCount} recebimentos não considerados na conta total)
                    </span>
                  )}
                </>
              )}
            </span>
            <span className="font-bold text-lg text-heading tabular-nums">
              {typeFilter === "income"
                ? formatCurrency(visibleIncomeTotal)
                : formatCurrency(visibleExpenseTotal)}
            </span>
          </div>
        )}
      </div>

      {editingTransaction && (
        <EditTransactionModal
          form={editTransactionForm}
          onClose={handleCloseEditModal}
          editingTransaction={editingTransaction}
          recurringEditScope={recurringEditScope}
          onRecurringEditScopeChange={setRecurringEditScope}
          viewMode={viewMode}
        />
      )}

      {isBulkEditModalOpen && (
        <BulkEditModal
          formState={bulkEditFormState}
          onFormStateChange={setBulkEditFormState}
          categories={categories}
          people={people}
          selectedCount={selectedIds.size}
          onClose={handleCloseBulkEditModal}
          onSave={handleSaveBulkEdit}
          isSaveDisabled={
            bulkEditFormState.categoryId === null &&
            bulkEditFormState.paidBy === null &&
            bulkEditFormState.isCreditCard === null &&
            bulkEditFormState.isNextBilling === null &&
            bulkEditFormState.excludeFromSplit === null
          }
        />
      )}

      {deletingRecurringTemplateId !== null && (
        <dialog
          open
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          aria-labelledby="recurring-delete-modal-title"
        >
          <div className="noir-card max-w-md w-full animate-in fade-in zoom-in-95 duration-200 rounded-outer">
            <div className="p-6 border-b border-noir-border flex items-center justify-between">
              <h3
                id="recurring-delete-modal-title"
                className="font-semibold text-heading flex items-center gap-2"
              >
                <Trash2 className="text-accent-negative" size={20} />
                Excluir Recorrente
              </h3>
              <button
                type="button"
                onClick={() => setDeletingRecurringTemplateId(null)}
                className="text-muted hover:text-heading p-1 rounded-interactive hover:bg-noir-active transition-all"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-body">
                O que deseja fazer com este lançamento recorrente?
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isDeletingRecurringTemplate}
                  onClick={async () => {
                    try {
                      await deleteRecurringTemplateAsync(deletingRecurringTemplateId, {
                        scope: "template_only",
                      });
                      setDeletingRecurringTemplateId(null);
                    } catch (err) {
                      console.error("Failed to delete recurring template:", err);
                      alert("Não foi possível excluir. Tente novamente.");
                    }
                  }}
                  className="w-full text-left p-4 rounded-interactive border border-noir-border hover:border-accent-primary hover:bg-accent-primary/5 transition-all disabled:opacity-50"
                >
                  <p className="font-medium text-heading text-sm">Só daqui pra frente</p>
                  <p className="text-xs text-muted mt-1">
                    Desativa o modelo e remove ocorrências em meses abertos. Meses já fechados
                    permanecem como estão.
                  </p>
                </button>
                <button
                  type="button"
                  disabled={isDeletingRecurringTemplate}
                  onClick={async () => {
                    try {
                      await deleteRecurringTemplateAsync(deletingRecurringTemplateId, {
                        scope: "full_history",
                      });
                      setDeletingRecurringTemplateId(null);
                    } catch (err) {
                      console.error("Failed to delete recurring template:", err);
                      alert("Não foi possível excluir. Tente novamente.");
                    }
                  }}
                  className="w-full text-left p-4 rounded-interactive border border-noir-border hover:border-accent-negative hover:bg-accent-negative/5 transition-all disabled:opacity-50"
                >
                  <p className="font-medium text-heading text-sm">Todo o histórico</p>
                  <p className="text-xs text-muted mt-1">
                    Desativa o template. Em meses já fechados os lançamentos são apenas
                    desvinculados (valores mantidos). Em meses abertos os lançamentos são excluídos.
                  </p>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setDeletingRecurringTemplateId(null)}
                className="w-full noir-btn-secondary py-2.5 mt-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
