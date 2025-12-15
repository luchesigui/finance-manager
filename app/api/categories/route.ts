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

export async function GET() {
  const state = getState();
  return NextResponse.json(state.categories);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;

  if (!isValidCategoryPatch(body) || typeof body.name !== "string") {
    return NextResponse.json(
      { error: "Invalid body. Expected at least { name: string }." },
      { status: 400 },
    );
  }

  const state = getState();
  const nextId = `c${crypto.randomUUID().slice(0, 8)}`;

  const category: Category = {
    id: nextId,
    name: body.name,
    targetPercent: typeof body.targetPercent === "number" ? body.targetPercent : 0,
    color: typeof body.color === "string" ? body.color : "text-slate-600",
  };

  setState({ ...state, categories: [category, ...state.categories] });
  return NextResponse.json(category, { status: 201 });
}
