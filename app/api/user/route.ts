import { NextResponse } from "next/server";

import { readJsonBody, requireAuth } from "@/lib/server/requestBodyValidation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchBodySchema = z.object({
  openrouterApiKey: z.string().nullable().optional(),
  aiAnalysisMonths: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => [3, 6, 12].includes(val))
    .optional(),
  aiCustomContext: z.string().nullable().optional(),
});

export async function GET() {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("openrouter_api_key, ai_analysis_months, ai_custom_context")
    .eq("id", auth.userId)
    .single();

  if (error) {
    console.error("Failed to fetch profile settings:", error);
    return NextResponse.json({ userId: auth.userId });
  }

  return NextResponse.json({
    userId: auth.userId,
    openrouterApiKeyConfigured: !!profile?.openrouter_api_key,
    aiAnalysisMonths: profile?.ai_analysis_months ?? 3,
    aiCustomContext: profile?.ai_custom_context ?? null,
  });
}

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const body = await readJsonBody(request);
  const result = patchBodySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { openrouterApiKey, aiAnalysisMonths, aiCustomContext } = result.data;
  // biome-ignore lint/suspicious/noExplicitAny: supabase update payload is dynamic
  const updateData: Record<string, any> = {};

  if (aiAnalysisMonths !== undefined) {
    updateData.ai_analysis_months = aiAnalysisMonths;
  }
  if (aiCustomContext !== undefined) {
    updateData.ai_custom_context = aiCustomContext;
  }

  // Only update API key if it's not the mask value
  if (openrouterApiKey !== undefined) {
    if (openrouterApiKey === "" || openrouterApiKey === null) {
      updateData.openrouter_api_key = null;
    } else if (openrouterApiKey !== "••••••••") {
      updateData.openrouter_api_key = openrouterApiKey;
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(updateData).eq("id", auth.userId);

  if (error) {
    console.error("Failed to update profile settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
