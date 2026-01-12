import { NextResponse } from "next/server";

import { deleteTransaction, getTransaction, updateTransaction } from "@/lib/server/financeStore";
import { readJsonBody } from "@/lib/server/requestBodyValidation";
import type { Transaction } from "@/lib/types";

function parseTransactionId(transactionIdParam: string): number | null {
  const parsed = Number(transactionIdParam);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidTransactionPatch(
  value: unknown,
): value is Partial<Pick<Transaction, "isCreditCard">> {
  if (value == null || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if ("isCreditCard" in record && typeof record.isCreditCard !== "boolean") return false;
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
