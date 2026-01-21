import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

import { CategoriesProvider } from "@/components/finance/contexts/CategoriesContext";
import { CurrentMonthProvider } from "@/components/finance/contexts/CurrentMonthContext";
import { DefaultPayerProvider } from "@/components/finance/contexts/DefaultPayerContext";
import { PeopleProvider } from "@/components/finance/contexts/PeopleContext";
import { TransactionsProvider } from "@/components/finance/contexts/TransactionsContext";

// ============================================================================
// Test Data Fixtures
// ============================================================================

export const mockPeople = [
  { id: "person-1", name: "João", income: 5000 },
  { id: "person-2", name: "Maria", income: 3000 },
];

export const mockCategories = [
  { id: "cat-1", name: "Custos Fixos", targetPercent: 55 },
  { id: "cat-2", name: "Conforto", targetPercent: 10 },
  { id: "cat-3", name: "Metas", targetPercent: 10 },
  { id: "cat-4", name: "Prazeres", targetPercent: 10 },
  { id: "cat-5", name: "Liberdade Financeira", targetPercent: 10 },
  { id: "cat-6", name: "Conhecimento", targetPercent: 5 },
];

export const mockTransactions = [
  {
    id: 1,
    description: "Aluguel",
    amount: 1500,
    categoryId: "cat-1",
    paidBy: "person-1",
    isRecurring: true,
    isCreditCard: false,
    excludeFromSplit: false,
    isForecast: false,
    date: "2024-03-01",
    type: "expense" as const,
    isIncrement: true,
  },
  {
    id: 2,
    description: "Mercado",
    amount: 500,
    categoryId: "cat-1",
    paidBy: "person-2",
    isRecurring: false,
    isCreditCard: false,
    excludeFromSplit: false,
    isForecast: false,
    date: "2024-03-15",
    type: "expense" as const,
    isIncrement: true,
  },
];

// ============================================================================
// Query Client for Tests
// ============================================================================

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// ============================================================================
// Test Providers Wrapper
// ============================================================================

type AllProvidersProps = {
  children: ReactNode;
  queryClient?: QueryClient;
};

export function AllProviders({ children, queryClient }: AllProvidersProps) {
  const client = queryClient ?? createTestQueryClient();

  return (
    <QueryClientProvider client={client}>
      <CurrentMonthProvider>
        <PeopleProvider>
          <CategoriesProvider>
            <DefaultPayerProvider>
              <TransactionsProvider>{children}</TransactionsProvider>
            </DefaultPayerProvider>
          </CategoriesProvider>
        </PeopleProvider>
      </CurrentMonthProvider>
    </QueryClientProvider>
  );
}

// ============================================================================
// Custom Render Function
// ============================================================================

type CustomRenderOptions = Omit<RenderOptions, "wrapper"> & {
  queryClient?: QueryClient;
};

export function renderWithProviders(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { queryClient, ...renderOptions } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return <AllProviders queryClient={queryClient}>{children}</AllProviders>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { renderWithProviders as render };
