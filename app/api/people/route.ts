import { NextResponse } from "next/server";

import { getState, setState } from "@/lib/server/financeStore";
import type { Person } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getState().people);
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { personId, patch } = body as {
    personId?: unknown;
    patch?: unknown;
  };

  if (typeof personId !== "string" || !patch || typeof patch !== "object") {
    return NextResponse.json(
      { error: "Expected { personId: string, patch: object }" },
      { status: 400 },
    );
  }

  const state = getState();
  const personIndex = state.people.findIndex((person) => person.id === personId);

  if (personIndex < 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updatedPerson = { ...state.people[personIndex], ...(patch as object) } satisfies Person;
  const nextPeople = state.people.slice();
  nextPeople[personIndex] = updatedPerson;

  setState({ ...state, people: nextPeople });

  return NextResponse.json(updatedPerson);
}
