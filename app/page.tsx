import { LandingPage } from "@/components/landing/LandingPage";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  // If user is authenticated, redirect to dashboard
  if (data?.claims) {
    redirect("/dashboard");
  }

  // Show landing page for unauthenticated users
  return <LandingPage />;
}
