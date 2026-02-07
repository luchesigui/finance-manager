# Infrastructure

Database migrations for finance-manager.

## Quick Start (new to the project)

Get migrations and the app running against the remote Supabase project:

1. **Login** to Supabase (opens browser):
   ```bash
   npx supabase login
   ```

2. **Link** to the remote project:
   ```bash
   npm run db:link
   ```
   Choose the project and enter the database password when prompted.

3. **Apply migrations**:
   ```bash
   npm run db:push
   ```

4. **Run the app** – ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) from the [Supabase dashboard](https://supabase.com/dashboard) → Project Settings → API. Then:
   ```bash
   npm run dev
   ```

---

## Reference

### config.toml

`infra/supabase/config.toml` configures the local Supabase stack (`npm run db:start`). Key: `project_id`, `[api]`, `[db]`, `[studio]`, `[auth]`, `[storage]`.

### seed.sql

Seeds the local DB with test data (`dev@example.com` / `password123`). Runs on `npm run db:reset` or a fresh `npm run db:start`.

### Commands

| Command | Purpose |
|---------|---------|
| `npm run db:start` | Start local Supabase |
| `npm run db:stop` | Stop local stack |
| `npm run db:push` | Push migrations to linked project |
| `npm run db:push:dry` | Preview migrations without applying |
| `npm run db:reset` | Reset local DB (migrations + seed) |
| `npm run db:link` | Link to remote project |
| `npm run db:new -- <name>` | Create new migration file |

### Creating a new migration

```bash
npm run db:new -- add_user_preferences
# Edit infra/supabase/migrations/YYYYMMDDHHMMSS_add_user_preferences.sql
npm run db:push:dry   # optional: preview
npm run db:push       # apply
```
