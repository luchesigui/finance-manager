"use client";

import { Plus, Settings, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Resumo", icon: TrendingUp },
  { href: "/transactions", label: "Lançamentos", icon: Plus },
  { href: "/settings", label: "Config", icon: Settings },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 bg-noir-bg-surface border-t px-6 py-3 flex justify-around z-20"
      style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 ${
              isActive ? "text-noir-text-accent" : "text-noir-text-muted"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <tab.icon size={24} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
