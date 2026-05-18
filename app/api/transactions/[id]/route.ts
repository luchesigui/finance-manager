import { NextResponse } from "next/server";

import {
  createRecurringTemplate,
  getRecurringTemplate,
} from "@/features/recurring-templates/server/store";
import { updateInstallmentGroupTransactions } from "@/features/transactions/server/installmentGroup";
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  updateTransaction,
} from "@/features/transactions/server/store";
import { updateTransactionBodySchema } from "@/lib/schemas";
import {
  parseNumericId,
  parseSignedId,
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
 *
 * If the ID is negative, the transaction is virtual (unmaterialized recurring entry).
 * In that case, `recurringTemplateId` must be present in the body and a real DB row
 * is created instead of updated.
 *
 * For positive IDs, the existing row is updated. When patch.isRecurring is true and
 * the transaction has no template, a recurring template is created and linked.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const { id } = await params;
  const transactionId = parseSignedId(id);

  if (transactionId === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await readJsonBody(request);
  const validation = validateBody(body, updateTransactionBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  const rawPatch = validation.data.patch as TransactionPatch;
  const installmentUpdateScope = validation.data.installmentUpdateScope;
  const recurringTemplateId = validation.data.recurringTemplateId;

  // Virtual transaction: negative ID means the recurring entry hasn't been materialized yet.
  // Create a real DB row linked to the template so it replaces the virtual entry.
  if (transactionId < 0) {
    if (!recurringTemplateId) {
      return NextResponse.json(
        { error: "recurringTemplateId is required for virtual transactions" },
        { status: 400 },
      );
    }

    const { description, amount, paidBy, date } = rawPatch;
    if (!description || amount == null || !paidBy || !date) {
      return NextResponse.json(
        { error: "description, amount, paidBy and date are required" },
        { status: 400 },
      );
    }

    const isTransfer = rawPatch.type === "transfer";
    const isIncome = rawPatch.type === "income";
    const shouldClearCategory = isIncome || isTransfer;

    try {
      const template = await getRecurringTemplate(recurringTemplateId);
      const created = await createTransaction({
        description,
        amount,
        categoryId: shouldClearCategory ? null : (rawPatch.categoryId ?? null),
        paidBy,
        recurringTemplateId,
        isCreditCard: isTransfer || isIncome ? false : (rawPatch.isCreditCard ?? false),
        isNextBilling: isTransfer || isIncome ? false : (rawPatch.isNextBilling ?? false),
        excludeFromSplit: isTransfer || isIncome ? false : (rawPatch.excludeFromSplit ?? false),
        isForecast: rawPatch.isForecast ?? false,
        date,
        type: rawPatch.type ?? "expense",
        isIncrement: rawPatch.isIncrement ?? true,
        transferToPersonId: isTransfer ? (rawPatch.transferToPersonId ?? null) : null,
        referenceDate: isTransfer ? (rawPatch.referenceDate ?? null) : null,
        createdAt: template?.createdAt,
      });
      return NextResponse.json(created);
    } catch (error) {
      console.error("Failed to materialize virtual transaction:", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
  }

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
      const isNonExpense = type === "income" || type === "transfer";
      const isTransfer = type === "transfer";
      const template = await createRecurringTemplate({
        description: rawPatch.description ?? existing.description,
        amount: rawPatch.amount ?? existing.amount,
        categoryId: isNonExpense ? null : (rawPatch.categoryId ?? existing.categoryId ?? null),
        paidBy: rawPatch.paidBy ?? existing.paidBy,
        type,
        isIncrement: rawPatch.isIncrement ?? existing.isIncrement ?? true,
        isCreditCard: isNonExpense
          ? false
          : (rawPatch.isCreditCard ?? existing.isCreditCard ?? false),
        isNextBilling: isNonExpense
          ? false
          : (rawPatch.isNextBilling ?? existing.isNextBilling ?? false),
        excludeFromSplit: isNonExpense
          ? false
          : (rawPatch.excludeFromSplit ?? existing.excludeFromSplit ?? false),
        dayOfMonth,
        isActive: true,
        transferToPersonId: isTransfer
          ? (rawPatch.transferToPersonId ?? existing.transferToPersonId ?? null)
          : null,
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

    if (
      installmentUpdateScope === "all" &&
      existing.recurringTemplateId == null &&
      rawPatch.isRecurring !== true
    ) {
      const updated = await updateInstallmentGroupTransactions(transactionId, basePatch);
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
