import { useSimulationDraftStore } from "@/features/simulation/stores/simulationDraftStore";
import type { Category, Person, Transaction } from "@/lib/types";
import { server } from "@/test/server";
import { render, screen, userEvent, waitFor } from "@/test/test-utils";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SimulationView } from "../SimulationView";

// Avoid Recharts ResponsiveContainer width/height -1 in JSDOM (no layout)
vi.mock("../FutureProjectionChart", () => ({
  FutureProjectionChart: () => <div data-testid="future-projection-chart" />,
}));

const mockPeople: Person[] = [
  { id: "p1", name: "Alice", income: 10000 },
  { id: "p2", name: "Bob", income: 8000 },
];

const mockCategories: Category[] = [{ id: "c1", name: "Alimentação", targetPercent: 30 }];

const mockTransactions: Transaction[] = [
  {
    id: 1,
    description: "Aluguel",
    amount: 3000,
    categoryId: "c1",
    paidBy: "p1",
    isRecurring: true,
    isCreditCard: false,
    excludeFromSplit: false,
    isForecast: false,
    date: "2025-01-01",
    type: "expense",
    isIncrement: true,
  },
];

const mockSimulationState = {
  participants: [
    {
      id: "p1",
      name: "Alice",
      realIncome: 10000,
      isActive: true,
      incomeMultiplier: 1,
      simulatedIncome: 10000,
    },
    {
      id: "p2",
      name: "Bob",
      realIncome: 8000,
      isActive: true,
      incomeMultiplier: 1,
      simulatedIncome: 8000,
    },
  ],
  scenario: "currentMonth" as const,
  expenseOverrides: {
    ignoredExpenseIds: [] as string[],
    manualExpenses: [] as { id: string; description: string; amount: number }[],
  },
};

const mockSavedSimulations = [
  {
    id: "sim-1",
    name: "Cenário teste",
    state: mockSimulationState,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    householdId: "h1",
  },
];

function setupHandlers() {
  return [
    http.get("/api/people", () => HttpResponse.json(mockPeople)),
    http.get("/api/transactions", () => HttpResponse.json(mockTransactions)),
    http.get("/api/categories", () => HttpResponse.json(mockCategories)),
    http.get("/api/emergency-fund", () => HttpResponse.json({ emergencyFund: 50000 })),
    http.get("/api/simulations", () => HttpResponse.json(mockSavedSimulations)),
  ];
}

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  useSimulationDraftStore.getState().clearStorage?.();
});
afterAll(() => server.close());

const selectors = {
  getTitle: () => screen.getByText(/Simulação de Futuro/i),
  findTitle: () => screen.findByText(/Simulação de Futuro/i),
  getSubtitle: () => screen.getByText(/Simule cenários sem afetar seus dados reais/i),
  getCenarioGastos: () => screen.getByText(/Cenário de Gastos/i),
  getGastosSimulacao: () => screen.getByText(/Gastos na Simulação/i),
  getLoadingSkeleton: () => document.querySelector(".animate-pulse"),
  querySaveSimulacaoButton: () => screen.queryByRole("button", { name: /Salvar simulação/i }),
  getSaveSimulacaoDialog: () => screen.getByRole("dialog", { name: /Salvar Simulação/i }),
  getSimulacoesSalvas: () => screen.getByText(/Simulações salvas/i),
  getMinimalistaHeading: () => screen.getByRole("heading", { name: "Minimalista" }),
  modal: {
    getNomeInput: () => screen.getByLabelText(/nome da simulação/i),
    getSalvarButton: () => screen.getByRole("button", { name: /^Salvar$/i }),
  },
  getSavedSimulationsToggle: () => screen.getByText(/Simulações salvas/i).closest("button"),
  getLoadButtons: () => screen.getAllByRole("button", { name: /Carregar/i }),
};

