import { NextResponse } from "next/server";

import { readJsonBody, requireAuth } from "@/lib/server/requestBodyValidation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchBodySchema = z.object({
  comment: z.string().nullable().optional(),
  isDeleted: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing insight ID" }, { status: 400 });
  }

  const body = await readJsonBody(request);
  const result = patchBodySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { comment, isDeleted, isArchived } = result.data;

  // biome-ignore lint/suspicious/noExplicitAny: supabase update payload is dynamic
  const updateData: Record<string, any> = {};
  if (comment !== undefined) {
    updateData.comment = comment;
  }
  if (isDeleted !== undefined) {
    updateData.is_deleted = isDeleted;
  }
  if (isArchived !== undefined) {
    updateData.is_archived = isArchived;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_insights")
    .update(updateData)
    .eq("id", id)
    .select(`
      id,
      type,
      title,
      description,
      comment,
      is_deleted,
      is_archived
    `)
    .maybeSingle();

  if (error) {
    console.error("Failed to update AI insight:", error);
    return NextResponse.json({ error: "Failed to update insight" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Insight not found or access denied" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    insight: {
      id: data.id,
      type: data.type,
      title: data.title,
      description: data.description,
      comment: data.comment ?? null,
      isDeleted: data.is_deleted ?? false,
      isArchived: data.is_archived ?? false,
    },
  });
}
