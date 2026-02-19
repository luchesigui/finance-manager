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
    isCreditCard: z.boolean(),
    isNextBilling: z.boolean(),
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
    isCreditCard: z.boolean(),
    isNextBilling: z.boolean(),
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
  recurringTemplateId: z.number().int().positive().nullable().optional(),
  isCreditCard: z.boolean(),
  isNextBilling: z.boolean().default(false),
  excludeFromSplit: z.boolean(),
  isForecast: z.boolean().default(false),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
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
// Emergency Fund Schema
// ============================================================================

export const updateEmergencyFundBodySchema = z.object({
  amount: z.number().nonnegative(),
});

// ============================================================================
// Simulation Schemas
// ============================================================================

const manualExpenseSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.number(),
});

const expenseOverridesSchema = z.object({
  ignoredExpenseIds: z.array(z.string()),
  manualExpenses: z.array(manualExpenseSchema),
});

const simulationParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  realIncome: z.number(),
  isActive: z.boolean(),
  incomeMultiplier: z.number(),
  simulatedIncome: z.number(),
});

const simulationStateSchema = z.object({
  participants: z.array(simulationParticipantSchema),
  scenario: z.enum(["currentMonth", "minimalist", "realistic", "custom"]),
  expenseOverrides: expenseOverridesSchema,
});

export const createSimulationBodySchema = z.object({
  name: z.string().min(1),
  state: simulationStateSchema,
});

export const updateSimulationBodySchema = z.object({
  name: z.string().min(1).optional(),
  state: simulationStateSchema.optional(),
});

// ============================================================================
// Simulation Project Schema (for POST /api/simulations/project)
// ============================================================================

const personSchema = z.object({
  id: z.string(),
  name: z.string(),
  income: z.number(),
  householdId: z.string().optional(),
  linkedUserId: z.string().optional(),
});

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  targetPercent: z.number(),
  householdId: z.string().optional(),
});

const transactionSchema = z.object({
  id: z.number(),
  description: z.string(),
  amount: z.number(),
  categoryId: z.string().nullable(),
  paidBy: z.string(),
  recurringTemplateId: z.number().int().positive().nullable().optional(),
  isCreditCard: z.boolean().optional(),
  excludeFromSplit: z.boolean().optional(),
  isForecast: z.boolean().optional(),
  date: z.string(),
  type: z.enum(["expense", "income"]).optional(),
  isIncrement: z.boolean().optional(),
});

export const simulationProjectBodySchema = z.object({
  people: z.array(personSchema).min(1),
  transactions: z.array(transactionSchema),
  categories: z.array(categorySchema),
  emergencyFund: z.number().nonnegative(),
  state: simulationStateSchema,
  customExpensesValue: z.number().nonnegative().default(0),
});

// ============================================================================
// Recurring Template Schemas
// ============================================================================

export const createRecurringTemplateSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  categoryId: z.string().nullable(),
  paidBy: z.string().min(1),
  type: transactionTypeSchema.default("expense"),
  isIncrement: z.boolean().default(true),
  isCreditCard: z.boolean().default(false),
  isNextBilling: z.boolean().default(false),
  excludeFromSplit: z.boolean().default(false),
  dayOfMonth: z.number().int().min(1).max(31),
  isActive: z.boolean().default(true),
});

export const recurringTemplatePatchSchema = createRecurringTemplateSchema.partial();

export const updateRecurringTemplateBodySchema = z.object({
  patch: recurringTemplatePatchSchema,
  scope: z.enum(["template_only", "full_history"]).optional(),
});

export const adminMonthlyCloseBodySchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  householdId: z.string().uuid().optional(),
  dryRun: z.boolean().optional(),
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
export type CreateRecurringTemplateInput = z.infer<typeof createRecurringTemplateSchema>;
export type RecurringTemplatePatchInput = z.infer<typeof recurringTemplatePatchSchema>;
