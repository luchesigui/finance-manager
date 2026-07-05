import { NextResponse } from "next/server";
import { deleteCategory } from "../../../../db/queries";
import { checkAuth } from "../../../../utils/auth";

// DELETE /api/categories/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const result = await deleteCategory(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error in DELETE /api/categories/${(await params).id}:`, error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
