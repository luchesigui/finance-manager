import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteTransaction, updateTransaction } from "../../../../db/queries";
import { checkAuth } from "../../../../utils/auth";

const recurrenceOptionSchema = z.enum(["only_this", "all", "future"]).default("only_this");

const updateTransactionSchema = z.object({
  updatedFields: z.object({
    description: z.string().min(1).optional(),
    amount: z.number().int().positive().optional(), // cents
    categoryId: z.string().nullable().optional(),
    pillarSlug: z.string().nullable().optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "A data deve estar no formato YYYY-MM-DD")
      .optional(),
    assignedToUserId: z.string().optional(),
    paraQuemUserId: z.string().nullable().optional(),
    isCreditCard: z.boolean().optional(),
    nextInvoice: z.boolean().optional(),
    naoEntraDivisao: z.boolean().optional(),
    isPrevisao: z.boolean().optional(),
    isParcelado: z.boolean().optional(),
    numParcelas: z.union([z.number(), z.string()]).nullable().optional(),
    transactionType: z.enum(["expense", "income", "transfer"]).optional(),
    ignored: z.boolean().optional(),
  }),
  option: recurrenceOptionSchema,
});

// PUT /api/transactions/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validation = updateTransactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Error", details: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { updatedFields, option } = validation.data;
    const formattedFields = {
      ...updatedFields,
      numParcelas:
        updatedFields.numParcelas !== undefined && updatedFields.numParcelas !== null
          ? Number(updatedFields.numParcelas)
          : updatedFields.numParcelas,
    };
    const result = await updateTransaction(id, formattedFields, option);
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error(`Error in PUT /api/transactions/${(await params).id}:`, error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/transactions/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const validation = recurrenceOptionSchema.safeParse(searchParams.get("option") ?? undefined);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: { option: ["Valores aceitos: only_this, all, future"] },
        },
        { status: 400 },
      );
    }

    const result = await deleteTransaction(id, validation.data);
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error(`Error in DELETE /api/transactions/${(await params).id}:`, error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
