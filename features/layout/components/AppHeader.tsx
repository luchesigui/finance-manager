"use client";

import { createClient } from "@/lib/supabase/client";
import { DollarSign, FlaskConical, LogOut, Settings, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  { href: "/resumo", label: "Resumo", icon: TrendingUp },
  { href: "/lancamentos", label: "Lançamentos", icon: DollarSign },
  { href: "/simulacao", label: "Simulação", icon: FlaskConical },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/entrar");
    router.refresh();
  };

  // Hide header on authentication pages and landing page
  if (
    pathname === "/" ||
    pathname === "/entrar" ||
    pathname === "/signup" ||
    pathname === "/styleguide"
  ) {
    return null;
  }

  return (
    <header className="bg-noir-sidebar/95 border-b border-noir-border sticky top-0 z-10 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-accent-primary/15 p-2 rounded-interactive text-accent-primary border border-accent-primary/20">
            <Wallet size={22} />
          </div>
          <Link href="/resumo" className="text-xl text-heading tracking-tight">
            <span className="font-display italic">Finanças</span>
            <span className="text-accent-primary font-semibold text-sm ml-0.5 uppercase tracking-wider">
              Pro
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex bg-noir-active/80 p-1 rounded-card border border-noir-border">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-interactive text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-accent-primary/15 text-accent-primary border border-accent-primary/20"
                      : "text-body hover:text-heading hover:bg-noir-elevated border border-transparent"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <tab.icon size={15} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-2 text-muted hover:text-accent-negative transition-all duration-300 rounded-interactive hover:bg-accent-negative/10"
            title="Sair"
            aria-label="Sair da conta"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
