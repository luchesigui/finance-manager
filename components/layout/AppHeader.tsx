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

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <header
      className="bg-noir-bg-surface border-b sticky top-0 z-10"
      style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
    >
      <div className="max-w-5xl mx-auto py-4 flex justify-between items-center px-4">
        <div className="flex items-center gap-2">
          <div className="bg-noir-text-accent p-2 rounded-interactive text-white glow-accent">
            <Wallet size={24} />
          </div>
          <Link
            href="/dashboard"
            className="text-xl font-bold text-noir-text-heading tracking-tight"
          >
            Finanças<span className="text-noir-text-accent">Pro</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex bg-noir-bg-primary p-1 rounded-interactive">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-interactive text-sm font-medium transition-all ${
                    isActive
                      ? "bg-noir-bg-active text-noir-text-accent glow-accent"
                      : "text-noir-text-muted hover:text-noir-text-body"
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
            className="p-2 text-noir-text-muted hover:text-noir-accent-negative transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
