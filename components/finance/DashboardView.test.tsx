import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardView } from './DashboardView';
import { useTransactions } from './contexts/TransactionsContext';
import { useCategories } from './contexts/CategoriesContext';
import { usePeople } from './contexts/PeopleContext';
import { useCurrentMonth } from './contexts/CurrentMonthContext';
import type { Transaction } from '@/lib/types';

// Mock dependencies
vi.mock('./contexts/TransactionsContext');
vi.mock('./contexts/CategoriesContext');
vi.mock('./contexts/PeopleContext');
vi.mock('./contexts/CurrentMonthContext');

// Helper to create mock transactions
const createMockTransaction = (
  id: number, 
  description: string, 
  amount: number, 
  paidBy: string, 
  categoryId: string | null,
  isForecast = false
): Transaction => ({
  id,
  description,
  amount,
  categoryId,
  paidBy,
  isRecurring: false,
  isCreditCard: false,
  excludeFromSplit: false,
  isForecast,
  date: '2024-01-15',
  type: 'expense',
  isIncrement: true,
});

describe('DashboardView', () => {
  const mockUpdateTransactionById = vi.fn();
  const mockSetForecastInclusionOverride = vi.fn();
  const mockIsForecastIncluded = vi.fn().mockReturnValue(false);

  const mockPeople = [
    { id: 'p1', name: 'Alice', income: 6000 },
    { id: 'p2', name: 'Bob', income: 4000 },
  ];

  const mockCategories = [
    { id: 'cat1', name: 'Food', targetPercent: 10 },
    { id: 'cat2', name: 'Rent', targetPercent: 30 },
  ];

  const mockTransactions = [
    createMockTransaction(1, 'Rent Payment', 3000, 'p1', 'cat2'), // Alice pays Rent
    createMockTransaction(2, 'Grocery', 500, 'p2', 'cat1'),       // Bob pays Food
  ];

  const mockForecasts = [
    createMockTransaction(3, 'Future Trip', 2000, 'p1', 'cat1', true),
  ];

  const allTransactions = [...mockTransactions, ...mockForecasts];

  beforeEach(() => {
    vi.clearAllMocks();

    (usePeople as any).mockReturnValue({ people: mockPeople });
    (useCategories as any).mockReturnValue({ categories: mockCategories });
    (useCurrentMonth as any).mockReturnValue({
      selectedMonthDate: new Date(2024, 0, 15), // Jan 2024
    });

    (useTransactions as any).mockReturnValue({
      transactionsForSelectedMonth: allTransactions,
      transactionsForCalculations: mockTransactions, // Forecasts usually excluded from main calcs unless overridden
      updateTransactionById: mockUpdateTransactionById,
      setForecastInclusionOverride: mockSetForecastInclusionOverride,
      isForecastIncluded: mockIsForecastIncluded,
    });
  });

  it('renders all dashboard sections', () => {
    render(<DashboardView />);

    expect(screen.getByText('Renda Total Familiar')).toBeInTheDocument();
    expect(screen.getByText(/Total Gasto/)).toBeInTheDocument();
    expect(screen.getByText('Saldo Livre')).toBeInTheDocument();
    expect(screen.getByText(/Distribuição Justa/)).toBeInTheDocument();
    expect(screen.getByText('Metas vs Realizado')).toBeInTheDocument();
  });

  it('displays correct summary card values', () => {
    render(<DashboardView />);

    // Total Income: 6000 + 4000 = 10000
    // Note: formatCurrency output depends on locale, checking for parts
    const incomeElement = screen.getByText('Renda Total Familiar').nextElementSibling;
    expect(incomeElement).toHaveTextContent(/10\.000/);

    // Total Expenses: 3000 + 500 = 3500
    const expensesElement = screen.getByText(/Total Gasto/).nextElementSibling;
    expect(expensesElement).toHaveTextContent(/3\.500/);

    // Free Balance: 10000 - 3500 = 6500
    const balanceElement = screen.getByText('Saldo Livre').nextElementSibling;
    expect(balanceElement).toHaveTextContent(/6\.500/);
  });

  it('displays forecast section when forecasts exist', () => {
    render(<DashboardView />);

    expect(screen.getByText('Previsões de gastos')).toBeInTheDocument();
    expect(screen.getByText('Future Trip')).toBeInTheDocument();
    
    // Forecast total: 2000
    const forecastTotal = screen.getByText('Previsões de gastos').nextElementSibling;
    expect(forecastTotal).toHaveTextContent(/2\.000/);
  });

  it('calculates and displays fair distribution', () => {
    render(<DashboardView />);

    // Alice: 60% of 3500 = 2100. Paid 3000. Balance +900.
    // Bob: 40% of 3500 = 1400. Paid 500. Balance -900.
    
    // We expect a message saying Bob needs to transfer to Alice
    // The text format in FairDistributionSection is:
    // "Bob precisa transferir R$ 900,00 para Alice"
    
    // Find the summary section first
    const summarySection = screen.getByText('Resumo do Acerto:').closest('div');
    expect(summarySection).toBeInTheDocument();
    
    // Check content within the summary section
    expect(summarySection).toHaveTextContent('Bob');
    expect(summarySection).toHaveTextContent('precisa transferir');
    expect(summarySection).toHaveTextContent('Alice');
    expect(summarySection).toHaveTextContent(/900/);
  });

  it('displays category summary table correctly', () => {
    render(<DashboardView />);

    // Check headers
    expect(screen.getByText('Categoria')).toBeInTheDocument();
    expect(screen.getByText('% Previsto')).toBeInTheDocument();

    // Check Rent row
    const rentRow = screen.getByText('Rent').closest('tr');
    expect(rentRow).toHaveTextContent(/3\.000/); // Spent
    expect(rentRow).toHaveTextContent('30%'); // Target
    expect(rentRow).toHaveTextContent('30.0%'); // Real (3000/10000)

    // Check Food row
    const foodRow = screen.getByText('Food').closest('tr');
    expect(foodRow).toHaveTextContent(/500/); // Spent
    expect(foodRow).toHaveTextContent('10%'); // Target
    expect(foodRow).toHaveTextContent('5.0%'); // Real (500/10000)
  });
});
