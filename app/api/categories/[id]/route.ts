import { NextResponse } from "next/server";

import { getState, setState } from "@/lib/server/financeStore";
import type { Category } from "@/lib/types";

function isValidCategoryPatch(input: unknown): input is Partial<Omit<Category, "id">> {
  if (!input || typeof input !== "object") return false;
  const obj = input as Record<string, unknown>;

  if ("name" in obj && typeof obj.name !== "string") return false;
  if ("targetPercent" in obj && typeof obj.targetPercent !== "number") return false;
  if ("color" in obj && typeof obj.color !== "string") return false;

  return true;
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const state = getState();
  const category = state.categories.find((c) => c.id === params.id);
  if (!category) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json().catch(() => null)) as unknown;
  if (!isValidCategoryPatch(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const state = getState();
  const idx = state.categories.findIndex((c) => c.id === params.id);
  if (idx < 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const next = { ...state.categories[idx], ...body } satisfies Category;
  const categories = state.categories.slice();
  categories[idx] = next;

  setState({ ...state, categories });
  return NextResponse.json(next);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const state = getState();
  const exists = state.categories.some((c) => c.id === params.id);
  if (!exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  setState({ ...state, categories: state.categories.filter((c) => c.id !== params.id) });
  return NextResponse.json({ ok: true });
}
