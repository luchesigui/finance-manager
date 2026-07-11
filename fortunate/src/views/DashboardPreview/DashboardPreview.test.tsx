import { resetCurrentMonthForTest } from "@/hooks/useCurrentMonth";
import { findCall, installFetchMock, makeApiTransaction } from "@/test/mockApi";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { describe, expect, it, vi } from "vitest";
import { DashboardPreview } from "./DashboardPreview";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

async function renderView(transactions = [makeApiTransaction()]) {
  resetCurrentMonthForTest();
  const mock = installFetchMock({ transactions });
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <DashboardPreview />
    </SWRConfig>,
  );

  await waitFor(() => {
    expect(screen.getByText("Transferência do Mês")).toBeInTheDocument();
  });

  return mock;
}

const nextMonth = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

describe("DashboardPreview — transferência do mês", () => {
  it("troca o mês corrente usado na busca", async () => {
    const { calls } = await renderView();

    fireEvent.click(screen.getByLabelText("Próximo mês"));

    await waitFor(() => {
      expect(findCall(calls, "GET", `/api/transactions?month=${nextMonth()}`)).toBeTruthy();
    });
  });

  it("mostra só despesas nas últimas transações", async () => {
    await renderView([
      makeApiTransaction({ description: "Mercado", transactionType: "expense" }),
      makeApiTransaction({
        description: "Salário",
        transactionType: "income",
        categoryId: null,
      }),
      makeApiTransaction({
        description: "Pix acerto",
        transactionType: "transfer",
        categoryId: null,
        paraQuemUserId: "amanda",
      }),
    ]);

    expect(await screen.findByText("Mercado")).toBeInTheDocument();
    expect(screen.queryByText("Salário")).not.toBeInTheDocument();
    expect(screen.queryByText("Pix acerto")).not.toBeInTheDocument();
  });

  it("abate transferências já registradas e inverte o sentido quando houve pagamento maior", async () => {
    await renderView([
      makeApiTransaction({
        id: "income-guilherme",
        description: "Salário Guilherme",
        transactionType: "income",
        amount: 1000000,
        categoryId: null,
        assignedToUserId: "guilherme",
      }),
      makeApiTransaction({
        id: "income-amanda",
        description: "Salário Amanda",
        transactionType: "income",
        amount: 1000000,
        categoryId: null,
        assignedToUserId: "amanda",
      }),
      makeApiTransaction({
        id: "expense-amanda",
        description: "Aluguel",
        transactionType: "expense",
        amount: 500000,
        assignedToUserId: "amanda",
        categoryId: "moradia",
      }),
      makeApiTransaction({
        id: "transfer-guilherme-amanda",
        description: "Transferência já feita",
        transactionType: "transfer",
        amount: 300000,
        categoryId: null,
        assignedToUserId: "guilherme",
        paraQuemUserId: "amanda",
      }),
    ]);

    await screen.findByText("Amanda transfere para Guilherme");
    expect(screen.getByText(/500,00/)).toBeInTheDocument();
  });
});
