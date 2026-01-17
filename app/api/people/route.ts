import { NextResponse } from "next/server";

import { createPerson, deletePerson, getPeople, updatePerson } from "@/lib/server/financeStore";
import {
  readJsonBody,
  validateCreatePersonBody,
  validateUpdateByIdBody,
} from "@/lib/server/requestBodyValidation";
import type { PersonPatch } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/people
 * Fetches all people in the household.
 */
export async function GET() {
  try {
    const people = await getPeople();
    return NextResponse.json(people);
  } catch (error) {
    console.error("Failed to fetch people:", error);
    return NextResponse.json({ error: "Failed to fetch people" }, { status: 500 });
  }
}

/**
 * POST /api/people
 * Creates a new person.
 */
export async function POST(request: Request) {
  const body = await readJsonBody(request);
  const validation = validateCreatePersonBody(body);

  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.errorMessage },
      { status: validation.statusCode ?? 400 },
    );
  }

  try {
    const newPerson = await createPerson(validation.value);
    return NextResponse.json(newPerson, { status: 201 });
  } catch (error) {
    console.error("Failed to create person:", error);
    return NextResponse.json({ error: "Failed to create person" }, { status: 500 });
  }
}

/**
 * PATCH /api/people
 * Updates a person by ID.
 */
export async function PATCH(request: Request) {
  const body = await readJsonBody(request);
  const validation = validateUpdateByIdBody(body, "personId");

  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.errorMessage },
      { status: validation.statusCode ?? 400 },
    );
  }

  try {
    const updatedPerson = await updatePerson(
      validation.value.entityId,
      validation.value.patch as PersonPatch,
    );
    return NextResponse.json(updatedPerson);
  } catch (error) {
    console.error("Failed to update person:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

/**
 * DELETE /api/people
 * Deletes a person by ID (provided as query parameter).
 */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const personId = searchParams.get("personId");

  if (!personId) {
    return NextResponse.json({ error: "Expected personId query parameter" }, { status: 400 });
  }

  try {
    await deletePerson(personId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete person:", error);

    // Handle custom error codes
    if (error && typeof error === "object" && "code" in error) {
      const errorCode = (error as { code: string }).code;
      const errorMessage =
        error instanceof Error ? error.message : "Cannot delete person due to existing references.";

      if (errorCode === "NO_REPLACEMENT_PERSON" || errorCode === "HAS_TRANSACTIONS") {
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }

      // PostgreSQL foreign key constraint error
      if (errorCode === "23503") {
        return NextResponse.json(
          { error: "Cannot delete person because they are referenced by transactions." },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({ error: "Failed to delete person" }, { status: 500 });
  }
}
