import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { adminMonthlyCloseBodySchema } from "@/lib/schemas";
import { readJsonBody, validateBody } from "@/lib/server/requestBodyValidation";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const configuredKey = process.env.ADMIN_API_KEY;
  if (!configuredKey) return false;

  const authHeader = request.headers.get("authorization") ?? "";
  const [scheme, token] = authHeader.split(" ");
  return scheme?.toLowerCase() === "bearer" && token === configuredKey;
}

function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readJsonBody(request);
  const validation = validateBody(body, adminMonthlyCloseBodySchema);
  if (!validation.success) {
    return validation.response;
  }

  const { year, month, householdId, dryRun = false } = validation.data;

  try {
    const supabase = createAdminSupabaseClient();

    let householdIds: string[] = [];
    if (householdId) {
      householdIds = [householdId];
    } else {
      const { data, error } = await supabase.from("households").select("id");
      if (error) throw error;
      householdIds = (data ?? []).map((row) => row.id);
    }

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        year,
        month,
        householdIds,
      });
    }

    const results = await Promise.all(
      householdIds.map(async (id) => {
        const startedAt = Date.now();
        const { data, error } = await supabase.rpc("run_monthly_close", {
          p_household_id: id,
          p_year: year,
          p_month: month,
          p_source: "manual_api",
        });

        return {
          householdId: id,
          ok: !error,
          durationMs: Date.now() - startedAt,
          result: error ? null : data,
          error: error?.message ?? null,
        };
      }),
    );

    const failed = results.filter((item) => !item.ok);
    const status = failed.length === 0 ? 200 : 207;

    return NextResponse.json(
      {
        ok: failed.length === 0,
        year,
        month,
        processed: results.length,
        failed: failed.length,
        results,
      },
      { status },
    );
  } catch (error) {
    console.error("Failed to run monthly close:", error);
    return NextResponse.json({ error: "Failed to run monthly close" }, { status: 500 });
  }
}
