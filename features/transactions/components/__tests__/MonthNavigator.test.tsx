import { useCurrentMonthStore } from "@/lib/stores/currentMonthStore";
import type { Transaction } from "@/lib/types";
import { server } from "@/test/server";
import { render, screen, userEvent } from "@/test/test-utils";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MonthNavigator } from "../MonthNavigator";

const mockTransactions: Transaction[] = [
  {
    id: 1,
    description: "Test",
    amount: 10000,
    categoryId: "cat-1",
    paidBy: "person-1",
    isRecurring: false,
    isCreditCard: false,
    excludeFromSplit: false,
    isForecast: false,
    date: "2025-01-15",
    type: "expense",
    isIncrement: true,
  },
  {
    id: 2,
    description: "Test 2",
    amount: 5000,
    categoryId: "cat-1",
    paidBy: "person-1",
    isRecurring: false,
    isCreditCard: false,
    excludeFromSplit: false,
    isForecast: false,
    date: "2025-01-20",
    type: "expense",
    isIncrement: true,
  },
  {
    id: 3,
    description: "Test 3",
    amount: 20000,
    categoryId: "cat-2",
    paidBy: "person-1",
    isRecurring: false,
    isCreditCard: false,
    excludeFromSplit: false,
    isForecast: false,
    date: "2025-01-10",
    type: "expense",
    isIncrement: true,
  },
];

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const selectors = {
  findLancamentosCount: () => screen.findByText(/3 lançamentos/),
  getHeadingLevel2: () => screen.getByRole("heading", { level: 2 }),
  getAllButtons: () => screen.getAllByRole("button"),
};

describe("MonthNavigator", () => {
  beforeEach(() => {
    useCurrentMonthStore.setState({
      selectedMonthDate: new Date(2025, 0, 1),
    });
  });

  it("renders month label and transaction count from API", async () => {
    server.use(http.get("/api/transactions", () => HttpResponse.json(mockTransactions)));

    render(<MonthNavigator />);

    await selectors.findLancamentosCount();
    expect(selectors.getHeadingLevel2()).toHaveTextContent(/janeiro.*2025|Janeiro.*2025/i);
  });

  it("clicking prev month updates displayed month", async () => {
    server.use(http.get("/api/transactions", () => HttpResponse.json(mockTransactions)));

    render(<MonthNavigator />);
    await selectors.findLancamentosCount();

    const buttons = selectors.getAllButtons();
    const prevButton = buttons[0];
    await userEvent.click(prevButton);

    expect(selectors.getHeadingLevel2()).toHaveTextContent(/dezembro.*2024|Dezembro.*2024/i);
  });

  it("clicking next month updates displayed month", async () => {
    server.use(http.get("/api/transactions", () => HttpResponse.json(mockTransactions)));

    render(<MonthNavigator />);
    await selectors.findLancamentosCount();

    const buttons = selectors.getAllButtons();
    const rightButton = buttons[buttons.length - 1];
    await userEvent.click(rightButton);

    expect(selectors.getHeadingLevel2()).toHaveTextContent(/fevereiro.*2025|Fevereiro.*2025/i);
  });
});
