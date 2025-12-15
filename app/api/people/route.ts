import { NextResponse } from "next/server";

import { getState, setState } from "@/lib/server/financeStore";
import type { Person } from "@/lib/types";

function isValidPersonPatch(input: unknown): input is Partial<Omit<Person, "id">> {
  if (!input || typeof input !== "object") return false;
  const obj = input as Record<string, unknown>;

  if ("name" in obj && typeof obj.name !== "string") return false;
  if ("income" in obj && typeof obj.income !== "number") return false;
  if ("color" in obj && typeof obj.color !== "string") return false;

  return true;
}

export async function GET() {
  const state = getState();
  return NextResponse.json(state.people);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;

  if (!isValidPersonPatch(body) || typeof body.name !== "string") {
    return NextResponse.json(
      { error: "Invalid body. Expected at least { name: string }." },
      { status: 400 },
    );
  }

  const state = getState();
  const nextId = `p${crypto.randomUUID().slice(0, 8)}`;

  const person: Person = {
    id: nextId,
    name: body.name,
    income: typeof body.income === "number" ? body.income : 0,
    color: typeof body.color === "string" ? body.color : "bg-slate-500",
  };

  setState({ ...state, people: [person, ...state.people] });
  return NextResponse.json(person, { status: 201 });
}
