"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useState } from "react";

import { FinanceProviders } from "@/features/transactions/components/FinanceProviders";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.info(
        "%c[DEV] Test account\n%cemail:    dev@example.com\npassword: password123",
        "color: #7c3aed; font-weight: bold;",
        "color: inherit;",
      );
    }
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <FinanceProviders>{children}</FinanceProviders>
    </QueryClientProvider>
  );
}
