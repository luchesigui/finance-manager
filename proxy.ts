import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth routes)
     * - login (login page - to avoid loops)
     * - signup (signup page - to avoid loops)
     * - api (api routes - optionally exclude if handled separately, but usually we want protection)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|login|signup|auth|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// Note: The home page "/" is included in the matcher but handles auth check internally
// to show either the landing page (unauthenticated) or redirect to dashboard (authenticated)
