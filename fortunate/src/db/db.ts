import path from "node:path";
import { DEFAULT_PILLAR_TARGETS } from "@/utils/pillars";
import Database from "better-sqlite3";
import { eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const dbPath = process.env.FORTUNATE_DB_PATH ?? path.resolve(process.cwd(), "fortunate.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

// Helper to seed database if empty
export async function initializeDatabase() {
  // Ensure tables exist. We can do a basic check by querying users.
  // If the query fails, it means the table doesn't exist, which implies we need to run migrations.
  // However, we can also perform this check and insert seed data if users table is empty.
  try {
    const existingUsers = db.select().from(schema.users).all();
    if (existingUsers.length === 0) {
      console.log("Seeding database...");

      // Insert users
      const guilhermeId = "guilherme";
      const amandaId = "amanda";

      db.insert(schema.users)
        .values([
          { id: guilhermeId, name: "Guilherme", avatarInitials: "GU" },
          { id: amandaId, name: "Amanda", avatarInitials: "AM" },
        ])
        .run();

      // Insert initial categories
      const initialCategories = [
        { id: "alimentacao", name: "Alimentação", slug: "alimentacao", pillarSlug: "essenciais" },
        { id: "transporte", name: "Transporte", slug: "transporte", pillarSlug: "essenciais" },
        { id: "moradia", name: "Moradia", slug: "moradia", pillarSlug: "essenciais" },
        { id: "saude", name: "Saúde", slug: "saude", pillarSlug: "essenciais" },
        { id: "educacao", name: "Educação", slug: "educacao", pillarSlug: "conhecimento" },
        { id: "lazer", name: "Lazer e Entretenimento", slug: "lazer", pillarSlug: "prazeres" },
        { id: "vestuario", name: "Vestuário", slug: "vestuario", pillarSlug: "conforto" },
        {
          id: "assinaturas",
          name: "Assinaturas e Serviços",
          slug: "assinaturas",
          pillarSlug: "prazeres",
        },
        { id: "outros", name: "Outros", slug: "outros", pillarSlug: "conforto" },
      ];

      db.insert(schema.categories).values(initialCategories).run();

      console.log("Database seeded successfully.");
    }

    // O row de settings pode faltar em bancos criados antes dele existir
    const existingSettings = db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.id, "default"))
      .get();
    if (!existingSettings) {
      db.insert(schema.settings)
        .values({
          id: "default",
          defaultPayerId: "guilherme",
          emergencyFund: 3500000,
          theme: "dark",
          pillarTargets: JSON.stringify(DEFAULT_PILLAR_TARGETS),
        })
        .run();
    }

    // Backfill: settings antigas sem pillarTargets recebem o default
    db.update(schema.settings)
      .set({ pillarTargets: JSON.stringify(DEFAULT_PILLAR_TARGETS) })
      .where(isNull(schema.settings.pillarTargets))
      .run();
  } catch (error) {
    console.error("Error during database initialization/seeding:", error);
  }
}

// Inicializa o banco de dados imediatamente no carregamento
initializeDatabase();
