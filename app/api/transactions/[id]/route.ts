import { NextResponse } from "next/server";

import {
  deleteTransaction,
  getTransaction,
  updateTransaction,
  updateTransactionsByRecurringId,
} from "@/lib/server/financeStore";
import { readJsonBody, validateTransactionUpdateBody } from "@/lib/server/requestBodyValidation";

function parseTransactionId(transactionIdParam: string): number | null {
  const parsed = Number(transactionIdParam);
  return Number.isFinite(parsed) ? parsed : null;
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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transactionId = parseTransactionId(id);
  if (transactionId == null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await readJsonBody(request);
  const validationResult = validateTransactionUpdateBody(body);

  if (!validationResult.isValid) {
    return NextResponse.json({ error: validationResult.errorMessage }, { status: 400 });
  }

  const { patch, scope } = validationResult.value;

  try {
    const existingTransaction = await getTransaction(transactionId);
    if (!existingTransaction) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (scope === "single" || !existingTransaction.recurringId) {
      const updated = await updateTransaction(transactionId, patch);
      return NextResponse.json(updated);
    }

    const updatedTransactions = await updateTransactionsByRecurringId(
      existingTransaction.recurringId,
      patch,
      scope,
      existingTransaction.date,
    );

    return NextResponse.json(updatedTransactions);
  } catch (error) {
    console.error("Failed to update transaction", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
