"use client";

import type React from "react";

import { FinanceProvider } from "@/components/finance/FinanceProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <FinanceProvider>{children}</FinanceProvider>;
}
