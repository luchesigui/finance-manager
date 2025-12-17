import { NextResponse } from "next/server";

import { getSessionInfo } from "@/lib/server/financeStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionInfo();
    return NextResponse.json({ userId: session.userId, isGuest: session.isGuest });
  } catch (error) {
    console.error("Failed to get current user", error);
    return NextResponse.json({ userId: null, isGuest: true });
  }
}
