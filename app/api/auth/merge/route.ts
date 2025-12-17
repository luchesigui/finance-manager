import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mergeAnonymousData } from "@/lib/server/financeStore";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const anonymousId = cookieStore.get("anonymous_session_id")?.value;

  if (!anonymousId) {
    return NextResponse.json({ message: "No anonymous session to merge" });
  }

  try {
    await mergeAnonymousData(user.id, anonymousId);
    
    // Clear cookie
    cookieStore.delete("anonymous_session_id");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Merge failed:", error);
    return NextResponse.json({ error: "Merge failed" }, { status: 500 });
  }
}
