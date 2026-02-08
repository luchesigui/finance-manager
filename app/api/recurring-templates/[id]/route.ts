import { NextResponse } from "next/server";

import {
  deleteRecurringTemplate,
  getRecurringTemplate,
  updateRecurringTemplate,
} from "@/features/recurring-templates/server/store";
import { updateRecurringTemplateBodySchema } from "@/lib/schemas";
import {
  parseNumericId,
  readJsonBody,
  requireAuth,
  validateBody,
} from "@/lib/server/requestBodyValidation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const { id } = await params;
  const templateId = parseNumericId(id);

  if (templateId === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const template = await getRecurringTemplate(templateId);
    if (!template) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(template);
  } catch (error) {
    console.error("Failed to fetch recurring template:", error);
    return NextResponse.json({ error: "Failed to fetch recurring template" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const { id } = await params;
  const templateId = parseNumericId(id);

  if (templateId === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await readJsonBody(request);
  const validation = validateBody(body, updateRecurringTemplateBodySchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    const existing = await getRecurringTemplate(templateId);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const scope = validation.data.scope ?? "template_only";
    const updated = await updateRecurringTemplate(templateId, validation.data.patch, {
      scope,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update recurring template:", error);
    return NextResponse.json({ error: "Failed to update recurring template" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const { id } = await params;
  const templateId = parseNumericId(id);

  if (templateId === null) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const scopeParam = searchParams.get("scope");
  const scope =
    scopeParam === "full_history" ? ("full_history" as const) : ("template_only" as const);
  const purgeTransactions = searchParams.get("purgeTransactions") === "true";
  const fromDate = searchParams.get("fromDate") ?? undefined;

  try {
    const existing = await getRecurringTemplate(templateId);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteRecurringTemplate(templateId, {
      scope,
      purgeTransactions,
      fromDate,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete recurring template:", error);
    return NextResponse.json({ error: "Failed to delete recurring template" }, { status: 500 });
  }
}
