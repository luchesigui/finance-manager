import { requireAuthWithHousehold } from "@/lib/server/requestBodyValidation";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAuthWithHousehold();
  if (!auth.success) return auth.response;

  const url = new URL(request.url);
  const month = url.searchParams.get("month"); // Format: YYYY-MM

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Missing or invalid month format" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: analysis, error } = await supabase
      .from("ai_analyses")
      .select(`
        id,
        household_id,
        reference_month,
        created_by,
        created_at,
        ai_insights (
          id,
          type,
          title,
          description,
          comment,
          is_deleted,
          is_archived
        )
      `)
      .eq("household_id", auth.householdId)
      .eq("reference_month", month)
      .maybeSingle();

    if (error) throw error;

    if (!analysis) {
      return NextResponse.json(null);
    }

    // Format fields from snake_case to camelCase
    return NextResponse.json({
      id: analysis.id,
      householdId: analysis.household_id,
      referenceMonth: analysis.reference_month,
      createdBy: analysis.created_by,
      createdAt: analysis.created_at,
      insights: (analysis.ai_insights || []).map(
        (insight: {
          id: string;
          type: string;
          title: string;
          description: string;
          comment?: string | null;
          is_deleted?: boolean;
          is_archived?: boolean;
        }) => ({
          id: insight.id,
          type: insight.type,
          title: insight.title,
          description: insight.description,
          comment: insight.comment ?? null,
          isDeleted: insight.is_deleted ?? false,
          isArchived: insight.is_archived ?? false,
        }),
      ),
    });
  } catch (error) {
    console.error("Failed to fetch latest AI analysis:", error);
    return NextResponse.json({ error: "Failed to fetch AI analysis" }, { status: 500 });
  }
}