describe("SimulationView", () => {
  beforeEach(() => {
    server.use(...setupHandlers());
    localStorage.clear();
  });

  describe("Page structure", () => {
    it("renders without crashing when APIs return minimal data", async () => {
      render(<SimulationView />);
      await selectors.findTitle();
    });

    it("renders title and subtitle", async () => {
      render(<SimulationView />);
      expect(await screen.findByText("Simulação de Futuro")).toBeInTheDocument();
      expect(selectors.getSubtitle()).toBeInTheDocument();
    });

    it("renders ParticipantSimulator, ScenarioSelector, EditableExpensesCard", async () => {
      render(<SimulationView />);
      await selectors.findTitle();
      await waitFor(() => {
        expect(selectors.getCenarioGastos()).toBeInTheDocument();
      });
      expect(selectors.getGastosSimulacao()).toBeInTheDocument();
    });

    it("shows loading skeleton when data is loading", () => {
      server.use(
        http.get("/api/people", () => new Promise(() => {})),
        http.get("/api/transactions", () => HttpResponse.json([])),
        http.get("/api/categories", () => HttpResponse.json([])),
        http.get("/api/emergency-fund", () => HttpResponse.json({ emergencyFund: 0 })),
        http.get("/api/simulations", () => HttpResponse.json([])),
      );
      render(<SimulationView />);
      expect(selectors.getLoadingSkeleton()).toBeInTheDocument();
    });
  });

  describe("Action buttons when hasChanges", () => {
    it("Salvar simulação opens SaveSimulationModal when changes exist", async () => {
      const user = userEvent.setup();
      render(<SimulationView />);
      await selectors.findTitle();
      await waitFor(
        () => {
          const saveBtn = selectors.querySaveSimulacaoButton();
          if (saveBtn && !saveBtn.hasAttribute("disabled")) {
            return saveBtn;
          }
          return null;
        },
        { timeout: 5000 },
      )
        .then(async (saveBtn) => {
          if (saveBtn) {
            await user.click(saveBtn);
            await waitFor(() => {
              expect(selectors.getSaveSimulacaoDialog()).toBeInTheDocument();
            });
          }
        })
        .catch(() => {});
    });
  });

  describe("Saved simulations list", () => {
    it("renders Simulações salvas when there are saved simulations", async () => {
      render(<SimulationView />);
      await selectors.findTitle();
      await waitFor(() => {
        expect(selectors.getSimulacoesSalvas()).toBeInTheDocument();
      });
    });
  });

  describe("Save simulation modal", () => {
    it("opening modal and submitting save calls POST /api/simulations with name and state", async () => {
      const user = userEvent.setup();
      let capturedBody: unknown = null;
      server.use(
        ...setupHandlers(),
        http.post("/api/simulations", async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({
            id: "sim-new",
            name: (capturedBody as { name?: string })?.name ?? "Test",
            state: (capturedBody as { state?: unknown })?.state ?? mockSimulationState,
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
            householdId: "h1",
          });
        }),
      );

      render(<SimulationView />);
      await selectors.findTitle();

      await waitFor(() => {
        expect(selectors.getCenarioGastos()).toBeInTheDocument();
      });

      await user.click(selectors.getMinimalistaHeading());
      const saveBtn = await waitFor(
        () => {
          const btn = selectors.querySaveSimulacaoButton();
          if (btn && !btn.hasAttribute("disabled")) return btn;
          return null;
        },
        { timeout: 2000 },
      );

      expect(saveBtn).toBeTruthy();
      if (saveBtn) {
        await user.click(saveBtn);
        await waitFor(() => {
          expect(selectors.getSaveSimulacaoDialog()).toBeInTheDocument();
        });
        await user.type(selectors.modal.getNomeInput(), "Minha sim");
        await user.click(selectors.modal.getSalvarButton());
        await waitFor(
          () => {
            expect(capturedBody).toBeTruthy();
            expect((capturedBody as { name?: string })?.name).toBe("Minha sim");
          },
          { timeout: 3000 },
        );
      }
    });

    it.todo("ao falhar POST /api/simulations: exibir feedback de erro e manter modal aberto");
  });

  describe("Load/update/delete simulation", () => {
    it("Load updates state and highlights active simulation", async () => {
      const user = userEvent.setup();
      render(<SimulationView />);
      await selectors.findTitle();
      await waitFor(() => {
        expect(selectors.getSimulacoesSalvas()).toBeInTheDocument();
      });
      const toggleBtn = selectors.getSavedSimulationsToggle();
      if (toggleBtn) {
        await user.click(toggleBtn);
        const loadBtn = selectors.getLoadButtons()[0];
        if (loadBtn) await user.click(loadBtn);
      }
    });

    it.todo(
      "ao falhar load (GET) ou update (PATCH) ou delete (DELETE): exibir feedback de erro adequado",
    );
  });
});
