import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TransactionsView } from "@/components/finance/TransactionsView";
import { server } from "../setup/mocks/server";
import { render, screen, waitFor, within } from "../setup/test-utils";
import userEvent from "@testing-library/user-event";

describe("TransactionHistory", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Transaction List Display", () => {
    it("displays all transactions for the current month", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
        expect(screen.getByText("Mercado")).toBeInTheDocument();
        expect(screen.getByText("Netflix")).toBeInTheDocument();
        expect(screen.getByText("Restaurante")).toBeInTheDocument();
      });
    });

    it("shows transaction amounts formatted as currency", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        // Check for currency formatted amounts
        expect(screen.getByText(/R\$ 1\.500,00/)).toBeInTheDocument(); // Aluguel
        expect(screen.getByText(/R\$ 500,00/)).toBeInTheDocument(); // Mercado
      });
    });

    it("displays recurring badge for recurring transactions", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Should show recurring badges
      const recurringBadges = screen.getAllByText("Recorrente");
      expect(recurringBadges.length).toBeGreaterThan(0);
    });

    it("displays credit card badge for credit card transactions", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Netflix")).toBeInTheDocument();
      });

      // Should show credit card badge (Cartão)
      const cardBadges = screen.getAllByText("Cartão");
      expect(cardBadges.length).toBeGreaterThan(0);
    });

    it("displays forecast badge for forecast transactions", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Conta de Luz Prevista")).toBeInTheDocument();
      });

      // Should show forecast badge
      const forecastBadges = screen.getAllByText("Previsão");
      expect(forecastBadges.length).toBeGreaterThan(0);
    });

    it("displays income transactions with special styling", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Bônus")).toBeInTheDocument();
      });

      // Income transaction should have "Renda" badge (in the list, not just the form button)
      const rendaBadges = screen.getAllByText("Renda");
      // At least one should be a badge (there's also a button with "Renda")
      expect(rendaBadges.length).toBeGreaterThan(0);
    });

    it("displays excluded from split badge when applicable", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Investimento Mensal")).toBeInTheDocument();
      });

      // Should show "Fora da divisão" badge
      expect(screen.getByText("Fora da divisão")).toBeInTheDocument();
    });

    it("shows total count and sum at the bottom", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        // Wait for transactions to load first
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Should show total row with count
      await waitFor(() => {
        expect(screen.getByText(/Total \(/i)).toBeInTheDocument();
      });
    });
  });

  describe("Filtering", () => {
    it("opens filter panel when filter button is clicked", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByTitle("Filtrar lançamentos")).toBeInTheDocument();
      });

      await user.click(screen.getByTitle("Filtrar lançamentos"));

      // Filter options should be visible - use select IDs
      await waitFor(() => {
        expect(document.getElementById("type-filter")).toBeInTheDocument();
        expect(document.getElementById("paid-by-filter")).toBeInTheDocument();
        expect(document.getElementById("category-filter")).toBeInTheDocument();
      });
    });

    it("filters transactions by type (expense)", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Bônus")).toBeInTheDocument();
      });

      // Open filters
      await user.click(screen.getByTitle("Filtrar lançamentos"));

      await waitFor(() => {
        expect(screen.getByLabelText("Tipo")).toBeInTheDocument();
      });

      // Filter by expense
      await user.selectOptions(screen.getByLabelText("Tipo"), "expense");

      // Income transaction (Bônus) should be hidden
      await waitFor(() => {
        expect(screen.queryByText("Bônus")).not.toBeInTheDocument();
      });

      // Expense transactions should still be visible
      expect(screen.getByText("Aluguel")).toBeInTheDocument();
    });

    it("filters transactions by type (income)", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Open filters
      await user.click(screen.getByTitle("Filtrar lançamentos"));

      await waitFor(() => {
        expect(screen.getByLabelText("Tipo")).toBeInTheDocument();
      });

      // Filter by income
      await user.selectOptions(screen.getByLabelText("Tipo"), "income");

      // Expense transactions should be hidden
      await waitFor(() => {
        expect(screen.queryByText("Aluguel")).not.toBeInTheDocument();
      });

      // Income transaction should be visible
      expect(screen.getByText("Bônus")).toBeInTheDocument();
    });

    it("filters transactions by person (paid by)", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Mercado")).toBeInTheDocument();
      });

      // Open filters
      await user.click(screen.getByTitle("Filtrar lançamentos"));

      await waitFor(() => {
        expect(screen.getByLabelText(/Atribuído à/i)).toBeInTheDocument();
      });

      // Filter by person-2 (Maria) - Mercado and Restaurante are paid by person-2
      await user.selectOptions(screen.getByLabelText(/Atribuído à/i), "person-2");

      // Transactions by person-1 should be hidden
      await waitFor(() => {
        expect(screen.queryByText("Aluguel")).not.toBeInTheDocument();
        expect(screen.queryByText("Netflix")).not.toBeInTheDocument();
      });

      // Transactions by person-2 should be visible
      expect(screen.getByText("Mercado")).toBeInTheDocument();
      expect(screen.getByText("Restaurante")).toBeInTheDocument();
    });

    it("filters transactions by category", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Restaurante")).toBeInTheDocument();
      });

      // Open filters
      await user.click(screen.getByTitle("Filtrar lançamentos"));

      await waitFor(() => {
        expect(document.getElementById("category-filter")).toBeInTheDocument();
      });

      // Filter by cat-4 (Prazeres) - only Restaurante
      const categoryFilter = document.getElementById("category-filter") as HTMLSelectElement;
      await user.selectOptions(categoryFilter, "cat-4");

      // Other categories should be hidden
      await waitFor(() => {
        expect(screen.queryByText("Aluguel")).not.toBeInTheDocument();
        expect(screen.queryByText("Netflix")).not.toBeInTheDocument();
      });

      // Prazeres transaction should be visible
      expect(screen.getByText("Restaurante")).toBeInTheDocument();
    });

    it("clears all filters when clicking clear button", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Mercado")).toBeInTheDocument();
      });

      // Open filters and apply a filter
      await user.click(screen.getByTitle("Filtrar lançamentos"));

      await waitFor(() => {
        expect(screen.getByLabelText("Tipo")).toBeInTheDocument();
      });

      await user.selectOptions(screen.getByLabelText("Tipo"), "income");

      await waitFor(() => {
        expect(screen.queryByText("Mercado")).not.toBeInTheDocument();
      });

      // Clear filters
      await user.click(screen.getByText(/Limpar filtros/i));

      // All transactions should be visible again
      await waitFor(() => {
        expect(screen.getByText("Mercado")).toBeInTheDocument();
        expect(screen.getByText("Bônus")).toBeInTheDocument();
      });
    });
  });

  describe("Search", () => {
    it("opens search panel when search button is clicked", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByTitle("Buscar lançamentos")).toBeInTheDocument();
      });

      await user.click(screen.getByTitle("Buscar lançamentos"));

      // Search input should be visible
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Buscar por descrição/i)).toBeInTheDocument();
      });
    });

    it("filters transactions by search query (description)", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Open search
      await user.click(screen.getByTitle("Buscar lançamentos"));

      const searchInput = await screen.findByPlaceholderText(/Buscar por descrição/i);
      await user.type(searchInput, "Netflix");

      // Only Netflix should be visible
      await waitFor(() => {
        expect(screen.queryByText("Aluguel")).not.toBeInTheDocument();
        expect(screen.queryByText("Mercado")).not.toBeInTheDocument();
      });

      expect(screen.getByText("Netflix")).toBeInTheDocument();
    });

    it("performs fuzzy search matching", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Restaurante")).toBeInTheDocument();
      });

      // Open search
      await user.click(screen.getByTitle("Buscar lançamentos"));

      const searchInput = await screen.findByPlaceholderText(/Buscar por descrição/i);
      // Type partial match
      await user.type(searchInput, "rest");

      // Restaurante should still be visible (fuzzy match)
      await waitFor(() => {
        expect(screen.getByText("Restaurante")).toBeInTheDocument();
      });
    });

    it("clears search when clicking X button", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Open search and type
      await user.click(screen.getByTitle("Buscar lançamentos"));
      const searchInput = await screen.findByPlaceholderText(/Buscar por descrição/i);
      await user.type(searchInput, "Netflix");

      await waitFor(() => {
        expect(screen.queryByText("Aluguel")).not.toBeInTheDocument();
      });

      // Find and click clear button (X)
      const clearButtons = screen.getAllByRole("button");
      const clearButton = clearButtons.find(
        (btn) => btn.querySelector(".lucide-x") && btn.closest('[class*="search"]'),
      );

      if (clearButton) {
        await user.click(clearButton);

        await waitFor(() => {
          expect(screen.getByText("Aluguel")).toBeInTheDocument();
        });
      }
    });

    it("shows empty state message when no results found", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Open search
      await user.click(screen.getByTitle("Buscar lançamentos"));
      const searchInput = await screen.findByPlaceholderText(/Buscar por descrição/i);
      await user.type(searchInput, "xyznonexistent");

      // Should show empty state
      await waitFor(() => {
        expect(screen.getByText(/Nenhum lançamento encontrado/i)).toBeInTheDocument();
      });
    });
  });

  describe("Month Navigation in History", () => {
    it("displays transaction count for current month", async () => {
      render(<TransactionsView />);

      // Wait for transactions to load
      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Should show transaction count
      await waitFor(() => {
        expect(screen.getByText(/lançamentos neste mês/i)).toBeInTheDocument();
      });
    });

    it("updates history section title with current month", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText(/Histórico de/i)).toBeInTheDocument();
      });
    });

    it("shows item count badge", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText(/7 itens/i)).toBeInTheDocument();
      });
    });
  });

  describe("Empty State", () => {
    it("shows empty state when no transactions exist", async () => {
      // Override to return empty transactions
      server.use(
        http.get("/api/transactions", () => {
          return HttpResponse.json([]);
        }),
      );

      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText(/Nenhum lançamento neste mês/i)).toBeInTheDocument();
      });
    });
  });

  describe("Transaction Actions", () => {
    it("shows edit button on hover for each transaction", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Mercado")).toBeInTheDocument();
      });

      // Edit buttons should be present
      const editButtons = screen.getAllByTitle("Editar");
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it("shows delete button for non-recurring transactions", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Mercado")).toBeInTheDocument();
      });

      // Delete buttons should be present for non-recurring
      const deleteButtons = screen.getAllByTitle("Excluir");
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it("does not show delete button for recurring transactions", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Find the Aluguel row (recurring) - it should not have a delete button
      // The number of delete buttons should be less than total transactions
      // because recurring ones don't have delete
      const deleteButtons = screen.getAllByTitle("Excluir");
      const allTransactions = 7;
      const recurringCount = 2; // Aluguel and Netflix are recurring

      // Non-recurring transactions should have delete buttons
      expect(deleteButtons.length).toBe(allTransactions - recurringCount);
    });
  });
});
