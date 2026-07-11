import { apiDelete, apiPost, apiPut } from "@/lib/api";
import type { CreatedApiKey, RecurrenceOption, TransactionType } from "@/lib/types";
import type { PillarTargets } from "@/utils/pillars";
import { mutate } from "swr";

// Edits com option=all|future afetam meses além do que está na tela,
// então revalidamos toda chave de transações em cache.
const revalidateTransactions = () =>
  mutate((key) => typeof key === "string" && key.startsWith("/api/transactions"));

export interface CreateTransactionPayload {
  description: string;
  amount: number; // em centavos
  date: string; // YYYY-MM-DD
  categoryId?: string | null;
  createdByUserId?: string | null;
  assignedToUserId?: string | null;
  paraQuemUserId?: string | null;
  isCreditCard?: boolean;
  nextInvoice?: boolean;
  naoEntraDivisao?: boolean;
  isPrevisao?: boolean;
  isRecorrente?: boolean;
  isParcelado?: boolean;
  numParcelas?: number | null;
  transactionType?: TransactionType;
}

export interface UpdateTransactionFields {
  description?: string;
  amount?: number; // em centavos
  categoryId?: string | null;
  date?: string;
  assignedToUserId?: string;
  paraQuemUserId?: string | null;
  isCreditCard?: boolean;
  nextInvoice?: boolean;
  naoEntraDivisao?: boolean;
  isPrevisao?: boolean;
  transactionType?: TransactionType;
  ignored?: boolean;
}

export async function createTransaction(payload: CreateTransactionPayload) {
  const result = await apiPost("/api/transactions", payload);
  await revalidateTransactions();
  return result;
}

export async function updateTransaction(
  id: string,
  updatedFields: UpdateTransactionFields,
  option: RecurrenceOption = "only_this",
) {
  const result = await apiPut(`/api/transactions/${id}`, { updatedFields, option });
  await revalidateTransactions();
  return result;
}

export async function deleteTransaction(id: string, option: RecurrenceOption = "only_this") {
  const result = await apiDelete(`/api/transactions/${id}?option=${option}`);
  await revalidateTransactions();
  return result;
}

export async function confirmTransaction(id: string) {
  const result = await apiPost(`/api/transactions/${id}/confirm`);
  await revalidateTransactions();
  return result;
}

export async function createCategory(name: string, slug: string, pillarSlug: string) {
  const result = await apiPost<{ success: boolean; id: string }>("/api/categories", {
    name,
    slug,
    pillarSlug,
  });
  await mutate("/api/categories");
  return result;
}

export async function deleteCategory(id: string) {
  const result = await apiDelete(`/api/categories/${id}`);
  await mutate("/api/categories");
  return result;
}

export interface UpdateSettingsPayload {
  defaultPayerId?: string;
  emergencyFund?: number; // em centavos
  openrouterKey?: string | null;
  pillarTargets?: PillarTargets;
}

export async function updateSettings(payload: UpdateSettingsPayload) {
  const result = await apiPut("/api/settings", payload);
  await mutate("/api/settings");
  return result;
}

export async function createApiKey(name: string) {
  const result = await apiPost<{ success: boolean } & CreatedApiKey>("/api/api-keys", { name });
  await mutate("/api/api-keys");
  return result;
}

export async function revokeApiKey(id: string) {
  const result = await apiDelete(`/api/api-keys/${id}`);
  await mutate("/api/api-keys");
  return result;
}
