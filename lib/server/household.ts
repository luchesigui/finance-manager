import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Gets the primary household ID for the authenticated user.
 * @throws Error if not authenticated or no household found
 */
export async function getPrimaryHouseholdId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  return getPrimaryHouseholdIdForUser(supabase, user.id);
}

/**
 * Gets the primary household ID for a user by ID.
 * Use this when you already have the user ID from auth to avoid redundant getUser() calls.
 * @throws Error if no household found
 */
export async function getPrimaryHouseholdIdForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error("No household found for user");
  }

  return data.household_id;
}

/**
 * Gets the current authenticated user's ID.
 * @throws Error if not authenticated
 */
export async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  return user.id;
}
