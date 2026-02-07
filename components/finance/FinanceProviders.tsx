"use client";

import { usePathname } from "next/navigation";
import type React from "react";

/**
 * FinanceProviders - Optional wrapper for finance-related route logic.
 * Context providers have been removed (Phase 5 Option A).
 * Data is now colocated via usePeopleData, useCategoriesData, useTransactionsData, etc.
 * This component only handles path-based behavior (e.g. skip on landing/login).
 */
export function FinanceProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  // Skip finance data loading on landing, login, and signup pages
  if (pathname === "/" || pathname?.startsWith("/entrar") || pathname?.startsWith("/signup")) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
