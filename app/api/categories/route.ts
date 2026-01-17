import { NextResponse } from "next/server";

import { updateCategoryBodySchema } from "@/lib/schemas";
import { getCategories, updateCategory } from "@/lib/server/financeStore";
import { readJsonBody, validateBody } from "@/lib/server/requestBodyValidation";
import type { CategoryPatch } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/categories
 * Fetches all categories for the household.
 */
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

/**
 * PATCH /api/categories
 * Updates a category by ID.
 */
export async function PATCH(request: Request) {
  const body = await readJsonBody(request);
  const validation = validateBody(body, updateCategoryBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    const updatedCategory = await updateCategory(
      validation.data.categoryId,
      validation.data.patch as CategoryPatch,
    );
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
