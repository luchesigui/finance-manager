import { NextResponse } from "next/server";

import { bulkDeleteTransactions, bulkUpdateTransactions } from "@/lib/server/financeStore";
import {
  readJsonBody,
  validateBulkDeleteBody,
  validateBulkUpdateBody,
} from "@/lib/server/requestBodyValidation";

/**
 * PATCH /api/transactions/bulk
 * Updates multiple transactions at once.
 */
export async function PATCH(request: Request) {
  const body = await readJsonBody(request);
  const validation = validateBulkUpdateBody(body);

  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.errorMessage },
      { status: validation.statusCode ?? 400 },
    );
  }

  try {
    const { ids, patch } = validation.value;
    const updated = await bulkUpdateTransactions(ids, patch);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to bulk update transactions:", error);
    return NextResponse.json({ error: "Failed to bulk update" }, { status: 500 });
  }
}

/**
 * DELETE /api/transactions/bulk
 * Deletes multiple transactions at once.
 */
export async function DELETE(request: Request) {
  const body = await readJsonBody(request);
  const validation = validateBulkDeleteBody(body);

  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.errorMessage },
      { status: validation.statusCode ?? 400 },
    );
  }

  try {
    await bulkDeleteTransactions(validation.value.ids);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to bulk delete transactions:", error);
    return NextResponse.json({ error: "Failed to bulk delete" }, { status: 500 });
  }
}
