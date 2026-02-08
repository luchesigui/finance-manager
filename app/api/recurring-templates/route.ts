import { NextResponse } from "next/server";

import {
  createRecurringTemplate,
  getRecurringTemplates,
} from "@/features/recurring-templates/server/store";
import { createRecurringTemplateSchema } from "@/lib/schemas";
import { readJsonBody, requireAuth, validateBody } from "@/lib/server/requestBodyValidation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  try {
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get("includeInactive") === "true";
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");

    const limit = Math.min(limitParam ? Number.parseInt(limitParam, 10) : 100, 100);
    const offset = offsetParam ? Number.parseInt(offsetParam, 10) : 0;

    const result = await getRecurringTemplates({
      activeOnly: !includeInactive,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch recurring templates:", error);
    return NextResponse.json({ error: "Failed to fetch recurring templates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const body = await readJsonBody(request);
  const validation = validateBody(body, createRecurringTemplateSchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    const created = await createRecurringTemplate(validation.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create recurring template:", error);
    return NextResponse.json({ error: "Failed to create recurring template" }, { status: 500 });
  }
}
