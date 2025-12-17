import { NextResponse } from "next/server";

import { getDefaultPayerId, updateDefaultPayerId } from "@/lib/server/financeStore";
import { readJsonBody } from "@/lib/server/requestBodyValidation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const defaultPayerId = await getDefaultPayerId();
    return NextResponse.json({ defaultPayerId });
  } catch (error) {
    console.error("Failed to get default payer", error);
    return NextResponse.json({ error: "Failed to get default payer" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const body = await readJsonBody(request);

  if (!body || typeof body !== "object" || !("personId" in body)) {
    return NextResponse.json({ error: "Expected { personId: string }" }, { status: 400 });
  }

  const { personId } = body as { personId: unknown };

  if (typeof personId !== "string") {
    return NextResponse.json(
      { error: "Invalid type. Expected { personId: string }" },
      { status: 400 },
    );
  }

  try {
    await updateDefaultPayerId(personId);

    // Verify the update actually happened
    const updatedDefaultPayerId = await getDefaultPayerId();
    if (updatedDefaultPayerId !== personId) {
      console.error(
        `Update verification failed: expected ${personId}, got ${updatedDefaultPayerId}`,
      );
      return NextResponse.json(
        {
          error: "Update verification failed - database may not have been updated",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      defaultPayerId: updatedDefaultPayerId,
    });
  } catch (error) {
    console.error("Failed to update default payer", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update default payer", details: errorMessage },
      { status: 500 },
    );
  }
}
