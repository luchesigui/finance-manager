import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterAll, beforeEach } from "vitest";

// Each test file gets its own throwaway SQLite database. The env var must be
// set before any test imports src/db/db.ts (setup files run first).
// deleteTransaction/updateTransaction compute end dates via local-time Date;
// pin the timezone so assertions hold on any machine.
process.env.TZ = "America/Sao_Paulo";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "fortunate-vitest-"));
const dbPath = path.join(tempDir, "fortunate-test.db");
process.env.FORTUNATE_DB_PATH = dbPath;

const sqlite = new Database(dbPath);
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY,
    name text NOT NULL,
    avatar_initials text NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id text PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL,
    pillar_slug text NOT NULL
  );

  CREATE TABLE IF NOT EXISTS recurrence_templates (
    id text PRIMARY KEY,
    created_by_user_id text NOT NULL REFERENCES users(id),
    transaction_type text NOT NULL,
    description text NOT NULL,
    amount integer NOT NULL,
    category_id text REFERENCES categories(id),
    assigned_to_user_id text NOT NULL REFERENCES users(id),
    para_quem_user_id text REFERENCES users(id),
    day_of_month integer NOT NULL,
    start_date text NOT NULL,
    end_date text,
    is_active integer NOT NULL DEFAULT 1,
    is_credit_card integer NOT NULL DEFAULT 0,
    next_invoice integer NOT NULL DEFAULT 0,
    nao_entra_divisao integer NOT NULL DEFAULT 0,
    is_previsao integer NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id text PRIMARY KEY,
    created_by_user_id text NOT NULL REFERENCES users(id),
    transaction_type text NOT NULL,
    description text NOT NULL,
    amount integer NOT NULL,
    category_id text REFERENCES categories(id),
    date text NOT NULL,
    assigned_to_user_id text NOT NULL REFERENCES users(id),
    para_quem_user_id text REFERENCES users(id),
    is_credit_card integer NOT NULL DEFAULT 0,
    next_invoice integer NOT NULL DEFAULT 0,
    nao_entra_divisao integer NOT NULL DEFAULT 0,
    is_previsao integer NOT NULL DEFAULT 0,
    is_recorrente integer NOT NULL DEFAULT 0,
    is_parcelado integer NOT NULL DEFAULT 0,
    num_parcelas integer,
    parcela_numero integer,
    recurrence_template_id text REFERENCES recurrence_templates(id),
    is_overridden integer NOT NULL DEFAULT 0,
    is_deleted integer NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    id text PRIMARY KEY,
    default_payer_id text REFERENCES users(id),
    emergency_fund integer,
    openrouter_key text,
    theme text DEFAULT 'dark',
    pillar_targets text
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id text PRIMARY KEY,
    name text NOT NULL,
    key text NOT NULL UNIQUE,
    created_at text NOT NULL
  );
`);
sqlite.close();

beforeEach(async () => {
  // db.ts seeds users/categories/settings on first import; between tests we
  // only wipe the mutable tables so every test starts from a clean slate.
  const { db } = await import("../db/db");
  const schema = await import("../db/schema");
  db.delete(schema.transactions).run();
  db.delete(schema.recurrenceTemplates).run();
  db.delete(schema.apiKeys).run();
});

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});
