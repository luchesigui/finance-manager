import { resetCurrentMonthForTest } from "@/hooks/useCurrentMonth";
import {
  type ApiTransaction,
  findCall,
  installFetchMock,
  makeApiTransaction,
} from "@/test/mockApi";
import { NovoLancamentoPage } from "@/test/pageObjects/NovoLancamentoPage";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { describe, expect, it, vi } from "vitest";
import { NovoLancamento } from "./NovoLancamento";

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

async function renderView(transactions: ApiTransaction[] = []) {
  resetCurrentMonthForTest();
  const mock = installFetchMock({ transactions });
  render(
    // cache SWR novo por teste — sem provider, dados de um teste vazariam no seguinte
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <NovoLancamento />
    </SWRConfig>,
  );
  const page = new NovoLancamentoPage();
  // wait for the initial categories + transactions load to settle
  await waitFor(() => {
    expect(findCall(mock.calls, "GET", "/api/categories")).toBeTruthy();
  });
  if (transactions.length > 0) {
    await page.waitForRow(transactions[0].description);
  }
  return { page, ...mock };
}

const nextMonth = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

describe("NovoLancamento — soma dos gastos na tabela", () => {
  it("troca o mês corrente usado na busca", async () => {
    const { calls } = await renderView();

    fireEvent.click(screen.getByLabelText("Próximo mês"));

    await waitFor(() => {
      expect(findCall(calls, "GET", `/api/transactions?month=${nextMonth()}`)).toBeTruthy();
    });
  });

  it("does not show a próxima fatura tag in the table", async () => {
    await renderView([
      makeApiTransaction({ description: "Apple One", isCreditCard: 1, nextInvoice: 1 }),
    ]);

    expect(screen.getByText("Cartão")).toBeInTheDocument();
    expect(screen.queryByText("Próxima Fatura")).not.toBeInTheDocument();
  });

  it("sums only confirmed expenses, excluding previsões", async () => {
    const { page } = await renderView([
      makeApiTransaction({ description: "Mercado", amount: 12345 }),
      makeApiTransaction({ description: "Farmácia", amount: 5000 }),
      makeApiTransaction({
        description: "Aluguel previsto",
        amount: 200000,
        isPrevisao: 1,
      }),
    ]);

    // 123.45 + 50.00 — the 2000.00 previsão must stay out
    expect(page.sumValue()).toBe(brl(-173.45));
  });

  it("shows the income total when switching to the Rendas view", async () => {
    const { page } = await renderView([
      makeApiTransaction({ description: "Mercado", amount: 12345 }),
      makeApiTransaction({
        description: "Salário",
        amount: 500000,
        transactionType: "income",
        categoryId: null,
      }),
    ]);

    await page.switchListView("Rendas");
    await page.waitForRow("Salário");
    expect(page.sumValue()).toBe(brl(5000));
  });

  it("updates the sum when filtering by description", async () => {
    const { page } = await renderView([
      makeApiTransaction({ description: "Mercado", amount: 10000 }),
      makeApiTransaction({ description: "Cinema", amount: 4000, categoryId: "lazer" }),
    ]);

    await page.searchList("Cinema");
    expect(page.sumValue()).toBe(brl(-40));
  });
});

describe("NovoLancamento — criação de gasto recorrente", () => {
  it("sends the recurring expense payload on submit", async () => {
    const { page, calls } = await renderView();

    await page.fillDescription("Netflix");
    await page.fillValor("3990");
    await page.setDate("2026-07-15");
    await page.toggleCheckbox("Recorrente");
    await page.submitNew();

    const post = await waitFor(() => {
      const call = findCall(calls, "POST", "/api/transactions");
      expect(call).toBeTruthy();
      return call!;
    });

    expect(post.body).toMatchObject({
      description: "Netflix",
      amount: 3990,
      date: "2026-07-15",
      isRecorrente: true,
      isParcelado: false,
      transactionType: "expense",
      isPrevisao: false,
    });

    // form resets after a successful submit
    await waitFor(() => {
      expect(page.descriptionInput().value).toBe("");
    });
  });

  it("sends card credit payload when modo cartão is active", async () => {
    const { page, calls } = await renderView();

    fireEvent.click(screen.getByRole("button", { name: /modo cartão/i }));
    await page.fillDescription("Mercado");
    await page.fillValor("5000");
    await page.submitNew();

    const post = await waitFor(() => {
      const call = findCall(calls, "POST", "/api/transactions");
      expect(call).toBeTruthy();
      return call!;
    });

    expect(post.body).toMatchObject({ isCreditCard: true });
  });

  it("does not submit without a description or amount", async () => {
    const { page, calls } = await renderView();

    await page.fillValor("1000");
    await page.submitNew();
    expect(findCall(calls, "POST", "/api/transactions")).toBeUndefined();

    await page.fillDescription("Sem valor");
    await page.user.clear(page.valorInput());
    await page.submitNew();
    expect(findCall(calls, "POST", "/api/transactions")).toBeUndefined();
  });

  it("Recorrente and Parcelado are mutually exclusive", async () => {
    const { page } = await renderView();

    await page.toggleCheckbox("Recorrente");
    expect(page.checkboxOrNull("Parcelado")).toBeNull();

    await page.toggleCheckbox("Recorrente"); // uncheck
    expect(page.checkboxOrNull("Parcelado")).not.toBeNull();

    await page.toggleCheckbox("Parcelado");
    expect(page.checkboxOrNull("Recorrente")).toBeNull();
    // installments count field appears
    expect(screen.getByLabelText("Número de parcelas")).toBeInTheDocument();
  });

  it("shows the monthly value preview for installments", async () => {
    const { page } = await renderView();

    await page.fillValor("120000");
    await page.toggleCheckbox("Parcelado");
    await page.user.type(screen.getByLabelText("Número de parcelas"), "12");

    expect(screen.getByText(/100,00\/mês/)).toBeInTheDocument();
  });
});

