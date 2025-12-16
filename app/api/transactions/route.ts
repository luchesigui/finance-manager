import { NextResponse } from "next/server";

import { createTransaction, getTransactions } from "@/lib/server/financeStore";
import { readJsonBody, validateCreateTransactionsBody } from "@/lib/server/requestBodyValidation";
import type { Transaction } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const yearParam = url.searchParams.get("year");
  const monthParam = url.searchParams.get("month");

  let year: number | undefined;
  let month: number | undefined;

  if (yearParam && monthParam) {
    year = Number.parseInt(yearParam, 10);
    month = Number.parseInt(monthParam, 10);
  }

  const transactions = await getTransactions(year, month);
  return NextResponse.json(transactions);
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

  try {
    const createdTransactions = await Promise.all(
      validationResult.value.transactions.map((t) => createTransaction(t)),
    );

    return NextResponse.json(
      validationResult.value.isBatch ? createdTransactions : createdTransactions[0],
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Failed to create transactions", error);
    return NextResponse.json({ error: "Failed to create transactions" }, { status: 500 });
  }
}
