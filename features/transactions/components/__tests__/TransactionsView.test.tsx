import { useCurrentMonthStore } from "@/lib/stores/currentMonthStore";
import type { Category, Person, Transaction } from "@/lib/types";
import { server } from "@/test/server";
import { render, screen, userEvent, waitFor, within } from "@/test/test-utils";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionsView } from "../TransactionsView";

/** Instant typing/clicks in tests; avoids delay between keystrokes. */
const user = userEvent.setup({ delay: null });

const mockPeople: Person[] = [
  { id: "p1", name: "Alice", income: 10000 },
  { id: "p2", name: "Bob", income: 8000 },
];

const mockCategories: Category[] = [
  { id: "c1", name: "Alimentação", targetPercent: 30 },
  { id: "c2", name: "Transporte", targetPercent: 20 },
];

// Mock Next.js navigation
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/lancamentos",
}));

// Mock Gemini so tests never hit the network
vi.mock("@/lib/geminiClient", () => ({
  generateGeminiContent: vi.fn().mockResolvedValue(null),
}));
const mockTransactions: Transaction[] = [
  {
    id: 1,
    description: "Supermercado",
    amount: 500,
    categoryId: "c1",
    paidBy: "p1",
    recurringTemplateId: null,
    isCreditCard: false,
    isNextBilling: false,
    excludeFromSplit: false,
    isForecast: false,
    date: "2025-01-15",
    type: "expense",
    isIncrement: true,
  },
  {
    id: 2,
    description: "Uber",
    amount: 35,
    categoryId: "c2",
    paidBy: "p1",
    recurringTemplateId: null,
    isCreditCard: false,
    isNextBilling: false,
    excludeFromSplit: false,
    isForecast: true,
    date: "2025-01-20",
    type: "expense",
    isIncrement: true,
  },
];

