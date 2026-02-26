import { NextResponse } from "next/server";

import { createRecurringTemplate } from "@/features/recurring-templates/server/store";
import {
  deleteTransaction,
  getTransaction,
  updateTransaction,
} from "@/features/transactions/server/store";
import { updateTransactionBodySchema } from "@/lib/schemas";
import {
  parseNumericId,
  readJsonBody,
  requireAuth,
  validateBody,
} from "@/lib/server/requestBodyValidation";
import type { TransactionPatch } from "@/lib/types";

type RouteParams = { params: Promise<{ id: string }> };

function stripIsRecurring(patch: TransactionPatch): Omit<TransactionPatch, "isRecurring"> {
  const { isRecurring: _isRecurring, ...rest } = patch;
  return rest;
}

/**
 * PATCH /api/transactions/:id
 * Updates a transaction by ID.
 * When patch.isRecurring is true and the transaction has no template, creates a recurring template and links this transaction only (from current month onward). Previous transactions are unchanged.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const { id } = await params;
  const transactionId = parseNumericId(id);

  if (transactionId === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await readJsonBody(request);
  const validation = validateBody(body, updateTransactionBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  const rawPatch = validation.data.patch as TransactionPatch;

  try {
    const existing = await getTransaction(transactionId);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const basePatch = stripIsRecurring(rawPatch);

    if (rawPatch.isRecurring === true && existing.recurringTemplateId == null) {
      const effectiveDate = rawPatch.date ?? existing.date;
      const day = Number.parseInt(effectiveDate.split("-")[2] ?? "1", 10);
      const dayOfMonth = Number.isFinite(day) && day >= 1 && day <= 31 ? day : 1;
      const type = rawPatch.type ?? existing.type ?? "expense";
      const isIncome = type === "income";
      const template = await createRecurringTemplate({
        description: rawPatch.description ?? existing.description,
        amount: rawPatch.amount ?? existing.amount,
        categoryId: isIncome ? null : (rawPatch.categoryId ?? existing.categoryId ?? null),
        paidBy: rawPatch.paidBy ?? existing.paidBy,
        type,
        isIncrement: rawPatch.isIncrement ?? existing.isIncrement ?? true,
        isCreditCard: isIncome ? false : (rawPatch.isCreditCard ?? existing.isCreditCard ?? false),
        isNextBilling: isIncome
          ? false
          : (rawPatch.isNextBilling ?? existing.isNextBilling ?? false),
        excludeFromSplit: isIncome
          ? false
          : (rawPatch.excludeFromSplit ?? existing.excludeFromSplit ?? false),
        dayOfMonth,
        isActive: true,
      });
      const updated = await updateTransaction(transactionId, {
        ...basePatch,
        recurringTemplateId: template.id,
      });
      return NextResponse.json(updated);
    }

    if (rawPatch.isRecurring === false && existing.recurringTemplateId != null) {
      const updated = await updateTransaction(transactionId, {
        ...basePatch,
        recurringTemplateId: null,
      });
      return NextResponse.json(updated);
    }

    const updated = await updateTransaction(transactionId, basePatch);
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
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

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
