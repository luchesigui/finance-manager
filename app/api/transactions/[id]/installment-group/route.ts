import { NextResponse } from "next/server";

import { findInstallmentGroupMembers } from "@/features/transactions/server/installmentGroup";
import { parseNumericId, requireAuth } from "@/lib/server/requestBodyValidation";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/transactions/:id/installment-group
 * Returns whether the transaction belongs to a multi-month installment group (parcelamento).
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const { id } = await params;
  const transactionId = parseNumericId(id);

  if (transactionId === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const members = await findInstallmentGroupMembers(transactionId);
    if (!members) {
      return NextResponse.json({
        isGrouped: false,
        siblingIds: [] as number[],
        installmentTotal: 0,
        siblingCount: 0,
      });
    }

    return NextResponse.json({
      isGrouped: true,
      siblingIds: members.map((m) => m.id),
      installmentTotal: members[0].total,
      siblingCount: members.length,
    });
  } catch (error) {
    console.error("Failed to resolve installment group:", error);
    return NextResponse.json({ error: "Failed to resolve installment group" }, { status: 500 });
  }
}
