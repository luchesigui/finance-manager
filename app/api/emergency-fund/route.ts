import { NextResponse } from "next/server";

import { updateEmergencyFundBodySchema } from "@/lib/schemas";
import { getEmergencyFund, updateEmergencyFund } from "@/lib/server/financeStore";
import { readJsonBody, requireAuth, validateBody } from "@/lib/server/requestBodyValidation";

export const dynamic = "force-dynamic";

/**
 * GET /api/emergency-fund
 * Gets the emergency fund amount for the household.
 */
export async function GET() {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  try {
    const emergencyFund = await getEmergencyFund();
    return NextResponse.json({ emergencyFund });
  } catch (error) {
    console.error("Failed to get emergency fund:", error);
    return NextResponse.json({ error: "Failed to get emergency fund" }, { status: 500 });
  }
}

/**
 * PATCH /api/emergency-fund
 * Updates the emergency fund for the household.
 */
export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const body = await readJsonBody(request);
  const validation = validateBody(body, updateEmergencyFundBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    const { amount } = validation.data;
    await updateEmergencyFund(amount);

    // Verify the update actually happened
    const updatedEmergencyFund = await getEmergencyFund();

    return NextResponse.json({
      success: true,
      emergencyFund: updatedEmergencyFund,
    });
  } catch (error) {
    console.error("Failed to update emergency fund:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update emergency fund", details: errorMessage },
      { status: 500 },
    );
  }
}
