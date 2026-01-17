import { NextResponse } from "next/server";

import { deleteTransaction, getTransaction, updateTransaction } from "@/lib/server/financeStore";
import {
  parseNumericId,
  readJsonBody,
  validateTransactionPatch,
} from "@/lib/server/requestBodyValidation";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH /api/transactions/:id
 * Updates a transaction by ID.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const transactionId = parseNumericId(id);

  if (transactionId === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await readJsonBody(request);
  const validation = validateTransactionPatch(body);

  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.errorMessage },
      { status: validation.statusCode ?? 400 },
    );
  }

  try {
    const existing = await getTransaction(transactionId);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await updateTransaction(transactionId, validation.value);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

/**
 * DELETE /api/transactions/:id
 * Deletes a transaction by ID.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const transactionId = parseNumericId(id);

  if (transactionId === null) {
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
    console.error("Failed to delete transaction:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
