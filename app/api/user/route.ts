import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/server/requestBodyValidation";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  return NextResponse.json({ userId: auth.userId });
}
