import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TransactionsView } from "@/components/finance/TransactionsView";
import { server } from "../setup/mocks/server";
import {
  mockCategories,
  mockPeople,
  render,
  screen,
  waitFor,
} from "../setup/test-utils";
import userEvent from "@testing-library/user-event";

describe("TransactionForm", () => {
  beforeEach(() => {
    // Reset to default handlers before each test
    server.resetHandlers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Form Display", () => {
    it("renders the transaction form with all required fields", async () => {
      render(<TransactionsView />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText(/Nova Despesa Manual/i)).toBeInTheDocument();
      });

      // Check for transaction type buttons
      expect(screen.getByRole("button", { name: /Despesa/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Renda/i })).toBeInTheDocument();

      // Check for description input
      expect(screen.getByPlaceholderText(/Ex: Luz, Mercado, iFood/i)).toBeInTheDocument();

      // Check for amount input
      expect(screen.getByPlaceholderText(/R\$ 0,00/i)).toBeInTheDocument();

      // Check for submit button
      expect(screen.getByRole("button", { name: /Adicionar Lançamento/i })).toBeInTheDocument();
    });

    it("shows income-specific fields when income type is selected", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Renda/i })).toBeInTheDocument();
      });

      // Click on "Renda" button
      await user.click(screen.getByRole("button", { name: /Renda/i }));

      // Should show income-specific UI
      await waitFor(() => {
        expect(screen.getByText(/Novo Lançamento de Renda/i)).toBeInTheDocument();
      });

      // Should show increment/decrement options
      expect(screen.getByRole("button", { name: /Incremento/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Decremento/i })).toBeInTheDocument();
    });

    it("shows installment checkbox for expense transactions", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        // The parcelado checkbox should be visible for expense type
        expect(screen.getByLabelText(/Parcelado\?/i)).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("submits a new expense transaction with correct data", async () => {
      const user = userEvent.setup();
      let capturedRequest: Record<string, unknown>[] | null = null;

      // Override handler to capture the request
      server.use(
        http.post("/api/transactions", async ({ request }) => {
          capturedRequest = (await request.json()) as Record<string, unknown>[];
          return HttpResponse.json([
            {
              id: 999,
              ...capturedRequest[0],
              createdAt: new Date().toISOString(),
            },
          ]);
        }),
      );

      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Ex: Luz, Mercado, iFood/i)).toBeInTheDocument();
      });

      // Fill in description
      const descriptionInput = screen.getByPlaceholderText(/Ex: Luz, Mercado, iFood/i);
      await user.type(descriptionInput, "Supermercado");

      // Fill in amount (currency input)
      const amountInput = screen.getByPlaceholderText(/R\$ 0,00/i);
      await user.type(amountInput, "15000"); // 150.00

      // Submit the form
      await user.click(screen.getByRole("button", { name: /Adicionar Lançamento/i }));

      // Verify the API was called with correct data
      await waitFor(() => {
        expect(capturedRequest).not.toBeNull();
      });

      expect(capturedRequest?.[0]).toMatchObject({
        description: "Supermercado",
        amount: 150,
        type: "expense",
        isRecurring: false,
        isCreditCard: false,
        excludeFromSplit: false,
        isForecast: false,
      });
    });

    it("submits income transaction with increment flag", async () => {
      const user = userEvent.setup();
      let capturedRequest: Record<string, unknown>[] | null = null;

      server.use(
        http.post("/api/transactions", async ({ request }) => {
          capturedRequest = (await request.json()) as Record<string, unknown>[];
          return HttpResponse.json([
            {
              id: 999,
              ...capturedRequest[0],
              createdAt: new Date().toISOString(),
            },
          ]);
        }),
      );

      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Renda/i })).toBeInTheDocument();
      });

      // Switch to income type
      await user.click(screen.getByRole("button", { name: /Renda/i }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Ex: Salário, Freelance, Bônus/i)).toBeInTheDocument();
      });

      // Fill in description
      await user.type(
        screen.getByPlaceholderText(/Ex: Salário, Freelance, Bônus/i),
        "Bônus anual",
      );

      // Fill in amount
      await user.type(screen.getByPlaceholderText(/R\$ 0,00/i), "500000"); // 5000.00

      // Submit
      await user.click(screen.getByRole("button", { name: /Adicionar Renda/i }));

      await waitFor(() => {
        expect(capturedRequest).not.toBeNull();
      });

      expect(capturedRequest?.[0]).toMatchObject({
        description: "Bônus anual",
        amount: 5000,
        type: "income",
        isIncrement: true,
        categoryId: null, // Income has no category
      });
    });

    it("submits income decrement transaction", async () => {
      const user = userEvent.setup();
      let capturedRequest: Record<string, unknown>[] | null = null;

      server.use(
        http.post("/api/transactions", async ({ request }) => {
          capturedRequest = (await request.json()) as Record<string, unknown>[];
          return HttpResponse.json([
            {
              id: 999,
              ...capturedRequest[0],
              createdAt: new Date().toISOString(),
            },
          ]);
        }),
      );

      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Renda/i })).toBeInTheDocument();
      });

      // Switch to income type
      await user.click(screen.getByRole("button", { name: /Renda/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Decremento/i })).toBeInTheDocument();
      });

      // Select decrement
      await user.click(screen.getByRole("button", { name: /Decremento/i }));

      // Fill in description
      await user.type(
        screen.getByPlaceholderText(/Ex: Salário, Freelance, Bônus/i),
        "Estorno",
      );

      // Fill in amount
      await user.type(screen.getByPlaceholderText(/R\$ 0,00/i), "10000"); // 100.00

      // Submit
      await user.click(screen.getByRole("button", { name: /Adicionar Dedução de Renda/i }));

      await waitFor(() => {
        expect(capturedRequest).not.toBeNull();
      });

      expect(capturedRequest?.[0]).toMatchObject({
        description: "Estorno",
        amount: 100,
        type: "income",
        isIncrement: false,
      });
    });

    it("submits expense with credit card flag", async () => {
      const user = userEvent.setup();
      let capturedRequest: Record<string, unknown>[] | null = null;

      server.use(
        http.post("/api/transactions", async ({ request }) => {
          capturedRequest = (await request.json()) as Record<string, unknown>[];
          return HttpResponse.json([
            {
              id: 999,
              ...capturedRequest[0],
              createdAt: new Date().toISOString(),
            },
          ]);
        }),
      );

      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Cartão de Crédito/i)).toBeInTheDocument();
      });

      // Fill in required fields
      await user.type(
        screen.getByPlaceholderText(/Ex: Luz, Mercado, iFood/i),
        "Compra online",
      );
      await user.type(screen.getByPlaceholderText(/R\$ 0,00/i), "20000");

      // Check credit card
      await user.click(screen.getByLabelText(/Cartão de Crédito/i));

      // Submit
      await user.click(screen.getByRole("button", { name: /Adicionar Lançamento/i }));

      await waitFor(() => {
        expect(capturedRequest).not.toBeNull();
      });

      expect(capturedRequest?.[0]).toMatchObject({
        description: "Compra online",
        amount: 200,
        isCreditCard: true,
      });
    });

    it("submits expense marked as recurring", async () => {
      const user = userEvent.setup();
      let capturedRequest: Record<string, unknown>[] | null = null;

      server.use(
        http.post("/api/transactions", async ({ request }) => {
          capturedRequest = (await request.json()) as Record<string, unknown>[];
          return HttpResponse.json([
            {
              id: 999,
              ...capturedRequest[0],
              createdAt: new Date().toISOString(),
            },
          ]);
        }),
      );

      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Recorrente\?/i)).toBeInTheDocument();
      });

      // Fill in required fields
      await user.type(screen.getByPlaceholderText(/Ex: Luz, Mercado, iFood/i), "Spotify");
      await user.type(screen.getByPlaceholderText(/R\$ 0,00/i), "2190");

      // Check recurring
      await user.click(screen.getByLabelText(/Recorrente\?/i));

      // Submit
      await user.click(screen.getByRole("button", { name: /Adicionar Lançamento/i }));

      await waitFor(() => {
        expect(capturedRequest).not.toBeNull();
      });

      expect(capturedRequest?.[0]).toMatchObject({
        description: "Spotify",
        amount: 21.9,
        isRecurring: true,
      });
    });

    it("clears form after successful submission", async () => {
      const user = userEvent.setup();

      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Ex: Luz, Mercado, iFood/i)).toBeInTheDocument();
      });

      const descriptionInput = screen.getByPlaceholderText(
        /Ex: Luz, Mercado, iFood/i,
      ) as HTMLInputElement;
      const amountInput = screen.getByPlaceholderText(/R\$ 0,00/i) as HTMLInputElement;

      // Fill in form
      await user.type(descriptionInput, "Test transaction");
      await user.type(amountInput, "10000");

      // Submit
      await user.click(screen.getByRole("button", { name: /Adicionar Lançamento/i }));

      // Wait for form to clear
      await waitFor(() => {
        expect(descriptionInput.value).toBe("");
      });
    });
  });

  describe("Transaction List", () => {
    it("displays existing transactions", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
        expect(screen.getByText("Mercado")).toBeInTheDocument();
      });
    });

    it("shows recurring badge for recurring transactions", async () => {
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Aluguel is recurring, should have the badge
      const recurringBadges = screen.getAllByText("Recorrente");
      expect(recurringBadges.length).toBeGreaterThan(0);
    });

    it("filters transactions by search query", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
        expect(screen.getByText("Mercado")).toBeInTheDocument();
      });

      // Open search
      const searchButton = screen.getByTitle("Buscar lançamentos");
      await user.click(searchButton);

      // Type search query
      const searchInput = screen.getByPlaceholderText(/Buscar por descrição/i);
      await user.type(searchInput, "Aluguel");

      // Should only show Aluguel
      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
        expect(screen.queryByText("Mercado")).not.toBeInTheDocument();
      });
    });
  });

  describe("Delete Transaction", () => {
    it("deletes a transaction when delete button is clicked", async () => {
      const user = userEvent.setup();
      let deletedId: string | null = null;

      server.use(
        http.delete("/api/transactions/:id", ({ params }) => {
          deletedId = params.id as string;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Mercado")).toBeInTheDocument();
      });

      // Find and click delete button for any non-recurring transaction
      const deleteButtons = screen.getAllByTitle("Excluir");
      expect(deleteButtons.length).toBeGreaterThan(0);
      
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        // Should have called delete endpoint with some ID
        expect(deletedId).not.toBeNull();
      });
    });
  });
});
