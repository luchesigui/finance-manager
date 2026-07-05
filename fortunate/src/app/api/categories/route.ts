import { NextResponse } from "next/server";
import { z } from "zod";
import { createCategory, getCategories } from "../../../db/queries";
import { checkAuth } from "../../../utils/auth";

const createCategorySchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  slug: z.string().min(1, "O slug é obrigatório"),
  pillarSlug: z.enum([
    "essenciais",
    "conforto",
    "prazeres",
    "conhecimento",
    "planejamento",
    "liberdade",
  ]),
});

// GET /api/categories
export async function GET(request: Request) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Error in GET /api/categories:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/categories
export async function POST(request: Request) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();

    const validation = createCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Error", details: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, slug, pillarSlug } = validation.data;
    const id = await createCategory(name, slug, pillarSlug);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Error in POST /api/categories:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
