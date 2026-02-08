import "server-only";

import { getPrimaryHouseholdIdForUser } from "@/lib/server/household";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

/**
 * Checks if the request is authenticated.
 * Returns the user if authenticated, or a 401 response if not.
 */
export async function requireAuth(): Promise<
  { success: true; userId: string } | { success: false; response: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { success: true, userId: user.id };
}

/**
 * Checks if the request is authenticated and returns userId + householdId.
 * Uses a single getUser() call to avoid intermittent auth failures when
 * downstream code calls getPrimaryHouseholdId() in parallel/sequence.
 */
export async function requireAuthWithHousehold(): Promise<
  | { success: true; userId: string; householdId: string }
  | { success: false; response: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    const householdId = await getPrimaryHouseholdIdForUser(supabase, user.id);
    return { success: true, userId: user.id, householdId };
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: "No household found" }, { status: 403 }),
    };
  }
}

/**
 * Safely reads and parses JSON from a request body.
 * Returns null if parsing fails.
 */
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * Validates request body against a Zod schema.
 * Returns the validated data or a NextResponse with error details.
 */
export function validateBody<T>(
  body: unknown,
  schema: ZodSchema<T>,
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error.flatten();
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Validation failed",
          details: errors.fieldErrors,
        },
        { status: 400 },
      ),
    };
  }

  return { success: true, data: result.data };
}

/**
 * Parses a numeric ID from a string parameter.
 */
export function parseNumericId(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
}
