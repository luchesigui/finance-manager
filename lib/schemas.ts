import { z } from "zod";

// ============================================================================
// Base Schemas
// ============================================================================

export const transactionTypeSchema = z.enum(["expense", "income"]);

// ============================================================================
// Transaction Schemas
// ============================================================================

export const transactionPatchSchema = z
  .object({
    description: z.string(),
    amount: z.number(),
    categoryId: z.string(),
    paidBy: z.string(),
    isRecurring: z.boolean(),
    isCreditCard: z.boolean(),
    excludeFromSplit: z.boolean(),
    isForecast: z.boolean(),
    date: z.string(),
    type: transactionTypeSchema,
    isIncrement: z.boolean(),
  })
  .partial();

export const bulkTransactionPatchSchema = z
  .object({
    categoryId: z.string(),
    paidBy: z.string(),
    isRecurring: z.boolean(),
    isCreditCard: z.boolean(),
    excludeFromSplit: z.boolean(),
    isForecast: z.boolean(),
    type: transactionTypeSchema,
    isIncrement: z.boolean(),
  })
  .partial();

export const createTransactionSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  categoryId: z.string().nullable(),
  paidBy: z.string().min(1),
  isRecurring: z.boolean(),
  isCreditCard: z.boolean(),
  excludeFromSplit: z.boolean(),
  isForecast: z.boolean().default(false),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: transactionTypeSchema.default("expense"),
  isIncrement: z.boolean().default(true),
});

export const createTransactionsBodySchema = z.union([
  createTransactionSchema,
  z.array(createTransactionSchema).min(1),
]);

// ============================================================================
// Transaction Update/Delete Schemas
// ============================================================================

export const updateTransactionBodySchema = z.object({
  patch: transactionPatchSchema,
});

export const bulkUpdateBodySchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
  patch: bulkTransactionPatchSchema,
});

export const bulkDeleteBodySchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
});

// ============================================================================
// Person Schemas
// ============================================================================

export const createPersonBodySchema = z.object({
  name: z.string().min(1),
  income: z.number().nonnegative(),
});

export const updatePersonBodySchema = z.object({
  personId: z.string().min(1),
  patch: z
    .object({
      name: z.string().min(1),
      income: z.number().nonnegative(),
    })
    .partial(),
});

// ============================================================================
// Category Schemas
// ============================================================================

export const updateCategoryBodySchema = z.object({
  categoryId: z.string().min(1),
  patch: z
    .object({
      name: z.string().min(1),
      targetPercent: z.number().min(0).max(100),
    })
    .partial(),
});

// ============================================================================
// Default Payer Schema
// ============================================================================

export const updateDefaultPayerBodySchema = z.object({
  personId: z.string().min(1),
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type TransactionPatchInput = z.infer<typeof transactionPatchSchema>;
export type BulkTransactionPatchInput = z.infer<typeof bulkTransactionPatchSchema>;
export type CreatePersonInput = z.infer<typeof createPersonBodySchema>;
export type UpdatePersonInput = z.infer<typeof updatePersonBodySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategoryBodySchema>;
