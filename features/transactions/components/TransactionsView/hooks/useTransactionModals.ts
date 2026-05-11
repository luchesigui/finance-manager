import type { Transaction, TransactionPatch } from "@/lib/types";
import { useState } from "react";

export function useTransactionModals() {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [installmentEditPrompt, setInstallmentEditPrompt] = useState<{
    transactionId: number;
    patch: TransactionPatch;
    installmentTotal: number;
    siblingCount: number;
  } | null>(null);
  const [installmentDeletePrompt, setInstallmentDeletePrompt] = useState<{
    transactionId: number;
    description: string;
    installmentTotal: number;
    siblingCount: number;
    siblingIds: number[];
  } | null>(null);
  const [isResolvingDeleteGroupId, setIsResolvingDeleteGroupId] = useState<number | null>(null);
  const [deletingRecurringTemplateId, setDeletingRecurringTemplateId] = useState<number | null>(
    null,
  );
  const [recurringEditScope, setRecurringEditScope] = useState<
    "template_only" | "full_history" | "current_only"
  >("template_only");

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

  return {
    editingTransaction,
    setEditingTransaction,
    installmentEditPrompt,
    setInstallmentEditPrompt,
    installmentDeletePrompt,
    setInstallmentDeletePrompt,
    isResolvingDeleteGroupId,
    setIsResolvingDeleteGroupId,
    deletingRecurringTemplateId,
    setDeletingRecurringTemplateId,
    recurringEditScope,
    setRecurringEditScope,
    isBulkEditModalOpen,
    setIsBulkEditModalOpen,
    bulkEditFormState,
    setBulkEditFormState,
  };
}

export type UseTransactionModals = ReturnType<typeof useTransactionModals>;
