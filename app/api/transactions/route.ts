import { NextResponse } from "next/server";

import { createTransactionsBodySchema } from "@/lib/schemas";
import { createTransaction, getTransactions } from "@/lib/server/financeStore";
import { readJsonBody, validateBody } from "@/lib/server/requestBodyValidation";

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
  const validation = validateBody(body, createTransactionsBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    const payload = Array.isArray(validation.data) ? validation.data : [validation.data];
    const created = await Promise.all(payload.map((transaction) => createTransaction(transaction)));

    return NextResponse.json(Array.isArray(validation.data) ? created : created[0], {
      status: 201,
    });
  } catch (error) {
    console.error("Failed to create transactions:", error);
    return NextResponse.json({ error: "Failed to create transactions" }, { status: 500 });
  }
}
