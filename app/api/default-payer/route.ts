import { NextResponse } from "next/server";

import { getDefaultPayerId, updateDefaultPayerId } from "@/features/people/server/store";
import { updateDefaultPayerBodySchema } from "@/lib/schemas";
import { readJsonBody, requireAuth, validateBody } from "@/lib/server/requestBodyValidation";

export const dynamic = "force-dynamic";

/**
 * GET /api/default-payer
 * Gets the default payer ID for the household.
 */
export async function GET() {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  try {
    const defaultPayerId = await getDefaultPayerId();
    return NextResponse.json({ defaultPayerId });
  } catch (error) {
    console.error("Failed to get default payer:", error);
    return NextResponse.json({ error: "Failed to get default payer" }, { status: 500 });
  }
}

/**
 * PATCH /api/default-payer
 * Updates the default payer for the household.
 */
export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const body = await readJsonBody(request);
  const validation = validateBody(body, updateDefaultPayerBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    const { personId } = validation.data;
    await updateDefaultPayerId(personId);

    // Verify the update actually happened
    const updatedDefaultPayerId = await getDefaultPayerId();
    if (updatedDefaultPayerId !== personId) {
      console.error(
        `Update verification failed: expected ${personId}, got ${updatedDefaultPayerId}`,
      );
      return NextResponse.json(
        { error: "Update verification failed - database may not have been updated" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      defaultPayerId: updatedDefaultPayerId,
    });
  } catch (error) {
    console.error("Failed to update default payer:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update default payer", details: errorMessage },
      { status: 500 },
    );
  }
}
