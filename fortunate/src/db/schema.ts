import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  avatarInitials: text("avatar_initials").notNull(),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  pillarSlug: text("pillar_slug").notNull(), // essenciais, conforto, prazeres, conhecimento, planejamento, liberdade
});

export const recurrenceTemplates = sqliteTable("recurrence_templates", {
  id: text("id").primaryKey(),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => users.id),
  transactionType: text("transaction_type").notNull(), // 'expense' | 'income' | 'transfer'
  description: text("description").notNull(),
  amount: integer("amount").notNull(), // em centavos
  categoryId: text("category_id").references(() => categories.id),
  assignedToUserId: text("assigned_to_user_id")
    .notNull()
    .references(() => users.id),
  paraQuemUserId: text("para_quem_user_id").references(() => users.id),
  dayOfMonth: integer("day_of_month").notNull(),
  startDate: text("start_date").notNull(), // YYYY-MM-DD
  endDate: text("end_date"), // YYYY-MM-DD
  isActive: integer("is_active").notNull().default(1), // booleano 0/1
  isCreditCard: integer("is_credit_card").notNull().default(0),
  nextInvoice: integer("next_invoice").notNull().default(0),
  naoEntraDivisao: integer("nao_entra_divisao").notNull().default(0),
  isPrevisao: integer("is_previsao").notNull().default(0),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => users.id),
  transactionType: text("transaction_type").notNull(), // 'expense' | 'income' | 'transfer'
  description: text("description").notNull(),
  amount: integer("amount").notNull(), // em centavos
  categoryId: text("category_id").references(() => categories.id),
  date: text("date").notNull(), // YYYY-MM-DD (data da compra/ocorrência)
  assignedToUserId: text("assigned_to_user_id")
    .notNull()
    .references(() => users.id),
  paraQuemUserId: text("para_quem_user_id").references(() => users.id),
  isCreditCard: integer("is_credit_card").notNull().default(0),
  nextInvoice: integer("next_invoice").notNull().default(0),
  naoEntraDivisao: integer("nao_entra_divisao").notNull().default(0),
  isPrevisao: integer("is_previsao").notNull().default(0),
  isRecorrente: integer("is_recorrente").notNull().default(0),
  isParcelado: integer("is_parcelado").notNull().default(0),
  numParcelas: integer("num_parcelas"),
  parcelaNumero: integer("parcela_numero"),
  recurrenceTemplateId: text("recurrence_template_id").references(() => recurrenceTemplates.id),
  isOverridden: integer("is_overridden").notNull().default(0),
  isDeleted: integer("is_deleted").notNull().default(0),
});

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(), // "default"
  defaultPayerId: text("default_payer_id").references(() => users.id),
  emergencyFund: integer("emergency_fund"),
  openrouterKey: text("openrouter_key"),
  theme: text("theme").default("dark"),
  pillarTargets: text("pillar_targets"), // JSON: { [pillarSlug]: percent }, soma 100
});

export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  createdAt: text("created_at").notNull(),
});