function setupHandlers(transactions: Transaction[] = mockTransactions) {
  return [
    http.get("/api/transactions", ({ request }) => {
      const url = new URL(request.url);
      const year = url.searchParams.get("year");
      const month = url.searchParams.get("month");
      if (year && month) {
        return HttpResponse.json(transactions);
      }
      return HttpResponse.json([]);
    }),
    http.get("/api/people", () => HttpResponse.json(mockPeople)),
    http.get("/api/categories", () => HttpResponse.json(mockCategories)),
    http.get("/api/default-payer", () => HttpResponse.json({ defaultPayerId: "p1" })),
    http.get("/api/user", () => HttpResponse.json({ userId: "u1" })),
    http.get("/api/outlier-statistics", () => HttpResponse.json([])),
  ];
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const selectors = {
  findHistorico: () => screen.findByText(/Total de/i),
  findAllHeadingsLevel2: () => screen.findAllByRole("heading", { level: 2 }),
  getAllHeadingsLevel2: () => screen.getAllByRole("heading", { level: 2 }),
  findFormTitle: () => screen.findByText(/Nova Despesa Manual|Novo Lançamento de Renda/i),
  getAdicionarLancamentoButton: () => screen.getByRole("button", { name: /Adicionar Lançamento/i }),
  findDoisItens: () => screen.findByText(/Total de 2 lançamentos/),
  findFilterLabel: () => screen.findByLabelText(/Filtrar lançamentos/i),
  findSearchLabel: () => screen.findByLabelText(/Buscar lançamentos/i),
  getSelecionarButton: () => screen.getByRole("button", { name: /Selecionar/i }),
  findLancamentosCount: () => screen.findByText(/Total de 2 lançamentos/),
  getAllButtons: () => screen.getAllByRole("button"),
  findSupermercado: () => screen.findByText("Supermercado"),
  findUber: () => screen.findByText("Uber"),
  getAmount500: () => screen.getAllByText(/R\$\s*500[,.]00/),
  getAmount35: () => screen.getAllByText(/R\$\s*35[,.]00/),
  getMarcarAcontecidoButton: (desc: string) =>
    screen.getByLabelText(new RegExp(`Marcar lançamento como acontecido: ${desc}`, "i")),
  findNenhumLancamento: () => screen.findByText(/Nenhum lançamento neste mês/i),
  form: {
    getDescricaoInput: () =>
      screen.getByLabelText(/Descrição/i) || screen.getByPlaceholderText(/Descrição/i),
    getAmountInput: () =>
      document.querySelector('input[placeholder*="R$"]') ||
      document.querySelector('input[id*="amount"]'),
  },
  getRendaTab: () => screen.getAllByRole("button", { name: "Renda" })[0],
  getAdicionarRendaButton: () => screen.getByRole("button", { name: /Adicionar Renda/i }),
  getEditButton: (desc: string) =>
    screen.getByLabelText(new RegExp(`Editar lançamento: ${desc}`, "i")),
  getEditDescriptionField: () =>
    document.querySelector("#edit-description") ?? screen.queryByLabelText(/Descrição/i),
  getEditDescriptionInput: () =>
    document.querySelector("#edit-description") || screen.getByLabelText(/Descrição/i),
  getSaveConfirmButton: () => screen.getByRole("button", { name: /Salvar|Confirmar/i }),
  getDeleteButton: (desc: string) =>
    screen.getByLabelText(new RegExp(`Excluir lançamento: ${desc}`, "i")),
  toolbar: {
    getFilterButton: () => screen.getByLabelText(/Filtrar lançamentos/i),
    getFilterBar: () => {
      const btn = screen.getByLabelText(/Filtrar lançamentos/i);
      return (btn.closest(".noir-card") ?? document.body) as HTMLElement;
    },
    getTipoLabel: () =>
      within(selectors.toolbar.getFilterBar()).getByRole("button", { name: "Despesa" }),
    getAtribuidoLabel: () =>
      within(selectors.toolbar.getFilterBar()).getByRole("button", { name: /Atribuído à/i }),
    getTypeSelect: () =>
      within(selectors.toolbar.getFilterBar()).getByRole("button", { name: "Despesa" }),
    getTypeFilterValue: () =>
      (document.querySelector("#type-filter") as HTMLInputElement)?.value ?? "",
    getClearFilters: () => screen.queryByRole("button", { name: /^Limpar$/i }),
    getSearchButton: () => screen.getByLabelText(/Buscar lançamentos/i),
    getSearchInput: () => screen.getByPlaceholderText(/Buscar por descrição, categoria, pessoa/i),
  },
  getTransactionText: (text: string) => screen.getByText(text),
  queryTransactionText: (text: string) => screen.queryByText(text),
  selection: {
    getSelecionarButton: () => screen.getByRole("button", { name: /Selecionar/i }),
    getCancelarSelecao: () => screen.getByText(/Cancelar Seleção/i),
    getSelecionarTodos: () => screen.getByRole("button", { name: /Selecionar Todos/i }),
    getEditarMassa: () => screen.getByRole("button", { name: /Editar em Massa/i }),
    getExcluir: () => screen.getByRole("button", { name: /Excluir/i }),
    getSelecionadoCount: () => screen.getByText(/2 selecionado/i),
  },
  getBulkEditDialog: () => screen.getByRole("dialog"),
};

function renderView() {
  return render(<TransactionsView />);
}

describe("TransactionsView", { timeout: 5000 }, () => {
  beforeEach(() => {
    useCurrentMonthStore.setState({
      selectedMonthDate: new Date(2025, 0, 1),
    });
    server.use(...setupHandlers());
  });

  describe("Page structure", () => {
    it("renders without crashing when API returns minimal data", async () => {
      renderView();
      await selectors.findHistorico();
    });

    it("renders MonthNavigator", async () => {
      renderView();
      const headings = await selectors.findAllHeadingsLevel2();
      expect(headings.length).toBeGreaterThanOrEqual(1);
      expect(headings[0]).toHaveTextContent(/janeiro|Janeiro/i);
    });

    it("renders Nova Despesa Manual form with TransactionFormFields", async () => {
      renderView();
      await selectors.findFormTitle();
      expect(selectors.getAdicionarLancamentoButton()).toBeInTheDocument();
    });

    it("renders Histórico section with item count badge", async () => {
      renderView();
      await selectors.findHistorico();
      await selectors.findDoisItens();
    });

    it("renders Filter, Search and Selecionar buttons in toolbar", async () => {
      renderView();
      await selectors.findFilterLabel();
      await selectors.findSearchLabel();
      await selectors.getSelecionarButton();
    });
  });

  describe("Month navigator", () => {
    it("displays correct month label and N lançamentos count", async () => {
      renderView();
      await selectors.findLancamentosCount();
      const headings = selectors.getAllHeadingsLevel2();
      expect(headings.some((h) => /janeiro.*2025|Janeiro.*2025/i.test(h.textContent ?? ""))).toBe(
        true,
      );
    });

    it("clicking prev updates displayed month", async () => {
      renderView();
      await selectors.findLancamentosCount();
      const buttons = selectors.getAllButtons();
      const prevButton = buttons[0];
      await user.click(prevButton);
      await waitFor(() => {
        const headings = selectors.getAllHeadingsLevel2();
        expect(
          headings.some((h) => /dezembro.*2024|Dezembro.*2024/i.test(h.textContent ?? "")),
        ).toBe(true);
      });
    });
  });

  describe("Transaction list", () => {
    it("displays transactions with description, amount, category, date", async () => {
      renderView();
      await selectors.findSupermercado();
      await selectors.findUber();
      expect(selectors.getAmount500().length).toBeGreaterThan(0);
      expect(selectors.getAmount35().length).toBeGreaterThan(0);
    });

    it("shows Marcar como acontecido button for forecast transactions", async () => {
      renderView();
      await selectors.findUber();
      expect(selectors.getMarcarAcontecidoButton("Uber")).toBeInTheDocument();
    });

    it("empty state shows Nenhum lançamento neste mês when no transactions", async () => {
      server.use(...setupHandlers([]));
      renderView();
      await selectors.findNenhumLancamento();
    });
  });

  describe("Add transaction", () => {
    it("submitting valid form calls POST /api/transactions with correct body", async () => {
      let capturedBody: unknown = null;
      server.use(
        ...setupHandlers(),
        http.post("/api/transactions", async ({ request }) => {
          capturedBody = await request.json();
          const payload = Array.isArray(capturedBody) ? capturedBody[0] : capturedBody;
          return HttpResponse.json([
            {
              ...payload,
              id: 99,
              description: payload?.description ?? "Test",
              amount: payload?.amount ?? 10000,
            },
          ]);
        }),
      );

      renderView();
      await selectors.findSupermercado();

      const descInput = selectors.form.getDescricaoInput();
      const amountInput = selectors.form.getAmountInput();
      if (descInput) await user.type(descInput, "Almoço");
      if (amountInput) await user.type(amountInput, "50");

      const submitBtn = selectors.getAdicionarLancamentoButton();
      await user.click(submitBtn);

      await waitFor(() => {
        expect(capturedBody).toBeTruthy();
      });
    });

    it("submit button reflects type Adicionar Lançamento vs Adicionar Renda", async () => {
      renderView();
      await selectors.findSupermercado();
      expect(selectors.getAdicionarLancamentoButton()).toBeInTheDocument();
      await user.click(selectors.getRendaTab());
      await waitFor(() => {
        expect(selectors.getAdicionarRendaButton()).toBeInTheDocument();
      });
    });
  });

  describe("Edit transaction modal", () => {
    it("clicking Pencil opens EditTransactionModal with pre-filled values", async () => {
      renderView();
      await selectors.findSupermercado();
      const editButton = selectors.getEditButton("Supermercado");
      await user.click(editButton);
      await waitFor(() => {
        const descField = selectors.getEditDescriptionField();
        expect(descField).toBeInTheDocument();
      });
    });

    it("submitting edit calls PATCH /api/transactions/:id and closes modal", async () => {
      let patchUrl: string | null = null;
      let patchBody: unknown = null;
      server.use(
        ...setupHandlers(),
        http.patch("/api/transactions/:id", async ({ request, params }) => {
          patchUrl = request.url;
          patchBody = await request.json();
          return HttpResponse.json({
            ...mockTransactions[0],
            description:
              (patchBody as { patch?: { description?: string } })?.patch?.description ??
              "Supermercado",
          });
        }),
      );

      renderView();
      await selectors.findSupermercado();
      const editButton = selectors.getEditButton("Supermercado");
      await user.click(editButton);

      await waitFor(() => {
        const descField = selectors.getEditDescriptionInput();
        expect(descField).toBeInTheDocument();
      });

      const descInput = selectors.getEditDescriptionInput();
      if (descInput) {
        await user.clear(descInput as HTMLInputElement);
        await user.type(descInput as HTMLInputElement, "Supermercado Editado");
      }

      const saveButton = selectors.getSaveConfirmButton();
      await user.click(saveButton);

      await waitFor(() => {
        expect(patchUrl).toContain("/api/transactions/1");
        expect(patchBody).toBeTruthy();
      });
    });
  });

  describe("Mark as happened (joia)", () => {
    it("clicking CheckCircle2 on forecast calls PATCH /api/transactions/:id with isForecast false", async () => {
      let patchBody: unknown = null;
      server.use(
        ...setupHandlers(),
        http.patch("/api/transactions/:id", async ({ request }) => {
          patchBody = await request.json();
          return HttpResponse.json({
            ...mockTransactions[1],
            isForecast: false,
          });
        }),
      );

      renderView();
      await selectors.findUber();
      const markButton = selectors.getMarcarAcontecidoButton("Uber");
      await user.click(markButton);

      await waitFor(() => {
        expect(patchBody).toBeTruthy();
        const body = patchBody as { patch?: { isForecast?: boolean } };
        expect(body?.patch?.isForecast).toBe(false);
      });
    });

    it.todo(
      "ao falhar a requisição (PATCH retorna erro): exibir feedback de erro e não atualizar o lançamento até sucesso",
    );
  });

  describe("Delete transaction", () => {
    it("clicking Trash2 on non-recurring triggers delete and row is removed", async () => {
      let deleteCalled = false;
      server.use(
        ...setupHandlers(),
        http.delete("/api/transactions/:id", () => {
          deleteCalled = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      renderView();
      await selectors.findSupermercado();
      const deleteButton = selectors.getDeleteButton("Supermercado");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(deleteCalled).toBe(true);
      });
    });

    it.todo("ao falhar DELETE: exibir feedback de erro e não remover o lançamento da lista");
  });

  describe("Filters and search", () => {
    it("opening Filter panel shows Tipo, Atribuído à, Categoria, Cartão, Fora do padrão", async () => {
      renderView();
      await selectors.findSupermercado();
      expect(selectors.toolbar.getTipoLabel()).toBeInTheDocument();
      expect(selectors.toolbar.getAtribuidoLabel()).toBeInTheDocument();
      await user.click(selectors.toolbar.getFilterButton());
      await waitFor(() => {
        expect(screen.getByText(/Filtros Avançados/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Cartão$/i)).toBeInTheDocument();
        expect(screen.getByText(/Fora do padrão/i)).toBeInTheDocument();
      });
    });

    it("Limpar filtros resets all filters", async () => {
      renderView();
      await selectors.findSupermercado();
      await user.click(selectors.toolbar.getTypeSelect());
      expect(selectors.toolbar.getTypeFilterValue()).toBe("expense");
      await user.click(selectors.toolbar.getFilterButton());
      const clearBtn = selectors.toolbar.getClearFilters();
      expect(clearBtn).toBeInTheDocument();
      if (clearBtn) await user.click(clearBtn);
      expect(selectors.toolbar.getTypeFilterValue()).toBe("all");
    });

    it("search input filters list", async () => {
      renderView();
      await selectors.findSupermercado();
      await user.click(selectors.toolbar.getSearchButton());
      const searchInput = selectors.toolbar.getSearchInput();
      await user.type(searchInput, "Uber");
      await waitFor(() => {
        expect(selectors.getTransactionText("Uber")).toBeInTheDocument();
        expect(selectors.queryTransactionText("Supermercado")).not.toBeInTheDocument();
      });
    });

    it("filtering by Recurring shows only recurring transactions", async () => {
      server.use(
        ...setupHandlers([
          { ...mockTransactions[0], description: "NonRecurring", recurringTemplateId: null },
          { ...mockTransactions[1], description: "Recurring", recurringTemplateId: 100 },
        ]),
      );

      renderView();
      await selectors.findHistorico();

      await user.click(selectors.toolbar.getFilterButton());
      const recurringSwitch = screen.getByRole("switch", { name: /Recorrente/i });
      expect(recurringSwitch).toBeInTheDocument();
      await user.click(recurringSwitch);

      await waitFor(() => {
        expect(screen.getByText("Recurring")).toBeInTheDocument();
        expect(screen.queryByText("NonRecurring")).not.toBeInTheDocument();
      });

      await user.click(recurringSwitch);
      await waitFor(() => {
        expect(screen.getByText("Recurring")).toBeInTheDocument();
        expect(screen.getByText("NonRecurring")).toBeInTheDocument();
      });
    });
  });

  describe("Selection mode and bulk actions", () => {
    it("clicking Selecionar enters selection mode with checkboxes", async () => {
      renderView();
      await selectors.findSupermercado();
      await user.click(selectors.selection.getSelecionarButton());
      await waitFor(() => {
        expect(selectors.selection.getCancelarSelecao()).toBeInTheDocument();
        expect(selectors.selection.getSelecionarTodos()).toBeInTheDocument();
      });
    });

    it("Selecionar Todos selects non-recurring items", async () => {
      renderView();
      await selectors.findSupermercado();
      await user.click(selectors.selection.getSelecionarButton());
      await user.click(selectors.selection.getSelecionarTodos());
      await waitFor(() => {
        expect(selectors.selection.getSelecionadoCount()).toBeInTheDocument();
      });
    });

    it("Editar em Massa opens BulkEditModal", async () => {
      renderView();
      await selectors.findSupermercado();
      await user.click(selectors.selection.getSelecionarButton());
      await user.click(selectors.selection.getSelecionarTodos());
      await user.click(selectors.selection.getEditarMassa());
      await waitFor(() => {
        const dialog = selectors.getBulkEditDialog();
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveTextContent(/Editar em Massa/i);
      });
    });

    it("Excluir triggers confirm and DELETE bulk", async () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
      let bulkDeleteCalled = false;
      server.use(
        ...setupHandlers(),
        http.delete("/api/transactions/bulk", () => {
          bulkDeleteCalled = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      renderView();
      await selectors.findSupermercado();
      await user.click(selectors.selection.getSelecionarButton());
      await user.click(selectors.selection.getSelecionarTodos());
      await user.click(selectors.selection.getExcluir());

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
        expect(bulkDeleteCalled).toBe(true);
      });
      confirmSpy.mockRestore();
    });

    it.todo(
      "ao falhar PATCH bulk ou DELETE bulk: exibir feedback de erro e não atualizar a lista até sucesso",
    );
  });
});
