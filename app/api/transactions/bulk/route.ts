import { NextResponse } from "next/server";

import {
  bulkDeleteTransactions,
  bulkUpdateTransactions,
} from "@/features/transactions/server/store";
import { bulkDeleteBodySchema, bulkUpdateBodySchema } from "@/lib/schemas";
import { readJsonBody, requireAuth, validateBody } from "@/lib/server/requestBodyValidation";

/**
 * PATCH /api/transactions/bulk
 * Updates multiple transactions at once.
 */
export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const body = await readJsonBody(request);
  const validation = validateBody(body, bulkUpdateBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    const { ids, patch } = validation.data;
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
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const body = await readJsonBody(request);
  const validation = validateBody(body, bulkDeleteBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    await bulkDeleteTransactions(validation.data.ids);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to bulk delete transactions:", error);
    return NextResponse.json({ error: "Failed to bulk delete" }, { status: 500 });
  }
}
