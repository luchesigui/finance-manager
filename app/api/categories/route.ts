import { NextResponse } from "next/server";

import { getState, setState } from "@/lib/server/financeStore";
import { readJsonBody, validateUpdateByIdBody } from "@/lib/server/requestBodyValidation";
import type { Category } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getState().categories);
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

  const state = getState();
  const categoryIndex = state.categories.findIndex(
    (category) => category.id === validationResult.value.entityId,
  );

  if (categoryIndex < 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updatedCategory = {
    ...state.categories[categoryIndex],
    ...validationResult.value.patch,
  } satisfies Category;

  const nextCategories = state.categories.slice();
  nextCategories[categoryIndex] = updatedCategory;

  setState({ ...state, categories: nextCategories });

  return NextResponse.json(updatedCategory);
}
