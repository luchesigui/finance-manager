import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createRecurrenceTemplate,
  createTransaction,
  getTransactionsForMonth,
  getUsers,
} from "../../../db/queries";
import { checkAuth } from "../../../utils/auth";

// Validation schema for creating a transaction
const createTransactionSchema = z.object({
  description: z.string().min(1, "A descrição é obrigatória"),
  amount: z.number().int().positive("O valor deve ser em centavos e maior que zero"), // cents
  categoryId: z.string().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "A data deve estar no formato YYYY-MM-DD"),
  createdByUserId: z.string().nullable().optional(),
  assignedToUserId: z.string().nullable().optional(),
  paraQuemUserId: z.string().nullable().optional(),
  isCreditCard: z.boolean().optional(),
  nextInvoice: z.boolean().optional(),
  naoEntraDivisao: z.boolean().optional(),
  isPrevisao: z.boolean().optional(),
  isRecorrente: z.boolean().optional(),
  isParcelado: z.boolean().optional(),
  numParcelas: z.union([z.number(), z.string()]).nullable().optional(),
  transactionType: z.enum(["expense", "income", "transfer"]).optional().default("expense"),
});

// GET /api/transactions?month=YYYY-MM
export async function GET(request: Request) {
  try {
    // 1. Authenticate API Key if external
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");

    const monthValidation = z
      .string()
      .regex(/^\d{4}-\d{2}$/, "O mês deve estar no formato YYYY-MM")
      .safeParse(monthParam ?? new Date().toISOString().slice(0, 7));
    if (!monthValidation.success) {
      return NextResponse.json(
        { error: "Validation Error", details: monthValidation.error.flatten().formErrors },
        { status: 400 },
      );
    }
    const month = monthValidation.data;

    const transactions = await getTransactionsForMonth(month);
    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("Error in GET /api/transactions:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/transactions
export async function POST(request: Request) {
  try {
    // 1. Authenticate API Key if external
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();

    // 2. Validate request payload using Zod
    const validation = createTransactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Error", details: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const {
      description,
      amount,
      categoryId,
      date,
      createdByUserId,
      assignedToUserId,
      paraQuemUserId,
      isCreditCard,
      nextInvoice,
      naoEntraDivisao,
      isPrevisao,
      isRecorrente,
      isParcelado,
      numParcelas,
      transactionType,
    } = validation.data;

    // Reject unknown user IDs with a 400 instead of letting the FK constraint blow up with a 500
    const knownUserIds = new Set((await getUsers()).map((u) => u.id));
    const unknownUserId = [createdByUserId, assignedToUserId, paraQuemUserId].find(
      (id) => id && !knownUserIds.has(id),
    );
    if (unknownUserId) {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: { userId: [`Usuário desconhecido: ${unknownUserId}`] },
        },
        { status: 400 },
      );
    }

    // createdByUserId/assignedToUserId omitidos caem no pagador padrão (settings), resolvido em queries.ts

    if (isRecorrente) {
      const [year, month, dayStr] = date.split("-");
      const dayOfMonth = Number.parseInt(dayStr, 10);

      const templateId = await createRecurrenceTemplate({
        createdByUserId: createdByUserId ?? null,
        transactionType,
        description,
        amount,
        categoryId,
        assignedToUserId,
        paraQuemUserId,
        dayOfMonth,
        startDate: date,
        isCreditCard,
        nextInvoice,
        naoEntraDivisao,
        isPrevisao,
      });

      return NextResponse.json({ success: true, type: "recorrente", templateId });
    }
    const result = await createTransaction({
      createdByUserId: createdByUserId ?? null,
      transactionType,
      description,
      amount,
      categoryId,
      date,
      assignedToUserId,
      paraQuemUserId,
      isCreditCard,
      nextInvoice,
      naoEntraDivisao,
      isPrevisao,
      isParcelado,
      numParcelas: numParcelas ? Number.parseInt(String(numParcelas), 10) : null,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in POST /api/transactions:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
