import type { Category, Transaction } from "@/lib/types";
import { render, screen, userEvent } from "@/test/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ForecastSpotlight } from "../ForecastSpotlight";

function makeTransaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: 1,
    description: "Previsão aluguel",
    amount: 2000,
    categoryId: "cat-1",
    paidBy: "p1",
    isRecurring: false,
    isCreditCard: false,
    excludeFromSplit: false,
    isForecast: true,
    date: "2025-02-15",
    type: "expense",
    isIncrement: true,
    ...overrides,
  };
}

const defaultCategories: Category[] = [
  { id: "cat-1", name: "Moradia", targetPercent: 30, householdId: "h1" },
];

const FORECASTS_COLLAPSED_KEY = "dashboard_forecasts_collapsed";

const selectors = {
  getHeadingGastosPrevistos: () => screen.getByRole("heading", { name: /gastos previstos/i }),
  getCountBadge: (text: string) => screen.getByText(text),
  queryGastosPrevistos: () => screen.queryByText(/gastos previstos/i),
  getDescription: (text: string) => screen.getByText(text),
  getAllAmount: (text: string) => screen.getAllByText(text),
  getConsiderarNaConta: () => screen.getByTitle("Considerar na conta"),
  getMarcarComoOficial: () => screen.getByTitle("Marcar como oficial"),
  getNaoConsiderarNaConta: () => screen.getByTitle("Não considerar na conta"),
  getGastosPrevistosButton: () => screen.getByRole("button", { name: /gastos previstos/i }),
  queryDescription: (text: string) => screen.queryByText(text),
};

describe("ForecastSpotlight", () => {
  beforeEach(() => {
    localStorage.removeItem(FORECASTS_COLLAPSED_KEY);
  });

  it('renders section title "Gastos Previstos" and count badge', () => {
    const forecasts = [makeTransaction({ id: 1 }), makeTransaction({ id: 2 })];
    render(
      <ForecastSpotlight
        forecasts={forecasts}
        categories={defaultCategories}
        totalExpenses={500000}
        isForecastIncluded={() => false}
        setForecastInclusionOverride={vi.fn()}
        updateTransactionById={vi.fn()}
      />,
    );
    expect(selectors.getHeadingGastosPrevistos()).toBeInTheDocument();
    expect(selectors.getCountBadge("2 itens")).toBeInTheDocument();
  });

  it("returns null when forecasts.length === 0", () => {
    const { container } = render(
      <ForecastSpotlight
        forecasts={[]}
        categories={defaultCategories}
        totalExpenses={100000}
        isForecastIncluded={() => false}
        setForecastInclusionOverride={vi.fn()}
        updateTransactionById={vi.fn()}
      />,
    );
    expect(selectors.queryGastosPrevistos()).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it("list shows description, date, amount and Eye/ThumbsUp buttons", () => {
    const forecasts = [makeTransaction({ id: 1, description: "Supermercado", amount: 150 })];
    render(
      <ForecastSpotlight
        forecasts={forecasts}
        categories={defaultCategories}
        totalExpenses={100000}
        isForecastIncluded={() => false}
        setForecastInclusionOverride={vi.fn()}
        updateTransactionById={vi.fn()}
      />,
    );
    expect(selectors.getDescription("Supermercado")).toBeInTheDocument();
    expect(selectors.getAllAmount("R$ 150,00").length).toBeGreaterThanOrEqual(1);
    expect(selectors.getConsiderarNaConta()).toBeInTheDocument();
    expect(selectors.getMarcarComoOficial()).toBeInTheDocument();
  });

  it("clicking eye button calls setForecastInclusionOverride with correct id and toggled value", async () => {
    const user = userEvent.setup();
    const setForecastInclusionOverride = vi.fn();
    const forecasts = [makeTransaction({ id: 42 })];
    render(
      <ForecastSpotlight
        forecasts={forecasts}
        categories={defaultCategories}
        totalExpenses={100000}
        isForecastIncluded={() => false}
        setForecastInclusionOverride={setForecastInclusionOverride}
        updateTransactionById={vi.fn()}
      />,
    );
    await user.click(selectors.getConsiderarNaConta());
    expect(setForecastInclusionOverride).toHaveBeenCalledWith(42, true);
  });

  it("when included, eye shows 'Não considerar na conta' and click calls setForecastInclusionOverride with false", async () => {
    const user = userEvent.setup();
    const setForecastInclusionOverride = vi.fn();
    const forecasts = [makeTransaction({ id: 10 })];
    render(
      <ForecastSpotlight
        forecasts={forecasts}
        categories={defaultCategories}
        totalExpenses={100000}
        isForecastIncluded={() => true}
        setForecastInclusionOverride={setForecastInclusionOverride}
        updateTransactionById={vi.fn()}
      />,
    );
    await user.click(selectors.getNaoConsiderarNaConta());
    expect(setForecastInclusionOverride).toHaveBeenCalledWith(10, false);
  });

  it("clicking ThumbsUp calls updateTransactionById with isForecast: false", async () => {
    const user = userEvent.setup();
    const updateTransactionById = vi.fn();
    const forecasts = [makeTransaction({ id: 99 })];
    render(
      <ForecastSpotlight
        forecasts={forecasts}
        categories={defaultCategories}
        totalExpenses={100000}
        isForecastIncluded={() => false}
        setForecastInclusionOverride={vi.fn()}
        updateTransactionById={updateTransactionById}
      />,
    );
    await user.click(selectors.getMarcarComoOficial());
    expect(updateTransactionById).toHaveBeenCalledWith(99, {
      isForecast: false,
      excludeFromSplit: false,
    });
  });

  it("section is collapsible: content visible when expanded, hidden when collapsed", async () => {
    const user = userEvent.setup();
    const forecasts = [makeTransaction({ description: "Only item" })];
    render(
      <ForecastSpotlight
        forecasts={forecasts}
        categories={defaultCategories}
        totalExpenses={100000}
        isForecastIncluded={() => false}
        setForecastInclusionOverride={vi.fn()}
        updateTransactionById={vi.fn()}
      />,
    );
    expect(selectors.getDescription("Only item")).toBeInTheDocument();
    await user.click(selectors.getGastosPrevistosButton());
    expect(selectors.queryDescription("Only item")).not.toBeInTheDocument();
  });

  it("total at bottom matches sum of forecast amounts", () => {
    const forecasts = [
      makeTransaction({ id: 1, amount: 100 }),
      makeTransaction({ id: 2, amount: 200 }),
    ];
    render(
      <ForecastSpotlight
        forecasts={forecasts}
        categories={defaultCategories}
        totalExpenses={100000}
        isForecastIncluded={() => false}
        setForecastInclusionOverride={vi.fn()}
        updateTransactionById={vi.fn()}
      />,
    );
    expect(selectors.getDescription("R$ 300,00")).toBeInTheDocument();
  });

  it.todo(
    "ao falhar a requisição do joia (PATCH): exibir feedback de erro e não remover o gasto da lista",
  );
});
