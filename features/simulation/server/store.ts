import "server-only";

import { mapSimulationRow } from "@/lib/server/dbMappers";
import { getPrimaryHouseholdId } from "@/lib/server/household";
import { createClient } from "@/lib/supabase/server";
import type { SavedSimulation, SimulationRow } from "@/lib/types";

export async function getSimulations(): Promise<SavedSimulation[]> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data, error } = await supabase
    .from("simulations")
    .select("*")
    .eq("household_id", householdId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as SimulationRow[]).map(mapSimulationRow);
}

export async function createSimulation(input: {
  name: string;
  state: SavedSimulation["state"];
}): Promise<SavedSimulation> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data, error } = await supabase
    .from("simulations")
    .insert({
      household_id: householdId,
      name: input.name,
      state: input.state,
    })
    .select()
    .single();

  if (error) throw error;
  return mapSimulationRow(data as SimulationRow);
}

export async function updateSimulation(
  id: string,
  patch: { name?: string; state?: SavedSimulation["state"] },
): Promise<SavedSimulation> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const dbPatch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.state !== undefined) dbPatch.state = patch.state;

  const { data, error } = await supabase
    .from("simulations")
    .update(dbPatch)
    .eq("id", id)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) throw error;
  return mapSimulationRow(data as SimulationRow);
}

export async function deleteSimulation(id: string): Promise<void> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { error } = await supabase
    .from("simulations")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);

  if (error) throw error;
}
