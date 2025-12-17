import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/server/financeStore";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const cookieStore = await cookies();
    const anonymousId = cookieStore.get("anonymous_session_id")?.value;
    
    let shouldMerge = false;
    if (userId && anonymousId) {
       shouldMerge = true;
    }
    
    // Debug: Check if Service Role Key is set
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    return NextResponse.json({ 
      userId, 
      isAnonymous: !userId, 
      shouldMerge, 
      anonymousId,
      hasServiceKey 
    });
  } catch (error) {
    console.error("Failed to get current user", error);
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}
