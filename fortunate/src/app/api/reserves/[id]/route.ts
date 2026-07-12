import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteReserve, updateReserve } from "../../../../db/queries";
import { checkAuth } from "../../../../utils/auth";

const updateReserveSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["emergency", "goal", "investment"]).optional(),
  currentAmount: z.number().int().optional(),
  targetAmount: z.number().int().nullable().optional(),
  monthlyContribution: z.number().int().nullable().optional(),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  status: z.enum(["active", "paused", "completed"]).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateReserveSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Error", details: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const result = await updateReserve(id, validation.data);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error in PATCH /api/reserves/${(await params).id}:`, error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const result = await deleteReserve(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error in DELETE /api/reserves/${(await params).id}:`, error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
