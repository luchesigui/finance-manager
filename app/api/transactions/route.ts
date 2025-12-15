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

export async function GET(request: Request) {
  const state = getState();
  const url = new URL(request.url);

  const year = url.searchParams.get("year");
  const month = url.searchParams.get("month");

  if (year && month) {
    const y = Number.parseInt(year, 10);
    const m = Number.parseInt(month, 10);
    const filtered = state.transactions.filter((t) => {
      const [ty, tm] = t.date.split("-");
      return Number.parseInt(ty, 10) === y && Number.parseInt(tm, 10) === m;
    });
    return NextResponse.json(filtered);
  }

  return NextResponse.json(state.transactions);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;

  const items = Array.isArray(body) ? body : [body];
  if (items.length === 0) {
    return NextResponse.json({ error: "Empty payload" }, { status: 400 });
  }

  const required: Array<keyof Omit<Transaction, "id">> = [
    "description",
    "amount",
    "categoryId",
    "paidBy",
    "isRecurring",
    "date",
  ];

  const nextTransactions: Transaction[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as unknown;
    if (!isValidTransactionPatch(item)) {
      return NextResponse.json({ error: `Invalid item at index ${i}` }, { status: 400 });
    }
    for (const k of required) {
      if (!(k in (item as Record<string, unknown>))) {
        return NextResponse.json(
          { error: `Missing field: ${String(k)} (item ${i})` },
          { status: 400 },
        );
      }
    }

    const data = item as Omit<Transaction, "id">;
    nextTransactions.push({ id: Date.now() + i, ...data });
  }

  const state = getState();
  setState({ ...state, transactions: [...nextTransactions, ...state.transactions] });

  return NextResponse.json(Array.isArray(body) ? nextTransactions : nextTransactions[0], {
    status: 201,
  });
}
