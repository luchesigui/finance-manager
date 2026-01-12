import "server-only";

import type { Transaction } from "@/lib/types";

export type ValidationResult<ValidValue> =
  | { isValid: true; value: ValidValue }
  | { isValid: false; errorMessage: string; statusCode?: number };

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return (await request.json()) as unknown;
  } catch {
    return null;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object";
}

export function validateUpdateByIdBody(
  body: unknown,
  idFieldName: "personId" | "categoryId",
): ValidationResult<{ entityId: string; patch: Record<string, unknown> }> {
  if (!isRecord(body)) {
    return { isValid: false, errorMessage: "Invalid body", statusCode: 400 };
  }

  const rawEntityId = body[idFieldName];
  const rawPatch = body.patch;

  if (typeof rawEntityId !== "string" || !isRecord(rawPatch)) {
    return {
      isValid: false,
      errorMessage: `Expected { ${idFieldName}: string, patch: object }`,
      statusCode: 400,
    };
  }

  return { isValid: true, value: { entityId: rawEntityId, patch: rawPatch } };
}

function isTransactionCreatePayload(value: unknown): value is Omit<Transaction, "id"> {
  if (!isRecord(value)) return false;

  return (
    typeof value.description === "string" &&
    typeof value.amount === "number" &&
    typeof value.categoryId === "string" &&
    typeof value.paidBy === "string" &&
    typeof value.isRecurring === "boolean" &&
    typeof value.isCreditCard === "boolean" &&
    typeof value.excludeFromSplit === "boolean" &&
    typeof value.date === "string"
  );
}

export function validateCreateTransactionsBody(
  body: unknown,
): ValidationResult<{ isBatch: boolean; transactions: Array<Omit<Transaction, "id">> }> {
  const payloadItems = Array.isArray(body) ? body : [body];

  if (payloadItems.length === 0) {
    return { isValid: false, errorMessage: "Empty payload", statusCode: 400 };
  }

  const transactions: Array<Omit<Transaction, "id">> = [];

  for (let payloadIndex = 0; payloadIndex < payloadItems.length; payloadIndex++) {
    const payloadItem = payloadItems[payloadIndex];

    if (!isTransactionCreatePayload(payloadItem)) {
      return {
        isValid: false,
        errorMessage: `Invalid transaction at index ${payloadIndex}`,
        statusCode: 400,
      };
    }

    transactions.push(payloadItem);
  }

  return {
    isValid: true,
    value: { isBatch: Array.isArray(body), transactions },
  };
}
