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

    // Handle custom errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "NO_REPLACEMENT_PERSON") {
        const errorMessage =
          "message" in error && typeof error.message === "string"
            ? error.message
            : "Cannot delete person because they have transactions and there are no other people to reassign them to.";
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }

      if (error.code === "HAS_TRANSACTIONS") {
        const errorMessage =
          "message" in error && typeof error.message === "string"
            ? error.message
            : "Cannot delete person because they have transactions associated with them.";
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }

      // Handle PostgreSQL foreign key constraint error (fallback)
      if (error.code === "23503") {
        return NextResponse.json(
          {
            error:
              "Cannot delete person because they are referenced by transactions. Please delete or update those transactions first.",
          },
          { status: 400 },
        );
      }
    }

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
