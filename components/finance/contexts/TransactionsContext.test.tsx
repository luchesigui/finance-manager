import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TransactionsProvider, useTransactions } from './TransactionsContext';
import { fetchJson } from '@/lib/apiClient';
import { useCurrentMonth } from './CurrentMonthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Mock dependencies
vi.mock('@/lib/apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/apiClient')>();
  return {
    ...actual,
    fetchJson: vi.fn(),
  };
});
vi.mock('./CurrentMonthContext');

// Mock Transaction Data
const mockTransactions = [
  { id: 1, description: 'Lunch', amount: 50, date: '2024-01-15', categoryId: 'cat1', paidBy: 'p1', type: 'expense' }
];

describe('TransactionsContext', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    (useCurrentMonth as any).mockReturnValue({
      selectedYear: 2024,
      selectedMonthNumber: 1,
      selectedMonthDate: new Date(2024, 0, 15),
    });

    // Default implementation for fetchJson to handle GET requests safely
    (fetchJson as any).mockImplementation((url: string) => {
      if (url.includes('/api/transactions?')) {
        return Promise.resolve(mockTransactions);
      }
      return Promise.resolve({});
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TransactionsProvider>{children}</TransactionsProvider>
    </QueryClientProvider>
  );

  it('fetches transactions for the selected month', async () => {
    const { result } = renderHook(() => useTransactions(), { wrapper });

    await waitFor(() => {
      expect(result.current.transactionsForSelectedMonth).toHaveLength(1);
    });

    expect(fetchJson).toHaveBeenCalledWith('/api/transactions?year=2024&month=1');
  });

  it('adds a new transaction via API', async () => {
    const { result } = renderHook(() => useTransactions(), { wrapper });

    // Wait for initial load
    await waitFor(() => expect(result.current.transactionsForSelectedMonth).toHaveLength(1));

    const newTransaction = { 
      id: 2, 
      description: 'Dinner', 
      amount: 100, 
      date: '2024-01-15',
      categoryId: 'cat1',
      paidBy: 'p1',
      type: 'expense'
    };

    // Override implementation for POST
    (fetchJson as any).mockImplementation(async (url: string, init: RequestInit) => {
      if (url === '/api/transactions' && init?.method === 'POST') {
        return newTransaction;
      }
      if (url.includes('/api/transactions?')) {
        return mockTransactions;
      }
      return {};
    });

    const formState = {
      description: 'Dinner',
      amount: 100,
      categoryId: 'cat1',
      paidBy: 'p1',
      isRecurring: false,
      isCreditCard: false,
      dateSelectionMode: 'month' as const,
      selectedMonth: '2024-01',
      date: '2024-01-15',
      isInstallment: false,
      installments: 2,
      excludeFromSplit: false,
      isForecast: false,
      type: 'expense' as const,
      isIncrement: true,
    };

    result.current.addTransactionsFromFormState(formState);

    await waitFor(() => {
      expect(fetchJson).toHaveBeenCalledWith(
        '/api/transactions',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"description":"Dinner"'),
        })
      );
    });
  });

  it('deletes a transaction via API', async () => {
    // Mock global fetch for DELETE
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    global.fetch = fetchMock;

    const { result } = renderHook(() => useTransactions(), { wrapper });
    
    // Wait for initial load
    await waitFor(() => expect(result.current.transactionsForSelectedMonth).toHaveLength(1));

    result.current.deleteTransactionById(1);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/transactions/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('updates a transaction via API', async () => {
    const { result } = renderHook(() => useTransactions(), { wrapper });

    // Wait for initial load
    await waitFor(() => expect(result.current.transactionsForSelectedMonth).toHaveLength(1));

    // Override implementation for PATCH
    (fetchJson as any).mockImplementation(async (url: string, init: RequestInit) => {
      if (url.includes('/api/transactions/') && init?.method === 'PATCH') {
        return { ...mockTransactions[0], amount: 60 };
      }
      if (url.includes('/api/transactions?')) {
        return mockTransactions;
      }
      return {};
    });

    result.current.updateTransactionById(1, { amount: 60 });

    await waitFor(() => {
      expect(fetchJson).toHaveBeenCalledWith(
        '/api/transactions/1',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('"amount":60'),
        })
      );
    });
  });
});
