import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionsView } from './TransactionsView';
import { useTransactions } from './contexts/TransactionsContext';
import { useCategories } from './contexts/CategoriesContext';
import { usePeople } from './contexts/PeopleContext';
import { useCurrentMonth } from './contexts/CurrentMonthContext';
import { useDefaultPayer } from './contexts/DefaultPayerContext';
import { generateGeminiContent } from '@/lib/geminiClient';
import type { Transaction } from '@/lib/types';

// Mock dependencies
vi.mock('./contexts/TransactionsContext');
vi.mock('./contexts/CategoriesContext');
vi.mock('./contexts/PeopleContext');
vi.mock('./contexts/CurrentMonthContext');
vi.mock('./contexts/DefaultPayerContext');
vi.mock('@/lib/geminiClient');
vi.mock('@/lib/featureFlags', () => ({
  isSmartFillEnabled: true,
}));

// Helper to create mock transactions
const createMockTransaction = (id: number, description: string, amount: number, type: 'expense' | 'income' = 'expense'): Transaction => ({
  id,
  description,
  amount,
  categoryId: type === 'expense' ? 'cat1' : null,
  paidBy: 'p1',
  isRecurring: false,
  isCreditCard: false,
  excludeFromSplit: false,
  isForecast: false,
  date: '2024-01-15',
  type,
  isIncrement: true,
});

