// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type MonthlyCloseRequest = {
  year?: number;
  month?: number;
  householdId?: string;
  source?: string;
};

function getTargetPeriod(now = new Date()): { year: number; month: number } {
  // Cron is defined as GMT-3. Shift now before calculating the previous month.
  const shifted = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth() + 1;

  if (month === 1) {
    return { year: year - 1, month: 12 };
  }

  return { year, month: month - 1 };
}

function isAuthorized(req: Request): boolean {
  const configuredKey = Deno.env.get("ADMIN_API_KEY");
  if (!configuredKey) return false;

  const authHeader = req.headers.get("authorization") ?? "";
  const [scheme, token] = authHeader.split(" ");
  return scheme?.toLowerCase() === "bearer" && token === configuredKey;
}

Deno.serve(async (request) => {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase service role env vars" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let payload: MonthlyCloseRequest = {};
  try {
    if (request.headers.get("content-length") !== "0") {
      payload = (await request.json()) as MonthlyCloseRequest;
    }
  } catch {
    // Empty body is valid.
  }

  const period =
    payload.year && payload.month
      ? { year: payload.year, month: payload.month }
      : getTargetPeriod();
  const source = payload.source ?? "cron";

  let householdIds: string[] = [];
  if (payload.householdId) {
    householdIds = [payload.householdId];
  } else {
    const { data, error } = await client.from("households").select("id");
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    householdIds = (data ?? []).map((row) => row.id);
  }

  const results: Array<Record<string, unknown>> = [];

  for (const householdId of householdIds) {
    const startedAt = Date.now();
    const { data, error } = await client.rpc("run_monthly_close", {
      p_household_id: householdId,
      p_year: period.year,
      p_month: period.month,
      p_source: source,
    });

    const durationMs = Date.now() - startedAt;
    const result = {
      household_id: householdId,
      year: period.year,
      month: period.month,
      status: error ? "error" : "ok",
      duration_ms: durationMs,
      data,
      error: error?.message ?? null,
    };

    console.log(JSON.stringify(result));
    results.push(result);
  }

  const failed = results.filter((entry) => entry.status === "error").length;

  return new Response(
    JSON.stringify({
      ok: failed === 0,
      year: period.year,
      month: period.month,
      source,
      processed: results.length,
      failed,
      results,
    }),
    {
      status: failed === 0 ? 200 : 207,
      headers: { "Content-Type": "application/json" },
    },
  );
});
