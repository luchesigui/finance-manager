import { NextResponse } from "next/server";

import { getState, setState } from "@/lib/server/financeStore";

function parseTransactionId(transactionIdParam: string): number | null {
  const parsed = Number(transactionIdParam);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const transactionId = parseTransactionId(params.id);
  if (transactionId == null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const state = getState();
  const hasTransaction = state.transactions.some((transaction) => transaction.id === transactionId);

  if (!hasTransaction) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  setState({
    ...state,
    transactions: state.transactions.filter((transaction) => transaction.id !== transactionId),
  });

  return NextResponse.json({ ok: true });
}
