import "server-only";

import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

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
