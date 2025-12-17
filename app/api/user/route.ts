import { NextResponse } from "next/server";

import { getCurrentUserId } from "@/lib/server/financeStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    return NextResponse.json({ userId });
  } catch (error) {
    console.error("Failed to get current user", error);
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}