describe('TransactionsView', () => {
  const mockAddTransactionsFromFormState = vi.fn();
  const mockDeleteTransactionById = vi.fn();
  const mockUpdateTransactionById = vi.fn();
  const mockBulkUpdateTransactions = vi.fn();
  const mockBulkDeleteTransactions = vi.fn();

  const mockTransactions = [
    createMockTransaction(1, 'Lunch', 50),
    createMockTransaction(2, 'Salary', 5000, 'income'),
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (useTransactions as any).mockReturnValue({
      transactionsForSelectedMonth: mockTransactions,
      transactionsForCalculations: mockTransactions,
      addTransactionsFromFormState: mockAddTransactionsFromFormState,
      deleteTransactionById: mockDeleteTransactionById,
      updateTransactionById: mockUpdateTransactionById,
      bulkUpdateTransactions: mockBulkUpdateTransactions,
      bulkDeleteTransactions: mockBulkDeleteTransactions,
    });

    (useCategories as any).mockReturnValue({
      categories: [
        { id: 'cat1', name: 'Food', targetPercent: 10 },
        { id: 'cat2', name: 'Transport', targetPercent: 10 },
      ],
    });

    (usePeople as any).mockReturnValue({
      people: [
        { id: 'p1', name: 'Alice', income: 5000 },
        { id: 'p2', name: 'Bob', income: 4000 },
      ],
    });

    (useCurrentMonth as any).mockReturnValue({
      selectedMonthDate: new Date(2024, 0, 15), // Jan 2024
    });

    (useDefaultPayer as any).mockReturnValue({
      defaultPayerId: 'p1',
    });
  });

  it('renders the transaction form and list', () => {
    render(<TransactionsView />);
    
    // Check form elements
    expect(screen.getByText('Nova Despesa Manual')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor (R$)')).toBeInTheDocument();
    
    // Check list elements
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
  });

  it('submits a new expense transaction', async () => {
    render(<TransactionsView />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Dinner' } });
    // CurrencyInput divides by 100, so 10000 -> 100.00
    fireEvent.change(screen.getByLabelText('Valor (R$)'), { target: { value: '10000' } });
    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'cat1' } });
    fireEvent.change(screen.getByLabelText('Atribuir à'), { target: { value: 'p2' } });

    // Submit
    fireEvent.click(screen.getByText('Adicionar Lançamento'));

    expect(mockAddTransactionsFromFormState).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Dinner',
      amount: 100,
      categoryId: 'cat1',
      paidBy: 'p2',
      type: 'expense',
    }));
  });

  it('switches to income mode and submits income', async () => {
    render(<TransactionsView />);
    
    // Switch to Income - use specific selector to avoid ambiguity
    // The button contains the text "Renda" and is inside the type selector
    const incomeButton = screen.getByRole('button', { name: /Renda/i });
    fireEvent.click(incomeButton);

    expect(screen.getByText('Novo Lançamento de Renda')).toBeInTheDocument();
    expect(screen.queryByLabelText('Categoria')).not.toBeInTheDocument(); // Income has no category

    // Fill form
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Bonus' } });
    // CurrencyInput divides by 100, so 100000 -> 1000.00
    fireEvent.change(screen.getByLabelText('Valor (R$)'), { target: { value: '100000' } });

    // Submit
    fireEvent.click(screen.getByText('Adicionar Renda'));

    expect(mockAddTransactionsFromFormState).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Bonus',
      amount: 1000,
      type: 'income',
      isIncrement: true,
    }));
  });

  it('filters transactions', async () => {
    render(<TransactionsView />);
    
    // Open filters
    fireEvent.click(screen.getByTitle('Filtrar lançamentos'));
    
    // Filter by type: Income
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'income' } });

    // Should show Salary but not Lunch
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.queryByText('Lunch')).not.toBeInTheDocument();
  });

  it('handles smart fill with AI', async () => {
    (generateGeminiContent as any).mockResolvedValue(JSON.stringify({
      description: 'Uber to work',
      amount: 25,
      categoryId: 'cat2',
      paidBy: 'p1',
      date: '2024-01-15'
    }));

    render(<TransactionsView />);
    
    const smartInput = screen.getByPlaceholderText(/Ex: Almoço com Amanda/i);
    fireEvent.change(smartInput, { target: { value: 'Uber 25' } });
    
    // Trigger smart fill (button click)
    const buttons = screen.getAllByRole('button');
    // Find the button with the brain icon or by its position/class if needed
    // In the component: <button onClick={handleSmartFill} ...>
    // It's next to the input.
    const smartFillBtn = smartInput.nextElementSibling as HTMLElement;
    fireEvent.click(smartFillBtn);

    await waitFor(() => {
      expect(generateGeminiContent).toHaveBeenCalled();
    });

    // Check if form was populated
    expect(screen.getByLabelText('Descrição')).toHaveValue('Uber to work');
    
    // Check formatted value manually to handle non-breaking spaces reliably
    const amountInput = screen.getByLabelText('Valor (R$)') as HTMLInputElement;
    const normalizedValue = amountInput.value.replace(/\u00A0/g, ' ');
    expect(normalizedValue).toBe('R$ 25,00');
    
    expect(screen.getByLabelText('Categoria')).toHaveValue('cat2');
  });

  it('opens edit modal and saves changes', async () => {
    render(<TransactionsView />);
    
    // Click edit on first transaction (Lunch)
    const editButtons = screen.getAllByTitle('Editar');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Editar Lançamento')).toBeInTheDocument();
    
    // Change amount
    // The modal inputs are rendered. We need to find the one in the modal.
    // The modal is likely the last rendered form.
    const amountInputs = screen.getAllByLabelText('Valor (R$)');
    const modalAmountInput = amountInputs[amountInputs.length - 1];
    
    // 6000 -> 60.00
    fireEvent.change(modalAmountInput, { target: { value: '6000' } });

    // Save
    fireEvent.click(screen.getByText('Salvar Alterações'));

    expect(mockUpdateTransactionById).toHaveBeenCalledWith(1, expect.objectContaining({
      amount: 60,
    }));
  });

  it('deletes a transaction', async () => {
    render(<TransactionsView />);
    
    // Click delete on first transaction
    const deleteButtons = screen.getAllByTitle('Excluir');
    fireEvent.click(deleteButtons[0]);

    expect(mockDeleteTransactionById).toHaveBeenCalledWith(1);
  });
});
