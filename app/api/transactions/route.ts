import { NextResponse } from "next/server";

import {
  createTransaction,
  getRecurringTransactions,
  getTransactions,
} from "@/features/transactions/server/store";
import { createTransactionsBodySchema } from "@/lib/schemas";
import { readJsonBody, requireAuth, validateBody } from "@/lib/server/requestBodyValidation";

export const dynamic = "force-dynamic";

/**
 * GET /api/transactions
 * Fetches transactions, optionally filtered by year and month.
 */
export async function GET(request: Request) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  try {
    const url = new URL(request.url);
    const recurringOnly = url.searchParams.get("recurringOnly") === "true";

    if (recurringOnly) {
      const limitParam = url.searchParams.get("limit");
      const offsetParam = url.searchParams.get("offset");
      const pageParam = url.searchParams.get("page");
      const limit = Math.min(limitParam ? Number.parseInt(limitParam, 10) : 100, 100);
      const offset =
        offsetParam !== null && offsetParam !== ""
          ? Number.parseInt(offsetParam, 10)
          : pageParam !== null && pageParam !== ""
            ? (Math.max(1, Number.parseInt(pageParam, 10)) - 1) * limit
            : 0;
      const { transactions, total } = await getRecurringTransactions({
        limit,
        offset,
      });
      return NextResponse.json({ transactions, total });
    }

    const yearParam = url.searchParams.get("year");
    const monthParam = url.searchParams.get("month");
    const year = yearParam ? Number.parseInt(yearParam, 10) : undefined;
    const month = monthParam ? Number.parseInt(monthParam, 10) : undefined;

    const transactions = await getTransactions(year, month);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  let userId: string | undefined;
  let householdId: string | undefined;
  let defaultPayerId: string | null = null;
  let isTokenAuth = false;
  // biome-ignore lint/suspicious/noExplicitAny: adminClient is a dynamic supabase client instance
  let adminClient: any;

  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.substring(7);
    const jwtSecret = process.env.API_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (jwtSecret) {
      const { verifyJwt } = await import("@/lib/server/jwt");
      const payload = verifyJwt(token, jwtSecret);

      if (payload?.userId && typeof payload.userId === "string") {
        userId = payload.userId;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && serviceRoleKey) {
          const { createClient: createSupabaseJsClient } = await import("@supabase/supabase-js");
          adminClient = createSupabaseJsClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          });

          // Fetch salt to verify token has not been revoked
          const { data: profile } = await adminClient
            .from("profiles")
            .select("api_token_salt")
            .eq("id", userId)
            .single();

          if (profile && profile.api_token_salt === payload.salt) {
            const { data: member } = await adminClient
              .from("household_members")
              .select("household_id")
              .eq("user_id", userId)
              .limit(1)
              .single();

            if (member) {
              householdId = member.household_id;
              isTokenAuth = true;

              const { data: household } = await adminClient
                .from("households")
                .select("default_payer_id")
                .eq("id", householdId)
                .single();

              if (household) {
                defaultPayerId = household.default_payer_id;
              }
            }
          }
        }
      }
    }
  }

  // Fallback to session authentication if token auth wasn't used or succeeded
  if (!isTokenAuth) {
    const { requireAuthWithHousehold } = await import("@/lib/server/requestBodyValidation");
    const auth = await requireAuthWithHousehold();
    if (!auth.success) return auth.response;
    userId = auth.userId;
    householdId = auth.householdId;
  }

  const rawBody = await readJsonBody(request);

  // biome-ignore lint/suspicious/noExplicitAny: payload item is raw dynamic input
  const processPayloadItem = (item: any) => {
    if (!item || typeof item !== "object") return item;
    const processed = { ...item };

    if (isTokenAuth) {
      if (processed.paidBy === undefined || processed.paidBy === null) {
        processed.paidBy = defaultPayerId || "";
      }
      if (processed.type === undefined) {
        processed.type = "expense";
      }
      if (processed.isForecast === undefined) {
        processed.isForecast = false;
      }
      if (processed.isCreditCard === undefined) {
        processed.isCreditCard = false;
      }
      if (processed.excludeFromSplit === undefined) {
        processed.excludeFromSplit = false;
      }
      if (processed.isNextBilling === undefined) {
        processed.isNextBilling = false;
      }
      if (processed.categoryId === undefined) {
        processed.categoryId = null;
      }
      if (!processed.date) {
        processed.date = new Date().toISOString().split("T")[0];
      }
    }
    return processed;
  };

  const body = Array.isArray(rawBody)
    ? rawBody.map(processPayloadItem)
    : processPayloadItem(rawBody);
  const validation = validateBody(body, createTransactionsBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    const payload = Array.isArray(validation.data) ? validation.data : [validation.data];
    const created = await Promise.all(
      payload.map((transaction) => createTransaction(transaction, adminClient, householdId)),
    );

    return NextResponse.json(Array.isArray(validation.data) ? created : created[0], {
      status: 201,
    });
  } catch (error) {
    console.error("Failed to create transactions:", error);
    return NextResponse.json({ error: "Failed to create transactions" }, { status: 500 });
  }
}
