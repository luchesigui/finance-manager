"use client";

import { createClient } from "@/lib/supabase/client";
import { DollarSign, LogOut, Settings, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Resumo", icon: TrendingUp },
  { href: "/transactions", label: "Lançamentos", icon: DollarSign },
  { href: "/settings", label: "Configurações", icon: Settings },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Hide header on authentication pages and landing page
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <header className="bg-noir-sidebar border-b border-noir-border sticky top-0 z-10 backdrop-blur-md bg-opacity-95">
      <div className="max-w-5xl mx-auto py-4 px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-accent-primary p-2 rounded-interactive text-white shadow-glow-accent">
            <Wallet size={24} />
          </div>
          <Link href="/dashboard" className="text-xl font-bold text-heading tracking-tight">
            Finanças<span className="text-accent-primary">Pro</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex bg-noir-active p-1 rounded-card border border-noir-border">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-interactive text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-accent-primary text-white shadow-glow-accent"
                      : "text-body hover:text-heading hover:bg-noir-surface"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-2 text-muted hover:text-accent-negative transition-colors rounded-interactive hover:bg-accent-negative/10"
            title="Sair"
            aria-label="Sair da conta"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
