"use client";

import { usePathname } from "next/navigation";
import type React from "react";

import { CategoriesProvider } from "@/components/finance/contexts/CategoriesContext";
import { CurrentMonthProvider } from "@/components/finance/contexts/CurrentMonthContext";
import { DefaultPayerProvider } from "@/components/finance/contexts/DefaultPayerContext";
import { EmergencyFundProvider } from "@/components/finance/contexts/EmergencyFundContext";
import { PeopleProvider } from "@/components/finance/contexts/PeopleContext";
import { TransactionsProvider } from "@/components/finance/contexts/TransactionsContext";

export function FinanceProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  // Skip FinanceProviders on landing, login, and signup pages to avoid API calls
  if (pathname === "/" || pathname?.startsWith("/entrar") || pathname?.startsWith("/signup")) {
    return <>{children}</>;
  }

  return (
    <CurrentMonthProvider>
      <PeopleProvider>
        <CategoriesProvider>
          <DefaultPayerProvider>
            <EmergencyFundProvider>
              <TransactionsProvider>{children}</TransactionsProvider>
            </EmergencyFundProvider>
          </DefaultPayerProvider>
        </CategoriesProvider>
      </PeopleProvider>
    </CurrentMonthProvider>
  );
}
