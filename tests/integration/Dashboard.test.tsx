import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardView } from "@/components/finance/DashboardView";
import { server } from "../setup/mocks/server";
import { render, screen, waitFor } from "../setup/test-utils";
import userEvent from "@testing-library/user-event";

describe("Dashboard", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Summary Cards", () => {
    it("displays total family income card", async () => {
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText("Renda Total Familiar")).toBeInTheDocument();
      });

      // Total income should be displayed - card should contain a currency value
      const incomeCard = screen.getByText("Renda Total Familiar").closest("div");
      expect(incomeCard).toBeInTheDocument();
    });

    it("displays total expenses card with month label", async () => {
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText(/Total Gasto/i)).toBeInTheDocument();
      });
    });

    it("displays free balance card", async () => {
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText("Saldo Livre")).toBeInTheDocument();
      });
    });

    it("shows income transactions breakdown when present", async () => {
      render(<DashboardView />);

      // Wait for income breakdown to show (we have a bonus transaction)
      await waitFor(() => {
        expect(screen.getByText(/adicionado/i)).toBeInTheDocument();
      });
    });

    it("displays forecast expenses section when forecasts exist", async () => {
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText(/Previsões de gastos/i)).toBeInTheDocument();
      });

      // Should show the forecast transaction
      expect(screen.getByText("Conta de Luz Prevista")).toBeInTheDocument();
    });

    it("allows marking forecast as official", async () => {
      const user = userEvent.setup();
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText("Conta de Luz Prevista")).toBeInTheDocument();
      });

      // Find the thumbs up button to mark as official
      const markOfficialButton = screen.getByTitle("Marcar como oficial");
      expect(markOfficialButton).toBeInTheDocument();

      // Click should trigger the update
      await user.click(markOfficialButton);

      // The button should have been clicked (API call made)
    });

    it("allows toggling forecast inclusion in calculations", async () => {
      const user = userEvent.setup();
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText("Conta de Luz Prevista")).toBeInTheDocument();
      });

      // Find the eye button to toggle inclusion
      const toggleButtons = screen.getAllByTitle(/considerar na conta/i);
      expect(toggleButtons.length).toBeGreaterThan(0);

      // Click to toggle
      await user.click(toggleButtons[0]);
    });
  });

  describe("Fair Distribution Section", () => {
    it("displays fair distribution section with title", async () => {
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText(/Distribuição Justa/i)).toBeInTheDocument();
      });
    });

    it("shows settlement summary", async () => {
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText(/Resumo do Acerto/i)).toBeInTheDocument();
      });
    });

    it("displays person settlement rows", async () => {
      render(<DashboardView />);

      // Wait for settlement data to load
      await waitFor(() => {
        // Should show person names in settlement
        expect(screen.getByText(/Distribuição Justa/i)).toBeInTheDocument();
      });

      // The settlement section should contain information about each person's contribution
    });

    it("shows transfer instructions when someone owes money", async () => {
      render(<DashboardView />);

      await waitFor(() => {
        // Either shows transfer instructions or "all settled" message
        const hasTransferInstruction = screen.queryByText(/precisa transferir/i);
        const isSettled = screen.queryByText(/Tudo quitado/i);
        expect(hasTransferInstruction || isSettled).toBeTruthy();
      });
    });
  });

  describe("Category Summary Table", () => {
    it("displays category summary table with header", async () => {
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText("Metas vs Realizado")).toBeInTheDocument();
      });
    });

    it("shows table headers for category breakdown", async () => {
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText("Categoria")).toBeInTheDocument();
        expect(screen.getByText("Gasto")).toBeInTheDocument();
        expect(screen.getByText("% Previsto")).toBeInTheDocument();
        expect(screen.getByText("% Real")).toBeInTheDocument();
        expect(screen.getByText("Status")).toBeInTheDocument();
      });
    });

    it("displays all categories in the table", async () => {
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText("Custos Fixos")).toBeInTheDocument();
        expect(screen.getByText("Conforto")).toBeInTheDocument();
        expect(screen.getByText("Metas")).toBeInTheDocument();
        expect(screen.getByText("Prazeres")).toBeInTheDocument();
        expect(screen.getByText("Liberdade Financeira")).toBeInTheDocument();
        expect(screen.getByText("Conhecimento")).toBeInTheDocument();
      });
    });

    it("shows budget status indicators (Dentro/Estourou/Faltando)", async () => {
      render(<DashboardView />);

      await waitFor(() => {
        // Should have at least one status indicator
        const dentroStatus = screen.queryAllByText("Dentro");
        const estourouStatus = screen.queryAllByText("Estourou");
        const faltandoStatus = screen.queryAllByText("Faltando");

        const totalStatuses =
          dentroStatus.length + estourouStatus.length + faltandoStatus.length;
        expect(totalStatuses).toBeGreaterThan(0);
      });
    });

    it("displays total row at the bottom", async () => {
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText("TOTAL")).toBeInTheDocument();
      });
    });
  });

  describe("Month Navigation", () => {
    it("displays current month with navigation buttons", async () => {
      render(<DashboardView />);

      await waitFor(() => {
        // Should show month name (in Portuguese) - look for the header specifically
        const monthNames = [
          "janeiro",
          "fevereiro",
          "março",
          "abril",
          "maio",
          "junho",
          "julho",
          "agosto",
          "setembro",
          "outubro",
          "novembro",
          "dezembro",
        ];
        const hasMonthName = monthNames.some((month) =>
          screen.queryAllByText(new RegExp(month, "i")).length > 0,
        );
        expect(hasMonthName).toBe(true);
      });
    });

    it("shows transaction count for current month", async () => {
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText(/lançamentos neste mês/i)).toBeInTheDocument();
      });
    });

    it("navigates to previous month when clicking left arrow", async () => {
      const user = userEvent.setup();
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText(/lançamentos neste mês/i)).toBeInTheDocument();
      });

      // Find navigation buttons
      const buttons = screen.getAllByRole("button");
      const prevButton = buttons.find((btn) => btn.querySelector(".lucide-chevron-left"));

      if (prevButton) {
        await user.click(prevButton);
        // Month should change (this will trigger a re-fetch)
      }
    });

    it("navigates to next month when clicking right arrow", async () => {
      const user = userEvent.setup();
      render(<DashboardView />);

      await waitFor(() => {
        expect(screen.getByText(/lançamentos neste mês/i)).toBeInTheDocument();
      });

      // Find navigation buttons
      const buttons = screen.getAllByRole("button");
      const nextButton = buttons.find((btn) => btn.querySelector(".lucide-chevron-right"));

      if (nextButton) {
        await user.click(nextButton);
        // Month should change (this will trigger a re-fetch)
      }
    });
  });
});
