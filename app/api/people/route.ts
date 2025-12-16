import { NextResponse } from "next/server";

import { getState, setState } from "@/lib/server/financeStore";
import { readJsonBody, validateUpdateByIdBody } from "@/lib/server/requestBodyValidation";
import type { Person } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getState().people);
}

export async function PATCH(request: Request) {
  const body = await readJsonBody(request);
  const validationResult = validateUpdateByIdBody(body, "personId");

  if (!validationResult.isValid) {
    return NextResponse.json(
      { error: validationResult.errorMessage },
      { status: validationResult.statusCode ?? 400 },
    );
  }

  const state = getState();
  const personIndex = state.people.findIndex(
    (person) => person.id === validationResult.value.entityId,
  );

  if (personIndex < 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updatedPerson = {
    ...state.people[personIndex],
    ...validationResult.value.patch,
  } satisfies Person;
  const nextPeople = state.people.slice();
  nextPeople[personIndex] = updatedPerson;

  setState({ ...state, people: nextPeople });

  return NextResponse.json(updatedPerson);
}
