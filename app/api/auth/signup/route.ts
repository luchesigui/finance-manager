import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${
          request.headers.get("origin") ||
          process.env.NEXT_PUBLIC_SITE_URL ||
          "http://localhost:3000"
        }/auth/callback`,
      },
    });

    if (error) {
      console.error("Sign-up error:", error);

      // Check if it's a database error from the trigger
      // Supabase errors can have different structures, so we check multiple possibilities
      const errorMessage = error.message || "";
      const errorCode = error.code || error.status?.toString() || "signup_error";

      if (
        errorMessage.includes("Database error") ||
        errorMessage.includes("unexpected_failure") ||
        errorCode === "unexpected_failure" ||
        errorMessage.includes("trigger") ||
        errorMessage.includes("function")
      ) {
        return NextResponse.json(
          {
            code: "unexpected_failure",
            message: "Database error saving new user. Please try again or contact support.",
          },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          code: errorCode,
          message: errorMessage || "An error occurred during sign-up",
        },
        { status: error.status || 400 },
      );
    }

    // If email confirmation is required, return success message
    if (data.user && !data.session) {
      return NextResponse.json({
        success: true,
        message: "Check your email for the confirmation link.",
        requiresConfirmation: true,
      });
    }

    // If auto-confirm is enabled, session is set via cookies - no need to expose it
    return NextResponse.json({
      success: true,
      requiresConfirmation: false,
    });
  } catch (error) {
    console.error("Unexpected sign-up error:", error);
    return NextResponse.json(
      {
        code: "unexpected_failure",
        message: "An unexpected error occurred during sign-up. Please try again.",
      },
      { status: 500 },
    );
  }
}
