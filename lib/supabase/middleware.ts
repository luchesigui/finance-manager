import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  const GUEST_COOKIE_NAME = "fp_guest";

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({
          request,
        });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Use getClaims() to validate the JWT signature against the project's published public keys
  // This is safer than getUser() or getSession() in server code
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  // Guest mode: if there is no authenticated user, ensure a stable guest cookie exists.
  // All guest data is scoped to this cookie id and may be lost if cookies are cleared.
  if (!claims) {
    const existingGuestId = request.cookies.get(GUEST_COOKIE_NAME)?.value;
    if (!existingGuestId) {
      const guestId = crypto.randomUUID();
      supabaseResponse.cookies.set(GUEST_COOKIE_NAME, guestId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }
  }

  return supabaseResponse;
}
