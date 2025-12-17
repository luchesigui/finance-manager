"use client";

import { usePathname } from "next/navigation";
import type React from "react";

import { CategoriesProvider } from "@/components/finance/contexts/CategoriesContext";
import { CurrentMonthProvider } from "@/components/finance/contexts/CurrentMonthContext";
import { DefaultPayerProvider } from "@/components/finance/contexts/DefaultPayerContext";
import { PeopleProvider } from "@/components/finance/contexts/PeopleContext";
import { TransactionsProvider } from "@/components/finance/contexts/TransactionsContext";
import { useEffect } from "react";

export function FinanceProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  useEffect(() => {
    // Check if we need to merge anonymous data
    // Only run if not on auth pages
    if (pathname && !pathname.startsWith("/login") && !pathname.startsWith("/signup")) {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          if (data.shouldMerge) {
            console.log("Merging anonymous data...");
            fetch("/api/auth/merge", { method: "POST" })
              .then((res) => res.json())
              .then((res) => {
                if (res.success) {
                  // Reload to ensure all data is fresh from the new household
                  window.location.reload();
                }
              })
              .catch(console.error);
          }
        })
        .catch(() => {});
    }
  }, [pathname]);

  // Skip FinanceProviders on login/signup pages to avoid API calls
  if (pathname?.startsWith("/login") || pathname?.startsWith("/signup")) {
    return <>{children}</>;
  }

  return (
    <CurrentMonthProvider>
      <PeopleProvider>
        <CategoriesProvider>
          <DefaultPayerProvider>
            <TransactionsProvider>{children}</TransactionsProvider>
          </DefaultPayerProvider>
        </CategoriesProvider>
      </PeopleProvider>
    </CurrentMonthProvider>
  );
}
