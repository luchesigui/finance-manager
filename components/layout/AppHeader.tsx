"use client";

import { DollarSign, LogOut, Settings, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Wallet size={24} />
          </div>
          <Link href="/dashboard" className="text-xl font-bold text-slate-800 tracking-tight">
            Finanças<span className="text-indigo-600">Pro</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex bg-slate-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
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
            onClick={handleSignOut}
            className="p-2 text-slate-500 hover:text-red-600 transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
