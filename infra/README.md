# Infrastructure

Database migrations and Supabase setup for finance-manager.

---

## Local vs online

| | **Local** | **Online (Supabase Cloud)** |
|---|-----------|-----------------------------|
| **Purpose** | Development and testing on your machine | Staging/production; shared or deployed app |
| **Database** | Supabase running in Docker via CLI | Hosted project in [Supabase Dashboard](https://supabase.com/dashboard) |
| **Config** | `infra/supabase/config.toml` | Project settings in the dashboard |
| **Migrations** | Applied automatically on first start and on every reset | Applied manually (or by CI) via `npm run db:push` |
| **Seed data** | Applied automatically after migrations (first start / reset) | Not used; you use real or manually added data |
| **App connection** | `.env.local` pointing at local Supabase URLs/keys | `.env.local` pointing at the project’s API URL and anon key |

Use **local** for day-to-day dev and migration authoring. Use **online** when you need a persistent database or to run the app against a real project.

---

## Local setup

### config.toml (local Supabase)

`infra/supabase/config.toml` is the configuration for the **local** Supabase stack (API, DB, Studio, Auth, etc.). It is used only when you run `npm run db:start` (or `npm run dev`, which starts it automatically).

- **First start** and **every reset**:
  - All migrations in `infra/supabase/migrations/` are applied.
  - Then `infra/supabase/seed.sql` is run (test user e.g. `dev@example.com` / `password123`).
- So you get a clean, migrated DB with seed data whenever you start or reset locally.

### Running locally

1. **`.env.local`** at the repo root must point at the **local** Supabase instance. After `npm run db:start`, run `npm run db:status` to get the local API URL and anon key and put them in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).

2. Start the stack and the app:
   ```bash
   npm run db:start   # or just: npm run dev (predev runs db:start)
   npm run dev
   ```

3. When you are done, stop the stack:
   ```bash
   npm run db:stop    # or stop the dev server and postdev will run db:stop
   ```

### After adding a new migration (local)

The local DB does **not** auto-apply new migration files you add. To apply them:

- Run **`npm run db:reset`**.

This reapplies all migrations and runs the seed again. **All local data will be lost.** Use this whenever you create or change a migration so your local DB matches the migration set.

---

## Online setup (Supabase Cloud)

Here the app connects to a **remote** Supabase project. You use the same `.env.local` file but with that project’s URL and anon key; migrations are applied with the CLI (or CI).

### Connecting the app to the online DB

1. In the [Supabase Dashboard](https://supabase.com/dashboard), open your project → **Project Settings** → **API**.
2. Put in **root `.env.local`**:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) = anon/public key

The app will then use the online database. No need to run migrations for this step if the project already has the right schema.

### First-time: run migrations on the online database

If the project is **new** or has never had migrations applied, you need to link the repo to the project and push migrations once.

1. **Root `.env.local`** must also contain (see `infra/.env.example` for names):
   - `SUPABASE_ACCESS_TOKEN` — [create in Supabase](https://supabase.com/dashboard/account/tokens)
   - `SUPABASE_PROJECT_REF` — project ref from the dashboard URL or Project Settings → General
   - `SUPABASE_DB_PASSWORD` — database password (Project Settings → Database)

2. **Link** the CLI to the remote project:
   ```bash
   npm run db:link
   ```
   When prompted for the database password, use the same value as `SUPABASE_DB_PASSWORD` (or rely on that env var for the next step).

3. **Apply migrations**:
   ```bash
   npm run db:push:dry   # optional: preview
   npm run db:push       # apply
   ```

After this, the online DB is up to date. For future migration changes, use the same flow: update migrations locally, then run `npm run db:push` (or let CI do it).

### Edge Functions

The **monthly-close** Edge Function runs `run_monthly_close` for one or all households (e.g. to close the previous month). It is used by Cron or manually via `POST /api/admin/monthly-close`.

**Deploy** (same env as migrations: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` in `.env.local`; project must be linked):

```bash
npm run functions:deploy
```

This deploys `infra/supabase/functions/monthly-close`. After deploy, set the function’s secrets in the Supabase Dashboard (Project Settings → Edge Functions → monthly-close → Secrets): `ADMIN_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. See `infra/supabase/functions/monthly-close/README.md` for behavior and local testing.

CI deploys this function on every push to `main` (after migrations).

### Optional: interactive login

Instead of access tokens, you can run `npx supabase login` once; then `npm run db:link` can prompt for project and password. Re-auth when the session expires.

---

## Creating a new migration

1. **Create** the migration file:
   ```bash
   npm run db:new -- add_user_preferences
   ```
   This creates `infra/supabase/migrations/YYYYMMDDHHMMSS_add_user_preferences.sql`.

2. **Edit** the new `.sql` file and write your schema changes.

3. **Test locally**: reset the local DB so the new migration is applied (and seed runs again):
   ```bash
   npm run db:reset
   ```
   **Warning:** This wipes all local data.

4. **Apply to the online DB** when ready:
   ```bash
   npm run db:push:dry   # optional: preview
   npm run db:push
   ```

---

## Reference

### config.toml

`infra/supabase/config.toml` — config for the **local** Supabase stack only. Sections: `[api]`, `[db]`, `[studio]`, `[auth]`, `[storage]`, `[db.seed]`. Local project id: `project_id = "finance-pro-local"`.

### seed.sql

`infra/supabase/seed.sql` — seed data for the **local** DB (e.g. test user). Runs automatically on `npm run db:start` (first time) and on every `npm run db:reset`. Not used for the online database.

### Commands

| Command | Purpose |
|--------|---------|
| `npm run db:start` | Start local Supabase |
| `npm run db:stop` | Stop local stack |
| `npm run db:reset` | Reset local DB (apply all migrations + seed; **all local data is lost**) |
| `npm run db:link` | Link CLI to remote project (uses `.env.local` vars) |
| `npm run db:push` | Push migrations to linked remote project |
| `npm run db:push:dry` | Preview migrations on remote without applying |
| `npm run db:diff` | Generate diff from remote (requires link) |
| `npm run db:new -- <name>` | Create new migration file |
| `npm run db:status` | Show local Supabase URLs and keys |
| `npm run functions:deploy` | Deploy Edge Functions (e.g. monthly-close) to the linked project |

### CI

The [Run migrations](../.github/workflows/migrate.yml) workflow runs on push to `main`: it applies migrations to the remote database and deploys Edge Functions. Repository secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`.
