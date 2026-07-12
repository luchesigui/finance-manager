import type * as schema from "@/db/schema";
import type { PillarTargets } from "@/utils/pillars";

// Shapes das respostas da API, derivados do schema do banco (import type é apagado no build)
export type Transaction = typeof schema.transactions.$inferSelect;
export type Category = typeof schema.categories.$inferSelect;
export type User = typeof schema.users.$inferSelect;
export type RecurrenceTemplate = typeof schema.recurrenceTemplates.$inferSelect;
export type Reserve = typeof schema.reserves.$inferSelect;

// GET /api/settings devolve pillarTargets já parseado
export type Settings = Omit<typeof schema.settings.$inferSelect, "pillarTargets"> & {
  pillarTargets: PillarTargets;
};

// GET /api/api-keys nunca devolve a chave completa
export interface ApiKeySummary {
  id: string;
  name: string;
  createdAt: string;
  keyPreview: string;
}

// POST /api/api-keys devolve a chave completa uma única vez
export interface CreatedApiKey extends Omit<ApiKeySummary, "keyPreview"> {
  key: string;
}

export type RecurrenceOption = "only_this" | "all" | "future";
export type TransactionType = "expense" | "income" | "transfer";
