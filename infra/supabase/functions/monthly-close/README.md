# monthly-close (Edge Function)

Edge Function that closes a month for one or many households by calling `public.run_monthly_close(...)`.

## Behavior

- Default target period: previous month in GMT-3.
- Optional body override: `{ "year": 2026, "month": 2, "householdId": "...", "source": "manual" }`.
- Auth: `Authorization: Bearer <ADMIN_API_KEY>`.
- Uses service role to iterate households and execute DB function idempotently.

## Local run

```bash
supabase functions serve monthly-close --workdir infra
```

```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"year":2026,"month":2}' \
  http://127.0.0.1:54321/functions/v1/monthly-close
```

## Deploy

Requires Supabase auth: run `npx supabase login` once, or set `SUPABASE_ACCESS_TOKEN` in `.env.local`. Ensure the project is linked (`npm run db:link`).

```bash
npm run functions:deploy
```

After deploy, set Edge Function secrets in Supabase Dashboard (Project Settings → Edge Functions → Secrets): `ADMIN_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## Cron suggestion

Run on day 1, 00:00 (GMT-3), calling this function with the same bearer key.
