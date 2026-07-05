import { NextResponse } from "next/server";
import { confirmTransaction } from "../../../../../db/queries";
import { checkAuth } from "../../../../../utils/auth";

// POST /api/transactions/[id]/confirm
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const result = await confirmTransaction(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error in POST /api/transactions/${(await params).id}/confirm:`, error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
