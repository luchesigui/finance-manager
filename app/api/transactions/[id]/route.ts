import { NextResponse } from "next/server";

import { deleteTransaction, getTransaction } from "@/lib/server/financeStore";

function parseTransactionId(transactionIdParam: string): number | null {
  const parsed = Number(transactionIdParam);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const transactionId = parseTransactionId(params.id);
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
