import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    const userId = (claims as unknown as { sub?: string } | undefined)?.sub ?? null;
    return NextResponse.json({ userId, isGuest: !userId });
  } catch (error) {
    console.error("Failed to get current user", error);
    return NextResponse.json({ userId: null, isGuest: true });
  }
}
