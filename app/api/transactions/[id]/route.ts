import { NextResponse } from "next/server";

import { getState, setState } from "@/lib/server/financeStore";
import type { Transaction } from "@/lib/types";

function isValidTransactionPatch(input: unknown): input is Partial<Omit<Transaction, "id">> {
  if (!input || typeof input !== "object") return false;
  const obj = input as Record<string, unknown>;

  if ("description" in obj && typeof obj.description !== "string") return false;
  if ("amount" in obj && typeof obj.amount !== "number") return false;
  if ("categoryId" in obj && typeof obj.categoryId !== "string") return false;
  if ("paidBy" in obj && typeof obj.paidBy !== "string") return false;
  if ("isRecurring" in obj && typeof obj.isRecurring !== "boolean") return false;
  if ("date" in obj && typeof obj.date !== "string") return false;

  return true;
}

function parseId(param: string): number | null {
  const n = Number(param);
  return Number.isFinite(n) ? n : null;
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (id == null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const state = getState();
  const tx = state.transactions.find((t) => t.id === id);
  if (!tx) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(tx);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (id == null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  if (!isValidTransactionPatch(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const state = getState();
  const idx = state.transactions.findIndex((t) => t.id === id);
  if (idx < 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const next = { ...state.transactions[idx], ...body } satisfies Transaction;
  const transactions = state.transactions.slice();
  transactions[idx] = next;

  setState({ ...state, transactions });
  return NextResponse.json(next);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (id == null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const state = getState();
  const exists = state.transactions.some((t) => t.id === id);
  if (!exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  setState({ ...state, transactions: state.transactions.filter((t) => t.id !== id) });
  return NextResponse.json({ ok: true });
}
