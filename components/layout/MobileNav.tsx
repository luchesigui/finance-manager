"use client";

import { FlaskConical, Plus, Settings, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/resumo", label: "Resumo", icon: TrendingUp },
  { href: "/lancamentos", label: "Lançamentos", icon: Plus },
  { href: "/simulacao", label: "Simulação", icon: FlaskConical },
  { href: "/configuracoes", label: "Config", icon: Settings },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  // Hide nav on authentication pages and landing page
  if (pathname === "/" || pathname === "/entrar" || pathname === "/signup") {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-noir-sidebar/95 backdrop-blur-xl border-t border-noir-border px-6 py-3 flex justify-around z-20">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-interactive transition-all duration-300 ${
              isActive ? "text-accent-primary" : "text-muted hover:text-body"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <div
              className={`p-1.5 rounded-interactive transition-all duration-300 ${
                isActive
                  ? "bg-accent-primary/15 border border-accent-primary/20"
                  : "hover:bg-noir-active/50"
              }`}
            >
              <tab.icon size={20} />
            </div>
            <span
              className={`text-[10px] font-medium tracking-wide ${isActive ? "text-accent-primary" : ""}`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
