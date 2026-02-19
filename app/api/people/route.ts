import { NextResponse } from "next/server";

import {
  createPerson,
  deletePerson,
  getPeople,
  updatePerson,
} from "@/features/people/server/store";
import { createPersonBodySchema, updatePersonBodySchema } from "@/lib/schemas";
import { readJsonBody, requireAuth, validateBody } from "@/lib/server/requestBodyValidation";
import type { PersonPatch } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/people
 * Fetches all people in the household.
 */
export async function GET() {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

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
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const body = await readJsonBody(request);
  const validation = validateBody(body, createPersonBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    const newPerson = await createPerson(validation.data);
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
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const body = await readJsonBody(request);
  const validation = validateBody(body, updatePersonBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    const updatedPerson = await updatePerson(
      validation.data.personId,
      validation.data.patch as PersonPatch,
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
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

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

      // PostgreSQL foreign key constraint error (e.g. transactions or recurring_templates)
      if (errorCode === "23503") {
        return NextResponse.json(
          {
            error:
              "Cannot delete person because they are referenced by transactions or recurring templates.",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({ error: "Failed to delete person" }, { status: 500 });
  }
}
