import { NextResponse } from "next/server";

import { createTransaction, getTransactions } from "@/lib/server/financeStore";
import { readJsonBody, validateCreateTransactionsBody } from "@/lib/server/requestBodyValidation";

export const dynamic = "force-dynamic";

/**
 * GET /api/transactions
 * Fetches transactions, optionally filtered by year and month.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const yearParam = url.searchParams.get("year");
    const monthParam = url.searchParams.get("month");

    const year = yearParam ? Number.parseInt(yearParam, 10) : undefined;
    const month = monthParam ? Number.parseInt(monthParam, 10) : undefined;

    const transactions = await getTransactions(year, month);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

/**
 * POST /api/transactions
 * Creates one or more transactions.
 * Accepts a single transaction object or an array of transactions.
 */
export async function POST(request: Request) {
  const body = await readJsonBody(request);
  const validation = validateCreateTransactionsBody(body);

  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.errorMessage },
      { status: validation.statusCode ?? 400 },
    );
  }

  try {
    const { isBatch, transactions } = validation.value;

    const created = await Promise.all(transactions.map((t) => createTransaction(t)));

    return NextResponse.json(isBatch ? created : created[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create transactions:", error);
    return NextResponse.json({ error: "Failed to create transactions" }, { status: 500 });
  }
}
