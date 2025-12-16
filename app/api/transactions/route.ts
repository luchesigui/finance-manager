import { NextResponse } from "next/server";

import { getState, setState } from "@/lib/server/financeStore";
import type { Transaction } from "@/lib/types";

function isTransactionLike(input: unknown): input is Omit<Transaction, "id"> {
  if (!input || typeof input !== "object") return false;
  const record = input as Record<string, unknown>;

  return (
    typeof record.description === "string" &&
    typeof record.amount === "number" &&
    typeof record.categoryId === "string" &&
    typeof record.paidBy === "string" &&
    typeof record.isRecurring === "boolean" &&
    typeof record.date === "string"
  );
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

  const payloadItems = Array.isArray(body) ? body : [body];
  if (payloadItems.length === 0) {
    return NextResponse.json({ error: "Empty payload" }, { status: 400 });
  }

  const createdTransactions: Transaction[] = [];

  for (let payloadIndex = 0; payloadIndex < payloadItems.length; payloadIndex++) {
    const payloadItem = payloadItems[payloadIndex] as unknown;
    if (!isTransactionLike(payloadItem)) {
      return NextResponse.json(
        { error: `Invalid transaction at index ${payloadIndex}` },
        { status: 400 },
      );
    }
    createdTransactions.push({ id: Date.now() + payloadIndex, ...payloadItem });
  }

  const state = getState();
  setState({ ...state, transactions: [...createdTransactions, ...state.transactions] });

  return NextResponse.json(Array.isArray(body) ? createdTransactions : createdTransactions[0], {
    status: 201,
  });
}
