import { NextResponse } from "next/server";
import { z } from "zod";
import { createRecurrenceTemplate, getRecurrenceTemplates } from "../../../db/queries";
import { checkAuth } from "../../../utils/auth";

const createRecurrenceTemplateSchema = z.object({
  description: z.string().min(1, "A descrição é obrigatória"),
  amount: z.number().int().positive("O valor deve ser em centavos e maior que zero"), // cents
  categoryId: z.string().nullable().optional(),
  createdByUserId: z.string().nullable().optional(),
  assignedToUserId: z.string().min(1, "assignedToUserId é obrigatório"),
  paraQuemUserId: z.string().nullable().optional(),
  dayOfMonth: z.coerce.number().int().min(1).max(31),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "A data deve estar no formato YYYY-MM-DD"),
  isCreditCard: z.boolean().optional(),
  nextInvoice: z.boolean().optional(),
  naoEntraDivisao: z.boolean().optional(),
  isPrevisao: z.boolean().optional(),
  transactionType: z.enum(["expense", "income", "transfer"]).optional().default("expense"),
});

// GET /api/recurrence-templates
export async function GET(request: Request) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const templates = await getRecurrenceTemplates();
    return NextResponse.json(templates);
  } catch (error: any) {
    console.error("Error in GET /api/recurrence-templates:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/recurrence-templates
export async function POST(request: Request) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();

    const validation = createRecurrenceTemplateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Error", details: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { createdByUserId, ...data } = validation.data;

    // createdByUserId omitido cai no pagador padrão (settings), resolvido em queries.ts
    const templateId = await createRecurrenceTemplate({
      createdByUserId: createdByUserId ?? null,
      ...data,
    });

    return NextResponse.json({ success: true, id: templateId });
  } catch (error: any) {
    console.error("Error in POST /api/recurrence-templates:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
