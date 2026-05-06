"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { Card } from "@/components/ui/card";
import { useCategoriesData } from "@/features/categories/hooks/useCategoriesData";
import { useDefaultPayerData } from "@/features/people/hooks/useDefaultPayerData";
import { usePeopleData } from "@/features/people/hooks/usePeopleData";
import { useRecurringTemplateMutations } from "@/features/recurring-templates/hooks/useRecurringTemplateMutations";
import { MonthNavigator } from "@/features/transactions/components/MonthNavigator";
import { BulkEditModal } from "@/features/transactions/components/TransactionsView/BulkEditModal";
import { EditTransactionModal } from "@/features/transactions/components/TransactionsView/EditTransactionModal";
import { useOutlierDetection } from "@/features/transactions/hooks/useOutlierDetection";
import { useTransactionsData } from "@/features/transactions/hooks/useTransactionsData";
import { fetchJson } from "@/lib/apiClient";
import { toDateString } from "@/lib/dateUtils";
import { useCurrentMonth } from "@/lib/stores/currentMonthStore";
import type { Transaction, TransactionPatch } from "@/lib/types";

// Extracted Parts
import { BulkActionBar } from "./TransactionsView/BulkActionBar";
import { FiltersBar } from "./TransactionsView/FiltersBar";
import { InstallmentDeletePrompt } from "./TransactionsView/InstallmentDeletePrompt";
import { InstallmentEditPrompt } from "./TransactionsView/InstallmentEditPrompt";
import { NewTransactionSection } from "./TransactionsView/NewTransactionSection";
import { RecurringDeleteModal } from "./TransactionsView/RecurringDeleteModal";
import { SearchBar } from "./TransactionsView/SearchBar";
import { TotalSummaryRow } from "./TransactionsView/TotalSummaryRow";
import { TransactionsList } from "./TransactionsView/TransactionsList";
import { useSmartFill } from "./TransactionsView/hooks/useSmartFill";
import { useTransactionFilters } from "./TransactionsView/hooks/useTransactionFilters";
import { useTransactionModals } from "./TransactionsView/hooks/useTransactionModals";
import { useTransactionSelection } from "./TransactionsView/hooks/useTransactionSelection";
import { getVisibleTransactionsSummary } from "./TransactionsView/lib/calculationUtils";
import {
  createDefaultFormState,
  getCurrentYearMonth,
  isTransactionDateInSelectedMonth,
} from "./TransactionsView/lib/transactionUtils";

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
    isUpdatePending,
    isDeletePending,
    isBulkDeletePending,
  } = useTransactionsData();
  const { updateRecurringTemplate, deleteRecurringTemplateAsync, isDeletingRecurringTemplate } =
    useRecurringTemplateMutations();

  const { isOutlier } = useOutlierDetection(
    selectedMonthDate.getFullYear(),
    selectedMonthDate.getMonth() + 1,
  );

  const currentYearMonth = getCurrentYearMonth(selectedMonthDate);

  // Hooks
  const filters = useTransactionFilters(
    selectedMonthDate,
    (d) => isTransactionDateInSelectedMonth(d, currentYearMonth),
    isOutlier,
    categories,
    people,
  );

  const visibleTransactionsForSelectedMonth = transactionsForSelectedMonth.filter(filters.matches);

  const selection = useTransactionSelection(visibleTransactionsForSelectedMonth);
  const modals = useTransactionModals();

  // Derived visible transactions for summary
  const visibleTransactionsForCalculations = transactionsForCalculations
    .filter(filters.matches)
    .filter((transaction) => transaction.type !== "income" && transaction.type !== "transfer");
  const visibleCalculationIds = new Set(
    visibleTransactionsForCalculations.map((transaction) => transaction.id),
  );

  const summary = getVisibleTransactionsSummary(
    visibleTransactionsForSelectedMonth,
    visibleCalculationIds,
  );

  // Forms
  const newTransactionForm = useForm({
    defaultValues: createDefaultFormState(
      categories[0]?.id ?? "c1",
      defaultPayerId,
      currentYearMonth,
    ),
    onSubmit: async ({ value }) => {
      addTransactionsFromFormState(value);
      newTransactionForm.reset();
      newTransactionForm.setFieldValue("categoryId", categories[0]?.id ?? "c1");
      newTransactionForm.setFieldValue("paidBy", defaultPayerId);
      newTransactionForm.setFieldValue("selectedMonth", currentYearMonth);
      const today = new Date();
      newTransactionForm.setFieldValue("date", toDateString(today));
      newTransactionForm.setFieldValue("dateSelectionMode", "specific");
      newTransactionForm.setFieldValue("dayOfMonth", today.getDate());
      if (filters.viewMode === "creditCard") {
        newTransactionForm.setFieldValue("isCreditCard", true);
        newTransactionForm.setFieldValue("isNextBilling", false);
      }
      smartFill.setSmartInput("");
    },
  });

  const smartFill = useSmartFill(
    categories,
    people,
    defaultPayerId,
    selectedMonthDate,
    newTransactionForm.setFieldValue,
  );

  const { data: installmentGroupInfo, isLoading: isInstallmentGroupLoading } = useQuery({
    queryKey: ["transaction-installment-group", modals.editingTransaction?.id],
    queryFn: async () => {
      const id = modals.editingTransaction?.id;
      if (id == null) {
        return {
          isGrouped: false,
          siblingIds: [] as number[],
          installmentTotal: 0,
          siblingCount: 0,
        };
      }
      return fetchJson<{
        isGrouped: boolean;
        siblingIds: number[];
        installmentTotal: number;
        siblingCount: number;
      }>(`/api/transactions/${id}/installment-group`);
    },
    enabled: Boolean(
      modals.editingTransaction && modals.editingTransaction.recurringTemplateId == null,
    ),
  });

  const editTransactionForm = useForm({
    defaultValues: createDefaultFormState(
      categories[0]?.id ?? "",
      defaultPayerId,
      currentYearMonth,
    ),
    onSubmit: async ({ value }) => {
      if (!modals.editingTransaction) return;
      if (!value.description || value.amount == null) return;

      if (modals.editingTransaction.recurringTemplateId != null) {
        const selectedDay = (() => {
          if (value.dayOfMonth) return value.dayOfMonth;
          const day = Number.parseInt(value.date.split("-")[2] ?? "1", 10);
          return Number.isFinite(day) ? day : 1;
        })();
        const isNonExpense = value.type !== "expense";

        updateRecurringTemplate(
          modals.editingTransaction.recurringTemplateId,
          {
            description: value.description,
            amount: value.amount,
            categoryId: isNonExpense ? null : value.categoryId,
            paidBy: value.paidBy,
            type: value.type,
            isIncrement: value.isIncrement,
            isCreditCard: isNonExpense ? false : value.isCreditCard,
            isNextBilling: isNonExpense ? false : value.isNextBilling,
            excludeFromSplit: isNonExpense ? false : value.excludeFromSplit,
            dayOfMonth: selectedDay,
            isActive: value.isRecurring,
          },
          { scope: modals.recurringEditScope },
        );
        modals.setEditingTransaction(null);
        return;
      }

      const isTransferEdit = value.type === "transfer";
      const shouldClearCategoryOnEdit = value.type === "income" || isTransferEdit;
      const patch: TransactionPatch = {
        description: value.description,
        amount: value.amount,
        categoryId: shouldClearCategoryOnEdit ? null : value.categoryId,
        paidBy: value.paidBy,
        isCreditCard: isTransferEdit ? false : value.isCreditCard,
        isNextBilling: isTransferEdit ? false : value.isNextBilling,
        excludeFromSplit: isTransferEdit ? false : value.excludeFromSplit,
        isForecast: value.isForecast,
        date: value.date,
        type: value.type,
        isIncrement: value.isIncrement,
        isRecurring: value.isRecurring,
        transferToPersonId: isTransferEdit ? (value.transferToPersonId ?? null) : null,
        referenceDate: isTransferEdit ? value.referenceDate || null : undefined,
      };

      const isParcelamentoGroup =
        installmentGroupInfo?.isGrouped === true &&
        installmentGroupInfo.siblingCount > 1 &&
        value.isRecurring !== true;

      if (isParcelamentoGroup) {
        modals.setInstallmentEditPrompt({
          transactionId: modals.editingTransaction.id,
          patch,
          installmentTotal: installmentGroupInfo.installmentTotal,
          siblingCount: installmentGroupInfo.siblingCount,
        });
        return;
      }

      updateTransactionById(modals.editingTransaction.id, patch);
      modals.setEditingTransaction(null);
    },
  });

  // Effects
  useEffect(() => {
    newTransactionForm.setFieldValue("paidBy", defaultPayerId);
  }, [defaultPayerId, newTransactionForm]);

  useEffect(() => {
    if (categories[0]) {
      newTransactionForm.setFieldValue("categoryId", categories[0].id);
    }
  }, [categories, newTransactionForm]);

  // Handlers
  const handleOpenEditModal = (transaction: Transaction) => {
    modals.setEditingTransaction(transaction);
    modals.setRecurringEditScope("template_only");

    const dateParts = transaction.date.split("-");
    const day = dateParts[2] ? Number.parseInt(dateParts[2], 10) : 1;
    const isFirstOfMonth = day === 1;
    const selectedMonth =
      dateParts[0] && dateParts[1] ? `${dateParts[0]}-${dateParts[1]}` : currentYearMonth;

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
    editTransactionForm.setFieldValue("transferToPersonId", transaction.transferToPersonId ?? null);
    editTransactionForm.setFieldValue("referenceDate", transaction.referenceDate ?? "");
  };

  const handleNonRecurringDeleteRequest = async (transaction: Transaction) => {
    modals.setIsResolvingDeleteGroupId(transaction.id);
    try {
      const info = await fetchJson<{
        isGrouped: boolean;
        siblingIds: number[];
        installmentTotal: number;
        siblingCount: number;
      }>(`/api/transactions/${transaction.id}/installment-group`);
      if (info.isGrouped && info.siblingCount > 1) {
        modals.setInstallmentDeletePrompt({
          transactionId: transaction.id,
          description: transaction.description,
          installmentTotal: info.installmentTotal,
          siblingCount: info.siblingCount,
          siblingIds: info.siblingIds,
        });
        return;
      }
      deleteTransactionById(transaction.id);
    } catch (error) {
      console.error("Failed to resolve installment group for delete:", error);
      deleteTransactionById(transaction.id);
    } finally {
      modals.setIsResolvingDeleteGroupId(null);
    }
  };

  const handleSaveBulkEdit = () => {
    if (selection.selectedIds.size === 0) return;

    const patch: Record<string, unknown> = {};
    const { bulkEditFormState } = modals;
    if (bulkEditFormState.categoryId !== null) patch.categoryId = bulkEditFormState.categoryId;
    if (bulkEditFormState.paidBy !== null) patch.paidBy = bulkEditFormState.paidBy;
    if (bulkEditFormState.isCreditCard !== null)
      patch.isCreditCard = bulkEditFormState.isCreditCard;
    if (bulkEditFormState.isNextBilling !== null)
      patch.isNextBilling = bulkEditFormState.isNextBilling;
    if (bulkEditFormState.excludeFromSplit !== null)
      patch.excludeFromSplit = bulkEditFormState.excludeFromSplit;

    if (Object.keys(patch).length === 0) {
      modals.setIsBulkEditModalOpen(false);
      return;
    }

    bulkUpdateTransactions(
      Array.from(selection.selectedIds),
      patch as Parameters<typeof bulkUpdateTransactions>[1],
    );
    modals.setIsBulkEditModalOpen(false);
    selection.setSelectedIds(new Set());
    selection.setIsSelectionMode(false);
  };

  const handleBulkDelete = () => {
    if (selection.selectedIds.size === 0) return;
    if (selection.hasRecurringSelection) return;
    if (!confirm(`Excluir ${selection.selectedIds.size} lançamento(s) selecionado(s)?`)) return;

    bulkDeleteTransactions(Array.from(selection.selectedIds));
    selection.setSelectedIds(new Set());
    selection.setIsSelectionMode(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <MonthNavigator />

      <NewTransactionSection
        form={newTransactionForm}
        smartInput={smartFill.smartInput}
        onSmartInputChange={smartFill.setSmartInput}
        onSmartFill={smartFill.handleSmartFill}
        aiLoading={smartFill.aiLoading}
        viewMode={filters.viewMode}
        onViewModeChange={(mode) => {
          filters.setViewMode(mode);
          newTransactionForm.setFieldValue("isCreditCard", mode === "creditCard");
          newTransactionForm.setFieldValue("isNextBilling", false);
        }}
      />

      <Card>
        <FiltersBar
          filters={filters}
          people={people}
          categories={categories}
          visibleCount={visibleTransactionsForSelectedMonth.length}
          isSelectionMode={selection.isSelectionMode}
          onToggleSelectionMode={selection.toggleSelectionMode}
        />

        {filters.isSearchOpen && (
          <SearchBar
            searchQuery={filters.searchQuery}
            onSearchQueryChange={filters.setSearchQuery}
            onClose={() => filters.setIsSearchOpen(false)}
          />
        )}

        {selection.isSelectionMode && (
          <BulkActionBar
            selectedCount={selection.selectedIds.size}
            hasRecurringSelection={selection.hasRecurringSelection}
            onSelectAll={selection.selectAllVisibleTransactions}
            onClearSelection={selection.clearSelection}
            onOpenBulkEdit={() => {
              if (selection.selectedIds.size === 0 || selection.hasRecurringSelection) return;
              modals.setBulkEditFormState({
                categoryId: null,
                paidBy: null,
                isCreditCard: null,
                isNextBilling: null,
                excludeFromSplit: null,
              });
              modals.setIsBulkEditModalOpen(true);
            }}
            onBulkDelete={handleBulkDelete}
          />
        )}

        <TransactionsList
          transactions={visibleTransactionsForSelectedMonth}
          categories={categories}
          people={people}
          isOutlier={isOutlier}
          isSelectionMode={selection.isSelectionMode}
          selectedIds={selection.selectedIds}
          onToggleSelection={selection.toggleTransactionSelection}
          onEdit={handleOpenEditModal}
          onMarkAsHappened={(id) => updateTransactionById(id, { isForecast: false })}
          onDeleteRequest={(transaction) => {
            if (transaction.recurringTemplateId != null) {
              modals.setDeletingRecurringTemplateId(transaction.recurringTemplateId as number);
            } else {
              void handleNonRecurringDeleteRequest(transaction);
            }
          }}
          isResolvingDeleteGroupId={modals.isResolvingDeleteGroupId}
          searchQuery={filters.searchQuery}
          typeFilter={filters.typeFilter}
          paidByFilter={filters.paidByFilter}
          categoryFilterSize={filters.categoryFilter.size}
          creditCardFilter={filters.creditCardFilter}
          isTransactionDateInSelectedMonth={(d) =>
            isTransactionDateInSelectedMonth(d, currentYearMonth)
          }
        />

        <TotalSummaryRow
          typeFilter={filters.typeFilter}
          visibleCount={visibleTransactionsForSelectedMonth.length}
          incomeCount={summary.incomeCount}
          expenseCount={summary.expenseCount}
          transferCount={summary.transferCount}
          incomeTotal={summary.incomeTotal}
          expenseTotal={summary.expenseTotal}
          transferTotal={summary.transferTotal}
          totalVisible={visibleTransactionsForSelectedMonth.length}
        />
      </Card>

      {modals.editingTransaction && (
        <EditTransactionModal
          form={editTransactionForm}
          onClose={() => {
            modals.setEditingTransaction(null);
            modals.setInstallmentEditPrompt(null);
          }}
          editingTransaction={modals.editingTransaction}
          recurringEditScope={modals.recurringEditScope}
          onRecurringEditScopeChange={modals.setRecurringEditScope}
          viewMode={filters.viewMode}
          isSubmitDisabled={
            modals.editingTransaction.recurringTemplateId == null && isInstallmentGroupLoading
          }
        />
      )}

      {modals.installmentEditPrompt && (
        <InstallmentEditPrompt
          {...modals.installmentEditPrompt}
          isUpdatePending={isUpdatePending}
          onApplyToThisOnly={() => {
            if (modals.installmentEditPrompt) {
              updateTransactionById(
                modals.installmentEditPrompt.transactionId,
                modals.installmentEditPrompt.patch,
              );
              modals.setEditingTransaction(null);
              modals.setInstallmentEditPrompt(null);
            }
          }}
          onApplyToAll={() => {
            if (modals.installmentEditPrompt) {
              updateTransactionById(
                modals.installmentEditPrompt.transactionId,
                modals.installmentEditPrompt.patch,
                { installmentUpdateScope: "all" },
              );
              modals.setEditingTransaction(null);
              modals.setInstallmentEditPrompt(null);
            }
          }}
          onClose={() => modals.setInstallmentEditPrompt(null)}
        />
      )}

      {modals.installmentDeletePrompt && (
        <InstallmentDeletePrompt
          {...modals.installmentDeletePrompt}
          isDeletePending={isDeletePending || isBulkDeletePending}
          onDeleteThisOnly={() => {
            if (modals.installmentDeletePrompt) {
              deleteTransactionById(modals.installmentDeletePrompt.transactionId);
              modals.setInstallmentDeletePrompt(null);
            }
          }}
          onDeleteAll={() => {
            if (modals.installmentDeletePrompt) {
              bulkDeleteTransactions(modals.installmentDeletePrompt.siblingIds);
              modals.setInstallmentDeletePrompt(null);
            }
          }}
          onClose={() => modals.setInstallmentDeletePrompt(null)}
        />
      )}

      {modals.isBulkEditModalOpen && (
        <BulkEditModal
          formState={modals.bulkEditFormState}
          onFormStateChange={modals.setBulkEditFormState}
          categories={categories}
          people={people}
          selectedCount={selection.selectedIds.size}
          onClose={() => modals.setIsBulkEditModalOpen(false)}
          onSave={handleSaveBulkEdit}
          isSaveDisabled={
            modals.bulkEditFormState.categoryId === null &&
            modals.bulkEditFormState.paidBy === null &&
            modals.bulkEditFormState.isCreditCard === null &&
            modals.bulkEditFormState.isNextBilling === null &&
            modals.bulkEditFormState.excludeFromSplit === null
          }
        />
      )}

      {modals.deletingRecurringTemplateId !== null && (
        <RecurringDeleteModal
          isDeleting={isDeletingRecurringTemplate}
          onDeleteTemplateOnly={async () => {
            if (modals.deletingRecurringTemplateId !== null) {
              try {
                await deleteRecurringTemplateAsync(modals.deletingRecurringTemplateId, {
                  scope: "template_only",
                });
                modals.setDeletingRecurringTemplateId(null);
              } catch (err) {
                console.error("Failed to delete recurring template:", err);
                alert("Não foi possível excluir. Tente novamente.");
              }
            }
          }}
          onDeleteFullHistory={async () => {
            if (modals.deletingRecurringTemplateId !== null) {
              try {
                await deleteRecurringTemplateAsync(modals.deletingRecurringTemplateId, {
                  scope: "full_history",
                });
                modals.setDeletingRecurringTemplateId(null);
              } catch (err) {
                console.error("Failed to delete recurring template:", err);
                alert("Não foi possível excluir. Tente novamente.");
              }
            }
          }}
          onClose={() => modals.setDeletingRecurringTemplateId(null)}
        />
      )}
    </div>
  );
}
