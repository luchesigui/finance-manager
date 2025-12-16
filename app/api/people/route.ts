import { NextResponse } from "next/server";

import { createPerson, deletePerson, getPeople, updatePerson } from "@/lib/server/financeStore";
import { readJsonBody, validateUpdateByIdBody } from "@/lib/server/requestBodyValidation";
import type { Person } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const people = await getPeople();
  return NextResponse.json(people);
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);

  if (!body || typeof body !== "object" || !("name" in body) || !("income" in body)) {
    return NextResponse.json(
      { error: "Expected { name: string, income: number }" },
      { status: 400 },
    );
  }

  const { name, income } = body as {
    name: unknown;
    income: unknown;
  };

  if (typeof name !== "string" || typeof income !== "number") {
    return NextResponse.json(
      {
        error: "Invalid types. Expected { name: string, income: number }",
      },
      { status: 400 },
    );
  }

  try {
    const newPerson = await createPerson({ name, income });
    return NextResponse.json(newPerson, { status: 201 });
  } catch (error) {
    console.error("Failed to create person", error);
    return NextResponse.json({ error: "Failed to create person" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const personId = searchParams.get("personId");

  if (!personId || typeof personId !== "string") {
    return NextResponse.json({ error: "Expected personId query parameter" }, { status: 400 });
  }

  try {
    await deletePerson(personId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete person", error);
    return NextResponse.json({ error: "Failed to delete person" }, { status: 500 });
  }
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

  try {
    const updatedPerson = await updatePerson(
      validationResult.value.entityId,
      validationResult.value.patch as Partial<Person>,
    );
    return NextResponse.json(updatedPerson);
  } catch (error) {
    console.error("Failed to update person", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
