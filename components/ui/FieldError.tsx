"use client";

import { getFieldError, hasFieldError } from "@/lib/form";

type FieldErrorProps = {
  errors: unknown[];
};

/**
 * Displays validation error message for a form field.
 * Only renders when there are errors.
 */
export function FieldError({ errors }: FieldErrorProps) {
  if (!hasFieldError(errors)) return null;

  const errorMessage = getFieldError(errors);
  if (!errorMessage) return null;

  return (
    <p className="mt-1 text-xs text-accent-negative animate-in slide-in-from-top-1 duration-200">
      {errorMessage}
    </p>
  );
}
