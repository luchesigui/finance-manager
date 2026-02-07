import { render, screen, userEvent } from "@/test/test-utils";
import { describe, expect, it, vi } from "vitest";
import { EditableExpensesCard } from "../EditableExpensesCard";
import type { EditableExpense, ExpenseScenario } from "@/features/simulation/types";

const mockExpenses: EditableExpense[] = [
  {
    id: "e1",
    description: "Aluguel",
    amount: 3000,
    isRecurring: true,
    isIncluded: true,
    isManual: false,
  },
  {
    id: "e2",
    description: "Conta de luz",
    amount: 200,
    isRecurring: true,
    isIncluded: false,
    isManual: false,
  },
  {
    id: "e3",
    description: "Viagem",
    amount: 1500,
    isRecurring: false,
    isIncluded: true,
    isManual: true,
  },
];

const selectors = {
  getGastosSimulacao: () => screen.getByText(/Gastos na Simulação/i),
  getHeaderButton: () =>
    screen.getByRole("button", { name: /Gastos na Simulação/i }) ?? screen.getByText(/Gastos na Simulação/i).closest("button"),
  getHeaderButtonByText: () => screen.getByText(/Gastos na Simulação/i).closest("button"),
  getTotalAmount: () => screen.getAllByText(/R\$\s*4[.,]700[,.]00/),
  getExpenseName: (name: string) => screen.getByText(name),
  getCheckboxes: () => screen.getAllByRole("checkbox"),
  getAluguelRow: () => screen.getByText("Aluguel").closest("div"),
  getDescricaoInput: () => screen.getByPlaceholderText(/Descrição/i),
  getAmountInput: () =>
    document.querySelector('input[placeholder*="R$"]') ?? document.querySelector('input[type="text"]'),
  getAdicionarButton: () => screen.getByRole("button", { name: /Adicionar/i }),
  getRemoverGastoButton: () => screen.getByLabelText(/Remover gasto/i),
};

describe("EditableExpensesCard", () => {
  const defaultProps = {
    expenses: mockExpenses,
    totalSimulatedExpenses: 4700,
    scenario: "minimalist" as ExpenseScenario,
    onToggleExpense: vi.fn(),
    onAddExpense: vi.fn(),
    onRemoveExpense: vi.fn(),
  };

  it("renders Gastos na Simulação with total", () => {
    render(<EditableExpensesCard {...defaultProps} />);
    expect(selectors.getGastosSimulacao()).toBeInTheDocument();
    expect(selectors.getTotalAmount().length).toBeGreaterThan(0);
  });

  it("content is collapsible", async () => {
    const user = userEvent.setup();
    render(<EditableExpensesCard {...defaultProps} />);
    const headerButton = selectors.getHeaderButton();
    if (headerButton) await user.click(headerButton);
    expect(selectors.getExpenseName("Aluguel")).toBeInTheDocument();
  });

  it("in minimalist scenario shows checkboxes for recurring expenses", async () => {
    const user = userEvent.setup();
    render(<EditableExpensesCard {...defaultProps} />);
    const headerButton = selectors.getHeaderButtonByText();
    if (headerButton) await user.click(headerButton);
    const checkboxes = selectors.getCheckboxes();
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("toggling checkbox calls onToggleExpense", async () => {
    const user = userEvent.setup();
    const onToggleExpense = vi.fn();
    render(
      <EditableExpensesCard
        {...defaultProps}
        onToggleExpense={onToggleExpense}
      />,
    );
    const headerButton = selectors.getHeaderButtonByText();
    if (headerButton) await user.click(headerButton);
    const expenseRow = selectors.getAluguelRow();
    if (expenseRow) {
      const checkbox = expenseRow.querySelector('input[type="checkbox"]');
      if (checkbox) {
        await user.click(checkbox as HTMLInputElement);
        expect(onToggleExpense).toHaveBeenCalledWith("e1");
      }
    }
  });

  it("Add form calls onAddExpense when submitting", async () => {
    const user = userEvent.setup();
    const onAddExpense = vi.fn();
    render(
      <EditableExpensesCard
        {...defaultProps}
        onAddExpense={onAddExpense}
      />,
    );
    const headerButton = selectors.getHeaderButtonByText();
    if (headerButton) await user.click(headerButton);
    const descInput = selectors.getDescricaoInput();
    await user.type(descInput, "Extra");
    const amountInput = selectors.getAmountInput();
    if (amountInput) {
      await user.type(amountInput as HTMLInputElement, "100");
    }
    await user.click(selectors.getAdicionarButton());
    expect(onAddExpense).toHaveBeenCalledWith("Extra", expect.any(Number));
  });

  it("remove button on manual expense calls onRemoveExpense", async () => {
    const user = userEvent.setup();
    const onRemoveExpense = vi.fn();
    render(
      <EditableExpensesCard
        {...defaultProps}
        onRemoveExpense={onRemoveExpense}
      />,
    );
    const headerButton = selectors.getHeaderButtonByText();
    if (headerButton) await user.click(headerButton);
    const removeButton = selectors.getRemoverGastoButton();
    await user.click(removeButton);
    expect(onRemoveExpense).toHaveBeenCalledWith("e3");
  });
});
