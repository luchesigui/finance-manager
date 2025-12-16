import { NextResponse } from "next/server";

import { getCategories, updateCategory } from "@/lib/server/financeStore";
import { readJsonBody, validateUpdateByIdBody } from "@/lib/server/requestBodyValidation";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(categories);
}

export async function PATCH(request: Request) {
  const body = await readJsonBody(request);
  const validationResult = validateUpdateByIdBody(body, "categoryId");

  if (!validationResult.isValid) {
    return NextResponse.json(
      { error: validationResult.errorMessage },
      { status: validationResult.statusCode ?? 400 },
    );
  }

  try {
    const updatedCategory = await updateCategory(
      validationResult.value.entityId,
      validationResult.value.patch as Partial<Category>,
    );
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Failed to update category", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
