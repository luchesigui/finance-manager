import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth checks for login, signup, and auth routes to avoid loops
  // Also skip API routes as they handle their own auth
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next({ request });
  }

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

  if (!claims) {
    // If no user, check for anonymous cookie
    const anonymousCookie = request.cookies.get("anonymous_session_id");
    
    if (!anonymousCookie) {
      // Create new anonymous session
      const newAnonymousId = crypto.randomUUID();
      
      // Set cookie in response
      supabaseResponse.cookies.set("anonymous_session_id", newAnonymousId, {
        path: "/",
        sameSite: "lax",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
      });

      // Pass the new ID to the request headers so Server Components can see it immediately
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-anonymous-session-id", newAnonymousId);
      
      // Return response with modified request headers
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
        headers: supabaseResponse.headers, // Preserve any response headers/cookies
      });
    } else {
       // Cookie exists, ensure it's available in headers too just in case
       const requestHeaders = new Headers(request.headers);
       requestHeaders.set("x-anonymous-session-id", anonymousCookie.value);
       
       // Clone response to attach headers? 
       // Actually, we modified supabaseResponse earlier.
       // But we need to pass the request headers forward.
       return NextResponse.next({
         request: {
           headers: requestHeaders,
         },
         headers: supabaseResponse.headers,
       });
    }
    
    // Allow access to the app (do not redirect to login)
    return supabaseResponse;
  }

  return supabaseResponse;
}
