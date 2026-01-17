import { NextResponse } from "next/server";

import { bulkDeleteTransactions, bulkUpdateTransactions } from "@/lib/server/financeStore";
import { readJsonBody } from "@/lib/server/requestBodyValidation";
import type { Transaction } from "@/lib/types";

type BulkTransactionPatch = Partial<
  Pick<
    Transaction,
    "categoryId" | "paidBy" | "isRecurring" | "isCreditCard" | "excludeFromSplit" | "type" | "isIncrement"
  >
>;

function isValidBulkTransactionPatch(value: unknown): value is BulkTransactionPatch {
  if (value == null || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if ("categoryId" in record && typeof record.categoryId !== "string") return false;
  if ("paidBy" in record && typeof record.paidBy !== "string") return false;
  if ("isRecurring" in record && typeof record.isRecurring !== "boolean") return false;
  if ("isCreditCard" in record && typeof record.isCreditCard !== "boolean") return false;
  if ("excludeFromSplit" in record && typeof record.excludeFromSplit !== "boolean") return false;
  if ("type" in record && record.type !== "expense" && record.type !== "income") return false;
  if ("isIncrement" in record && typeof record.isIncrement !== "boolean") return false;
  return true;
}

function isValidIdArray(value: unknown): value is number[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => typeof item === "number" && Number.isFinite(item));
}

export async function PATCH(request: Request) {
  const body = await readJsonBody(request);
  if (body == null || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { ids, patch } = body as Record<string, unknown>;

  if (!isValidIdArray(ids)) {
    return NextResponse.json({ error: "Invalid ids - expected array of numbers" }, { status: 400 });
  }

  if (ids.length === 0) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }

  if (!isValidBulkTransactionPatch(patch)) {
    return NextResponse.json({ error: "Invalid patch" }, { status: 400 });
  }

  try {
    const updated = await bulkUpdateTransactions(ids, patch);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to bulk update transactions", error);
    return NextResponse.json({ error: "Failed to bulk update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const body = await readJsonBody(request);
  if (body == null || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { ids } = body as Record<string, unknown>;

  if (!isValidIdArray(ids)) {
    return NextResponse.json({ error: "Invalid ids - expected array of numbers" }, { status: 400 });
  }

  if (ids.length === 0) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }

  try {
    await bulkDeleteTransactions(ids);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to bulk delete transactions", error);
    return NextResponse.json({ error: "Failed to bulk delete" }, { status: 500 });
  }
}
