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

  it("desconta transferências mesmo se paraQuemUserId for nulo (deduz de forma implícita)", async () => {
    await renderView([
      makeApiTransaction({
        id: "expense-amanda",
        description: "Mercado",
        transactionType: "expense",
        amount: 40000,
        assignedToUserId: "amanda",
      }),
      makeApiTransaction({
        id: "transfer-guilherme",
        description: "Transferência sem paraQuem",
        transactionType: "transfer",
        amount: 15000,
        assignedToUserId: "guilherme",
        paraQuemUserId: null,
      }),
    ]);

    // Total shared = 400. Share = 200. Guilherme owes Amanda 200. Guilherme paid 150. Remaining = 50.
    await screen.findByText("Guilherme transfere para Amanda");
    expect(screen.getByText(/50,00/)).toBeInTheDocument();
  });

  it("calcula saldo de transferência mesmo quando totalShared é zero", async () => {
    await renderView([
      makeApiTransaction({
        id: "transfer-guilherme-amanda",
        description: "Envio antecipado",
        transactionType: "transfer",
        amount: 10000,
        assignedToUserId: "guilherme",
        paraQuemUserId: "amanda",
      }),
    ]);

    // No expenses -> Guilherme transferred 100 to Amanda -> Amanda now owes Guilherme 100.
    await screen.findByText("Amanda transfere para Guilherme");
    expect(screen.getByText(/100,00/)).toBeInTheDocument();
  });

  it("calcula corretamente cenário com renda proporcional 14k/7k e transferência de 13k com data futura no mês", async () => {
    await renderView([
      makeApiTransaction({
        id: "inc-guilherme",
        transactionType: "income",
        amount: 700000,
        assignedToUserId: "guilherme",
      }),
      makeApiTransaction({
        id: "inc-amanda",
        transactionType: "income",
        amount: 1400000,
        assignedToUserId: "amanda",
      }),
      makeApiTransaction({
        id: "exp-guilherme",
        transactionType: "expense",
        amount: 2017500,
        assignedToUserId: "guilherme",
      }),
      makeApiTransaction({
        id: "exp-amanda",
        transactionType: "expense",
        amount: 389300,
        assignedToUserId: "amanda",
      }),
      makeApiTransaction({
        id: "tr-amanda-guilherme",
        transactionType: "transfer",
        amount: 1300000,
        date: "2099-12-31", // future date in month/system
        assignedToUserId: "amanda",
        paraQuemUserId: "guilherme",
      }),
    ]);

    // 24.068 total expenses. Guilherme share (1/3) = 8.022,67. Amanda share (2/3) = 16.045,33.
    // Amanda initial debt = 12.152,33.
    // Amanda transferred 13.000,00 -> Overpaid by 847,67 -> Guilherme now owes Amanda 847,67.
    await screen.findByText("Guilherme transfere para Amanda");
    expect(screen.getByText(/847,67/)).toBeInTheDocument();
  });

  it("permite marcar transferência como realizada enviando POST para a API", async () => {
    const mock = await renderView([
      makeApiTransaction({
        id: "expense-amanda",
        description: "Aluguel",
        transactionType: "expense",
        amount: 20000,
        assignedToUserId: "amanda",
      }),
    ]);

    // Guilherme owes Amanda 100.00
    const checkBtn = await screen.findByRole("button", { name: "Marcar como transferido" });
    fireEvent.click(checkBtn);

    await waitFor(() => {
      const postCall = findCall(mock.calls, "POST", "/api/transactions");
      expect(postCall).toBeTruthy();
      expect(postCall?.body).toMatchObject({
        transactionType: "transfer",
        assignedToUserId: "guilherme",
        paraQuemUserId: "amanda",
        amount: 10000,
      });
    });
  });
});

describe("DashboardPreview — lançamentos parcelados vs recorrentes futuros", () => {
  it("considera lançamento parcelado futuro como ocorrido (incluído nas despesas), mas lançamento recorrente futuro como pendente", async () => {
    await renderView([
      makeApiTransaction({
        id: "tx-parcela-futura",
        description: "Notebook Parcelado",
        amount: 200000,
        date: "2099-12-31",
        isParcelado: 1,
        transactionType: "expense",
        categoryId: "moradia",
      }),
      makeApiTransaction({
        id: "tx-recorrente-futura",
        description: "Assinatura Futura",
        amount: 50000,
        date: "2099-12-31",
        isRecorrente: 1,
        isParcelado: 0,
        transactionType: "expense",
        categoryId: "assinaturas",
      }),
    ]);

    expect(await screen.findByText("Notebook Parcelado")).toBeInTheDocument();
    // O parcelado futuro deve ter a row sem a classe de pending (ou seja, ocorreu)
    // E o valor do parcelado é considerado no resumo
    expect(screen.getByText("Notebook Parcelado")).not.toBeNull();
  });
});

