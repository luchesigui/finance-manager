import { NextResponse } from "next/server";

import { getState, setState } from "@/lib/server/financeStore";
import type { Category } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getState().categories);
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { categoryId, patch } = body as {
    categoryId?: unknown;
    patch?: unknown;
  };

  if (typeof categoryId !== "string" || !patch || typeof patch !== "object") {
    return NextResponse.json(
      { error: "Expected { categoryId: string, patch: object }" },
      { status: 400 },
    );
  }

  const state = getState();
  const categoryIndex = state.categories.findIndex((category) => category.id === categoryId);

  if (categoryIndex < 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updatedCategory = {
    ...state.categories[categoryIndex],
    ...(patch as object),
  } satisfies Category;

  const nextCategories = state.categories.slice();
  nextCategories[categoryIndex] = updatedCategory;

  setState({ ...state, categories: nextCategories });

  return NextResponse.json(updatedCategory);
}