describe("NovoLancamento — edição de gasto recorrente", () => {
  const recurringTx = () =>
    makeApiTransaction({
      id: "tx-rec-1",
      description: "Academia",
      amount: 10000,
      date: "2026-07-10",
      recurrenceTemplateId: "rt-1",
      isRecorrente: 1,
      categoryId: "moradia",
    });

  it("scrolls to the form when editing a row", async () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    const { page } = await renderView([recurringTx()]);

    await page.editRow("Academia");

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    });
  });

  it("opens the scope modal and applies the edit to future occurrences", async () => {
    const { page, calls } = await renderView([recurringTx()]);

    await page.editRow("Academia");
    expect(page.formTitle()).toContain("Editando Lançamento: Academia");

    await page.fillValor("12000");
    await page.saveEdit();

    await page.waitForDialog("Editar Transação Recorrente");
    await page.chooseRecurrenceOption("Aplicar a esta e todas as futuras");

    const put = await waitFor(() => {
      const call = findCall(calls, "PUT", "/api/transactions/tx-rec-1");
      expect(call).toBeTruthy();
      return call!;
    });

    expect(put.body.option).toBe("future");
    expect(put.body.updatedFields).toMatchObject({
      description: "Academia",
      amount: 12000,
    });

    // modal closes and the form leaves edit mode
    await waitFor(() => {
      expect(page.dialogIsOpen()).toBe(false);
    });
    expect(page.formTitle()).not.toContain("Editando");
  });

  it("can apply the edit to a single occurrence", async () => {
    const { page, calls } = await renderView([recurringTx()]);

    await page.editRow("Academia");
    await page.fillValor("9000");
    await page.saveEdit();

    await page.waitForDialog("Editar Transação Recorrente");
    await page.chooseRecurrenceOption("Aplicar apenas a esta ocorrência");

    const put = await waitFor(() => {
      const call = findCall(calls, "PUT", "/api/transactions/tx-rec-1");
      expect(call).toBeTruthy();
      return call!;
    });
    expect(put.body.option).toBe("only_this");
    expect(put.body.updatedFields.amount).toBe(9000);
  });

  it("edits a non-recurring expense directly, without the scope modal", async () => {
    const { page, calls } = await renderView([
      makeApiTransaction({ id: "tx-simple", description: "Padaria", amount: 2000 }),
    ]);

    await page.editRow("Padaria");
    await page.fillValor("2500");
    await page.saveEdit();

    const put = await waitFor(() => {
      const call = findCall(calls, "PUT", "/api/transactions/tx-simple");
      expect(call).toBeTruthy();
      return call!;
    });
    expect(put.body.option).toBe("only_this");
    expect(page.dialogIsOpen()).toBe(false);
  });
});

describe("NovoLancamento — exclusão de gasto recorrente", () => {
  it("asks for the scope and deletes the whole history", async () => {
    const { page, calls } = await renderView([
      makeApiTransaction({
        id: "tx-rec-2",
        description: "Spotify",
        amount: 2190,
        recurrenceTemplateId: "rt-2",
        isRecorrente: 1,
      }),
    ]);

    await page.deleteRow("Spotify");
    await page.waitForDialog("Excluir Transação Recorrente");
    await page.chooseRecurrenceOption("Excluir todo o histórico (passado e futuro)");

    const del = await waitFor(() => {
      const call = findCall(calls, "DELETE", "/api/transactions/tx-rec-2");
      expect(call).toBeTruthy();
      return call!;
    });
    expect(del.url).toContain("option=all");
  });

  it("deletes a non-recurring expense directly with only_this", async () => {
    const { page, calls } = await renderView([
      makeApiTransaction({ id: "tx-del", description: "Cinema", amount: 4000 }),
    ]);

    await page.deleteRow("Cinema");

    const del = await waitFor(() => {
      const call = findCall(calls, "DELETE", "/api/transactions/tx-del");
      expect(call).toBeTruthy();
      return call!;
    });
    expect(del.url).toContain("option=only_this");
  });
});

describe("NovoLancamento — confirmação de previsão", () => {
  it("confirms a previsão from the row action", async () => {
    const { page, calls } = await renderView([
      makeApiTransaction({
        id: "tx-prev",
        description: "Conta de luz",
        amount: 18000,
        isPrevisao: 1,
      }),
    ]);

    await page.confirmRow("Conta de luz");

    await waitFor(() => {
      expect(findCall(calls, "POST", "/api/transactions/tx-prev/confirm")).toBeTruthy();
    });
  });
});
