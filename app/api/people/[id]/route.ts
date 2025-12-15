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

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const state = getState();
  const person = state.people.find((p) => p.id === params.id);
  if (!person) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(person);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json().catch(() => null)) as unknown;
  if (!isValidPersonPatch(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const state = getState();
  const idx = state.people.findIndex((p) => p.id === params.id);
  if (idx < 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const next = { ...state.people[idx], ...body } satisfies Person;
  const people = state.people.slice();
  people[idx] = next;

  setState({ ...state, people });
  return NextResponse.json(next);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const state = getState();
  const exists = state.people.some((p) => p.id === params.id);
  if (!exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  setState({ ...state, people: state.people.filter((p) => p.id !== params.id) });
  return NextResponse.json({ ok: true });
}
