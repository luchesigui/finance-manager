import { NextResponse } from "next/server";

import { getState, setState } from "@/lib/server/financeStore";
import { readJsonBody, validateCreateTransactionsBody } from "@/lib/server/requestBodyValidation";
import type { Transaction } from "@/lib/types";

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
  const body = await readJsonBody(request);
  const validationResult = validateCreateTransactionsBody(body);

  if (!validationResult.isValid) {
    return NextResponse.json(
      { error: validationResult.errorMessage },
      { status: validationResult.statusCode ?? 400 },
    );
  }

  const createdTransactions: Transaction[] = validationResult.value.transactions.map(
    (transactionCreatePayload, payloadIndex) => ({
      id: Date.now() + payloadIndex,
      ...transactionCreatePayload,
    }),
  );

  const state = getState();
  setState({ ...state, transactions: [...createdTransactions, ...state.transactions] });

  return NextResponse.json(
    validationResult.value.isBatch ? createdTransactions : createdTransactions[0],
    {
      status: 201,
    },
  );
}
