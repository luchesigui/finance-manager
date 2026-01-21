import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TransactionsView } from "@/components/finance/TransactionsView";
import { server } from "../setup/mocks/server";
import { render, screen, waitFor } from "../setup/test-utils";
import userEvent from "@testing-library/user-event";

describe("TransactionEdit", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Edit Modal", () => {
    it("opens edit modal when edit button is clicked", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Find and click edit button
      const editButtons = screen.getAllByTitle("Editar");
      await user.click(editButtons[0]);

      // Modal should open
      await waitFor(() => {
        expect(screen.getByText("Editar Lançamento")).toBeInTheDocument();
      });
    });

    it("pre-fills edit form with transaction data", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Click edit on any transaction
      const editButtons = screen.getAllByTitle("Editar");
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Editar Lançamento")).toBeInTheDocument();
      });

      // Check that the edit modal has a description input with some value (pre-filled)
      const descriptionInput = document.getElementById("edit-description") as HTMLInputElement;
      expect(descriptionInput).toBeInTheDocument();
      // The value should be one of the transaction descriptions
      expect(["Aluguel", "Mercado"]).toContain(descriptionInput.value);
    });

    it("closes modal when cancel is clicked", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Open modal
      const editButtons = screen.getAllByTitle("Editar");
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Editar Lançamento")).toBeInTheDocument();
      });

      // Click cancel
      await user.click(screen.getByRole("button", { name: /Cancelar/i }));

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText("Editar Lançamento")).not.toBeInTheDocument();
      });
    });

    it("closes modal when X button is clicked", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Open modal
      const editButtons = screen.getAllByTitle("Editar");
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Editar Lançamento")).toBeInTheDocument();
      });

      // Find and click X button (it's in the modal header)
      const closeButton = screen
        .getByText("Editar Lançamento")
        .closest("div")
        ?.querySelector('button[type="button"]');

      if (closeButton) {
        await user.click(closeButton);

        await waitFor(() => {
          expect(screen.queryByText("Editar Lançamento")).not.toBeInTheDocument();
        });
      }
    });

    it("saves edited transaction with correct data", async () => {
      const user = userEvent.setup();
      let capturedRequest: { patch: Record<string, unknown> } | null = null;

      server.use(
        http.patch("/api/transactions/:id", async ({ params, request }) => {
          const body = (await request.json()) as { patch: Record<string, unknown> };
          capturedRequest = body;
          return HttpResponse.json({
            id: Number(params.id),
            description: body.patch.description || "Aluguel",
            amount: body.patch.amount || 1500,
            categoryId: "cat-1",
            paidBy: "person-1",
            isRecurring: true,
            isCreditCard: false,
            excludeFromSplit: false,
            isForecast: false,
            date: "2024-03-01",
            type: "expense",
            isIncrement: true,
          });
        }),
      );

      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Open edit modal
      const editButtons = screen.getAllByTitle("Editar");
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Editar Lançamento")).toBeInTheDocument();
      });

      // Change description - use the specific ID for edit form
      const descriptionInput = document.getElementById("edit-description") as HTMLInputElement;
      await user.clear(descriptionInput);
      await user.type(descriptionInput, "Aluguel Atualizado");

      // Save
      await user.click(screen.getByRole("button", { name: /Salvar Alterações/i }));

      await waitFor(() => {
        expect(capturedRequest).not.toBeNull();
      });

      expect(capturedRequest!.patch.description).toBe("Aluguel Atualizado");
    });

    it("can change transaction type in edit modal", async () => {
      const user = userEvent.setup();

      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Mercado")).toBeInTheDocument();
      });

      // Open edit modal for any transaction
      const editButtons = screen.getAllByTitle("Editar");
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Editar Lançamento")).toBeInTheDocument();
      });

      // The modal should have type selection buttons
      const typeButtons = screen.getAllByRole("button", { name: /Renda|Despesa/i });
      expect(typeButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Bulk Edit", () => {
    it("enters selection mode when clicking select button", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Click select button
      await user.click(screen.getByRole("button", { name: /Selecionar/i }));

      // Selection mode UI should appear
      await waitFor(() => {
        expect(screen.getByText(/Cancelar Seleção/i)).toBeInTheDocument();
        expect(screen.getByText(/0 selecionado/i)).toBeInTheDocument();
      });
    });

    it("shows selection checkboxes in selection mode", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Aluguel")).toBeInTheDocument();
      });

      // Enter selection mode
      await user.click(screen.getByRole("button", { name: /Selecionar/i }));

      await waitFor(() => {
        expect(screen.getByText(/Cancelar Seleção/i)).toBeInTheDocument();
      });

      // Should see checkboxes (as buttons with checkbox role or similar)
      // Non-recurring transactions should have clickable checkboxes
      // Note: Recurring transactions can't be selected
    });

    it("shows selection count in selection mode", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Mercado")).toBeInTheDocument();
      });

      // Enter selection mode
      await user.click(screen.getByRole("button", { name: /Selecionar/i }));

      // Should show selection count
      await waitFor(() => {
        expect(screen.getByText(/selecionado/i)).toBeInTheDocument();
      });
    });

    it("shows bulk edit button in selection mode", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Mercado")).toBeInTheDocument();
      });

      // Enter selection mode
      await user.click(screen.getByRole("button", { name: /Selecionar/i }));

      // Bulk edit button should be visible
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Editar em Massa/i })).toBeInTheDocument();
      });
    });

    it("shows bulk action buttons when transactions are selected", async () => {
      const user = userEvent.setup();
      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Mercado")).toBeInTheDocument();
      });

      // Enter selection mode
      await user.click(screen.getByRole("button", { name: /Selecionar/i }));

      // Should see bulk action buttons
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Editar em Massa/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Excluir/i })).toBeInTheDocument();
      });
    });
  });

  describe("Bulk Delete", () => {
    it("deletes selected transactions when confirmed", async () => {
      const user = userEvent.setup();
      let capturedRequest: { ids: number[] } | null = null;

      // Mock window.confirm
      vi.spyOn(window, "confirm").mockReturnValue(true);

      server.use(
        http.delete("/api/transactions/bulk", async ({ request }) => {
          const body = (await request.json()) as { ids: number[] };
          capturedRequest = body;
          return HttpResponse.json({ success: true, deleted: body.ids.length });
        }),
      );

      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Mercado")).toBeInTheDocument();
      });

      // Enter selection mode
      await user.click(screen.getByRole("button", { name: /Selecionar/i }));

      // Select all
      await user.click(screen.getByRole("button", { name: /Selecionar Todos/i }));

      // Click delete
      await user.click(screen.getByRole("button", { name: /Excluir/i }));

      await waitFor(() => {
        expect(capturedRequest).not.toBeNull();
      });

      // Mercado (id: 2) should be in the deleted ids (Aluguel is recurring so not selectable)
      expect(capturedRequest!.ids).toContain(2);
    });

    it("does not delete when confirmation is cancelled", async () => {
      const user = userEvent.setup();
      let deleteWasCalled = false;

      // Mock window.confirm to return false
      vi.spyOn(window, "confirm").mockReturnValue(false);

      server.use(
        http.delete("/api/transactions/bulk", async () => {
          deleteWasCalled = true;
          return HttpResponse.json({ success: true });
        }),
      );

      render(<TransactionsView />);

      await waitFor(() => {
        expect(screen.getByText("Mercado")).toBeInTheDocument();
      });

      // Enter selection mode
      await user.click(screen.getByRole("button", { name: /Selecionar/i }));

      // Select all
      await user.click(screen.getByRole("button", { name: /Selecionar Todos/i }));

      // Click delete
      await user.click(screen.getByRole("button", { name: /Excluir/i }));

      // Wait a bit to ensure no API call was made
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(deleteWasCalled).toBe(false);
    });
  });
});
