"use client";

import type React from "react";

import { CategoriesProvider } from "@/components/finance/contexts/CategoriesContext";
import { CurrentMonthProvider } from "@/components/finance/contexts/CurrentMonthContext";
import { DefaultPayerProvider } from "@/components/finance/contexts/DefaultPayerContext";
import { PeopleProvider } from "@/components/finance/contexts/PeopleContext";
import { TransactionsProvider } from "@/components/finance/contexts/TransactionsContext";

export function FinanceProviders({ children }: Readonly<{ children: React.ReactNode }>) {
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
