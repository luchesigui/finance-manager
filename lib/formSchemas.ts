import { z } from "zod";

// ============================================================================
// Login/Auth Form Schemas
// ============================================================================

export const emailSchema = z.string().min(1, "Email é obrigatório").email("Email inválido");

export const passwordSchema = z.string().min(1, "Senha é obrigatória");

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

// ============================================================================
// Transaction Form Schemas
// ============================================================================

export const descriptionSchema = z.string().min(1, "Descrição é obrigatória");

export const amountSchema = z
  .number()
  .nullable()
  .refine((val) => val !== null && val > 0, {
    message: "Valor deve ser maior que zero",
  });

// ============================================================================
// Person Form Schemas
// ============================================================================

export const personNameSchema = z.string().min(1, "Nome é obrigatório");

export const incomeSchema = z
  .number()
  .nullable()
  .refine((val) => val !== null && val >= 0, {
    message: "Renda não pode ser negativa",
  });

export const createPersonFormSchema = z.object({
  name: personNameSchema,
  income: incomeSchema,
});

export type CreatePersonFormValues = z.infer<typeof createPersonFormSchema>;
