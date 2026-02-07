import { NextResponse } from "next/server";

import { createSimulation, getSimulations } from "@/features/simulation/server/store";
import { createSimulationBodySchema } from "@/lib/schemas";
import { readJsonBody, requireAuth, validateBody } from "@/lib/server/requestBodyValidation";

export const dynamic = "force-dynamic";

/**
 * GET /api/simulations
 * Lists all saved simulations for the household.
 */
export async function GET() {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  try {
    const simulations = await getSimulations();
    return NextResponse.json(simulations);
  } catch (error) {
    console.error("Failed to get simulations:", error);
    return NextResponse.json({ error: "Failed to get simulations" }, { status: 500 });
  }
}

/**
 * POST /api/simulations
 * Creates a new saved simulation.
 */
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const body = await readJsonBody(request);
  const validation = validateBody(body, createSimulationBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    const simulation = await createSimulation(validation.data);
    return NextResponse.json(simulation, { status: 201 });
  } catch (error) {
    console.error("Failed to create simulation:", error);
    return NextResponse.json({ error: "Failed to create simulation" }, { status: 500 });
  }
}
