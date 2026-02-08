import type { z } from "zod";

// ============================================================================
// TanStack Form Utilities
// ============================================================================

/**
 * Extracts error message from TanStack Form field state errors
 */
export function getFieldError(errors: unknown[]): string | undefined {
  if (!errors || errors.length === 0) return undefined;
  const firstError = errors[0];
  if (typeof firstError === "string") return firstError;
  if (firstError && typeof firstError === "object" && "message" in firstError) {
    return String((firstError as { message: unknown }).message);
  }
  return undefined;
}

/**
 * Check if a field has validation errors
 */
export function hasFieldError(errors: unknown[]): boolean {
  return errors && errors.length > 0;
}

// ============================================================================
// Zod Validation Helpers
// ============================================================================

/**
 * Creates a TanStack Form validator function from a Zod schema.
 * Use this for field-level validation with onBlur/onChange validators.
 *
 * @example
 * ```tsx
 * <form.Field
 *   name="email"
 *   validators={{
 *     onBlur: zodValidator(emailSchema),
 *   }}
 * >
 * ```
 */
export function zodValidator<T>(schema: z.ZodSchema<T>) {
  return ({ value }: { value: T }): string | undefined => {
    const result = schema.safeParse(value);
    if (result.success) return undefined;
    return result.error.issues[0]?.message;
  };
}
