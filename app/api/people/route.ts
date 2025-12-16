import { NextResponse } from "next/server";

import { getPeople, updatePerson } from "@/lib/server/financeStore";
import { readJsonBody, validateUpdateByIdBody } from "@/lib/server/requestBodyValidation";
import type { Person } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const people = await getPeople();
  return NextResponse.json(people);
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
