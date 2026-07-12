import { NextResponse } from "next/server";
import { z } from "zod";
import { createReserve, getReserves, getEssentialExpensesAverage } from "../../../db/queries";
import { checkAuth } from "../../../utils/auth";

const reserveSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  type: z.enum(["emergency", "goal", "investment"]),
  currentAmount: z.number().int("O valor deve ser em centavos"),
  targetAmount: z.number().int().nullable().optional(),
  monthlyContribution: z.number().int().nullable().optional(),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD")
    .nullable()
    .optional(),
  status: z.enum(["active", "paused", "completed"]).optional().default("active"),
});

export async function GET(request: Request) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    const [reserves, essentialAvg] = await Promise.all([
      getReserves(),
      getEssentialExpensesAverage(month),
    ]);

    return NextResponse.json({ reserves, essentialAvg });
  } catch (error: any) {
    console.error("Error in GET /api/reserves:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const validation = reserveSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Error", details: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const result = await createReserve(validation.data);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in POST /api/reserves:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
