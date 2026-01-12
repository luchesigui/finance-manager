import { NextResponse } from "next/server";

import { deleteTransaction, getTransaction, updateTransaction } from "@/lib/server/financeStore";
import { readJsonBody } from "@/lib/server/requestBodyValidation";
import type { Transaction } from "@/lib/types";

function parseTransactionId(transactionIdParam: string): number | null {
  const parsed = Number(transactionIdParam);
  return Number.isFinite(parsed) ? parsed : null;
}

type TransactionPatch = Partial<
  Pick<
    Transaction,
    | "description"
    | "amount"
    | "categoryId"
    | "paidBy"
    | "isRecurring"
    | "isCreditCard"
    | "excludeFromSplit"
    | "date"
  >
>;

function isValidTransactionPatch(value: unknown): value is TransactionPatch {
  if (value == null || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if ("description" in record && typeof record.description !== "string") return false;
  if ("amount" in record && typeof record.amount !== "number") return false;
  if ("categoryId" in record && typeof record.categoryId !== "string") return false;
  if ("paidBy" in record && typeof record.paidBy !== "string") return false;
  if ("isRecurring" in record && typeof record.isRecurring !== "boolean") return false;
  if ("isCreditCard" in record && typeof record.isCreditCard !== "boolean") return false;
  if ("excludeFromSplit" in record && typeof record.excludeFromSplit !== "boolean") return false;
  if ("date" in record && typeof record.date !== "string") return false;
  return true;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transactionId = parseTransactionId(id);
  if (transactionId == null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await readJsonBody(request);
  if (body == null || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const patch = (body as Record<string, unknown>).patch;
  if (!isValidTransactionPatch(patch)) {
    return NextResponse.json({ error: "Invalid patch" }, { status: 400 });
  }

  try {
    const existing = await getTransaction(transactionId);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await updateTransaction(transactionId, patch);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update transaction", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transactionId = parseTransactionId(id);
  if (transactionId == null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const transaction = await getTransaction(transactionId);
    if (!transaction) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteTransaction(transactionId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete transaction", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
