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
