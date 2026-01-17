import "server-only";

import type { BulkTransactionPatch, Transaction, TransactionPatch } from "@/lib/types";

// ============================================================================
// Validation Result Types
// ============================================================================

export type ValidationResult<T> =
  | { isValid: true; value: T }
  | { isValid: false; errorMessage: string; statusCode?: number };

/**
 * Creates a validation error result.
 */
function validationError(message: string, statusCode = 400): ValidationResult<never> {
  return { isValid: false, errorMessage: message, statusCode };
}

/**
 * Creates a successful validation result.
 */
function validationSuccess<T>(value: T): ValidationResult<T> {
  return { isValid: true, value };
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Checks if a value is a non-null object (Record).
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Checks if a value is an array of finite numbers.
 */
export function isFiniteNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
}

/**
 * Type guard for TransactionPatch fields.
 */
function isValidTransactionPatch(value: unknown): value is TransactionPatch {
  if (!isRecord(value)) return false;

  const validators: Record<string, (v: unknown) => boolean> = {
    description: (v) => typeof v === "string",
    amount: (v) => typeof v === "number",
    categoryId: (v) => typeof v === "string",
    paidBy: (v) => typeof v === "string",
    isRecurring: (v) => typeof v === "boolean",
    isCreditCard: (v) => typeof v === "boolean",
    excludeFromSplit: (v) => typeof v === "boolean",
    date: (v) => typeof v === "string",
    type: (v) => v === "expense" || v === "income",
    isIncrement: (v) => typeof v === "boolean",
  };

  for (const [key, validate] of Object.entries(validators)) {
    if (key in value && !validate(value[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Type guard for BulkTransactionPatch fields.
 */
function isValidBulkTransactionPatch(value: unknown): value is BulkTransactionPatch {
  if (!isRecord(value)) return false;

  const validators: Record<string, (v: unknown) => boolean> = {
    categoryId: (v) => typeof v === "string",
    paidBy: (v) => typeof v === "string",
    isRecurring: (v) => typeof v === "boolean",
    isCreditCard: (v) => typeof v === "boolean",
    excludeFromSplit: (v) => typeof v === "boolean",
    type: (v) => v === "expense" || v === "income",
    isIncrement: (v) => typeof v === "boolean",
  };

  for (const [key, validate] of Object.entries(validators)) {
    if (key in value && !validate(value[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Type guard for transaction create payload.
 */
function isTransactionCreatePayload(value: unknown): value is Omit<Transaction, "id"> {
  if (!isRecord(value)) return false;

  const isIncome = value.type === "income";

  // Required fields validation
  const hasRequiredFields =
    typeof value.description === "string" &&
    typeof value.amount === "number" &&
    (isIncome || typeof value.categoryId === "string") &&
    typeof value.paidBy === "string" &&
    typeof value.isRecurring === "boolean" &&
    typeof value.isCreditCard === "boolean" &&
    typeof value.excludeFromSplit === "boolean" &&
    typeof value.date === "string";

  if (!hasRequiredFields) return false;

  // categoryId can be null/undefined for income, but if provided must be string
  if ("categoryId" in value && value.categoryId !== null && typeof value.categoryId !== "string") {
    return false;
  }

  // Optional type field validation
  if ("type" in value && value.type !== "expense" && value.type !== "income") {
    return false;
  }

  // Optional isIncrement field validation
  if ("isIncrement" in value && typeof value.isIncrement !== "boolean") {
    return false;
  }

  return true;
}

// ============================================================================
// Request Body Readers
// ============================================================================

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

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a request body for entity update operations (people, categories).
 */
export function validateUpdateByIdBody(
  body: unknown,
  idFieldName: "personId" | "categoryId",
): ValidationResult<{ entityId: string; patch: Record<string, unknown> }> {
  if (!isRecord(body)) {
    return validationError("Invalid body");
  }

  const rawEntityId = body[idFieldName];
  const rawPatch = body.patch;

  if (typeof rawEntityId !== "string" || !isRecord(rawPatch)) {
    return validationError(`Expected { ${idFieldName}: string, patch: object }`);
  }

  return validationSuccess({ entityId: rawEntityId, patch: rawPatch });
}

/**
 * Validates a request body for creating transactions.
 * Supports both single transaction and batch creation.
 */
export function validateCreateTransactionsBody(
  body: unknown,
): ValidationResult<{ isBatch: boolean; transactions: Array<Omit<Transaction, "id">> }> {
  const payloadItems = Array.isArray(body) ? body : [body];

  if (payloadItems.length === 0) {
    return validationError("Empty payload");
  }

  const transactions: Array<Omit<Transaction, "id">> = [];

  for (let i = 0; i < payloadItems.length; i++) {
    const item = payloadItems[i];

    if (!isTransactionCreatePayload(item)) {
      return validationError(`Invalid transaction at index ${i}`);
    }

    transactions.push(item);
  }

  return validationSuccess({
    isBatch: Array.isArray(body),
    transactions,
  });
}

/**
 * Validates a transaction patch from a request body.
 */
export function validateTransactionPatch(body: unknown): ValidationResult<TransactionPatch> {
  if (!isRecord(body)) {
    return validationError("Invalid body");
  }

  const patch = body.patch;
  if (!isValidTransactionPatch(patch)) {
    return validationError("Invalid patch");
  }

  return validationSuccess(patch);
}

/**
 * Validates a bulk transaction update request body.
 */
export function validateBulkUpdateBody(
  body: unknown,
): ValidationResult<{ ids: number[]; patch: BulkTransactionPatch }> {
  if (!isRecord(body)) {
    return validationError("Invalid body");
  }

  const { ids, patch } = body;

  if (!isFiniteNumberArray(ids)) {
    return validationError("Invalid ids - expected array of numbers");
  }

  if (ids.length === 0) {
    return validationError("No ids provided");
  }

  if (!isValidBulkTransactionPatch(patch)) {
    return validationError("Invalid patch");
  }

  return validationSuccess({ ids, patch });
}

/**
 * Validates a bulk delete request body.
 */
export function validateBulkDeleteBody(body: unknown): ValidationResult<{ ids: number[] }> {
  if (!isRecord(body)) {
    return validationError("Invalid body");
  }

  const { ids } = body;

  if (!isFiniteNumberArray(ids)) {
    return validationError("Invalid ids - expected array of numbers");
  }

  if (ids.length === 0) {
    return validationError("No ids provided");
  }

  return validationSuccess({ ids });
}

/**
 * Validates a person creation request body.
 */
export function validateCreatePersonBody(
  body: unknown,
): ValidationResult<{ name: string; income: number }> {
  if (!isRecord(body)) {
    return validationError("Invalid body");
  }

  const { name, income } = body;

  if (typeof name !== "string" || typeof income !== "number") {
    return validationError("Expected { name: string, income: number }");
  }

  return validationSuccess({ name, income });
}

/**
 * Parses a numeric ID from a string parameter.
 */
export function parseNumericId(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
