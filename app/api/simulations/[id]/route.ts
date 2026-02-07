import { NextResponse } from "next/server";

import { deleteSimulation, updateSimulation } from "@/features/simulation/server/store";
import { updateSimulationBodySchema } from "@/lib/schemas";
import { readJsonBody, requireAuth, validateBody } from "@/lib/server/requestBodyValidation";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH /api/simulations/:id
 * Updates a saved simulation.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const { id } = await params;

  const body = await readJsonBody(request);
  const validation = validateBody(body, updateSimulationBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    const updated = await updateSimulation(id, validation.data);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update simulation:", error);
    return NextResponse.json({ error: "Failed to update simulation" }, { status: 500 });
  }
}

/**
 * DELETE /api/simulations/:id
 * Deletes a saved simulation.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const { id } = await params;

  try {
    await deleteSimulation(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete simulation:", error);
    return NextResponse.json({ error: "Failed to delete simulation" }, { status: 500 });
  }
}
