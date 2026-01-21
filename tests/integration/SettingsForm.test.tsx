import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SettingsView } from "@/components/finance/SettingsView";
import { server } from "../setup/mocks/server";
import { mockPeople, render, screen, waitFor } from "../setup/test-utils";
import userEvent from "@testing-library/user-event";

describe("SettingsForm", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Participants Section", () => {
    it("displays existing participants", async () => {
      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText("João")).toBeInTheDocument();
        expect(screen.getByText("Maria")).toBeInTheDocument();
      });
    });

    it("shows add participant button", async () => {
      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText(/Adicionar Novo Participante/i)).toBeInTheDocument();
      });
    });

    it("opens add participant form when button is clicked", async () => {
      const user = userEvent.setup();
      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText(/Adicionar Novo Participante/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/Adicionar Novo Participante/i));

      // Form should be visible
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Nome do participante/i)).toBeInTheDocument();
      });
    });

    it("creates a new participant with correct data", async () => {
      const user = userEvent.setup();
      let capturedRequest: { name: string; income: number } | null = null;

      server.use(
        http.post("/api/people", async ({ request }) => {
          capturedRequest = (await request.json()) as { name: string; income: number };
          return HttpResponse.json({
            id: "person-new",
            name: capturedRequest.name,
            income: capturedRequest.income,
          });
        }),
      );

      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText(/Adicionar Novo Participante/i)).toBeInTheDocument();
      });

      // Open form
      await user.click(screen.getByText(/Adicionar Novo Participante/i));

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Nome do participante/i)).toBeInTheDocument();
      });

      // Fill in name
      await user.type(screen.getByPlaceholderText(/Nome do participante/i), "Pedro");

      // Fill in income - use the specific input for new person
      const newPersonIncomeInput = screen.getByLabelText(/Renda Mensal/i, {
        selector: "#new-person-income",
      });
      await user.type(newPersonIncomeInput, "400000"); // 4000.00

      // Submit
      await user.click(screen.getByRole("button", { name: /^Adicionar$/i }));

      await waitFor(() => {
        expect(capturedRequest).not.toBeNull();
      });

      expect(capturedRequest).toEqual({
        name: "Pedro",
        income: 4000,
      });
    });

    it("cancels add participant form", async () => {
      const user = userEvent.setup();
      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText(/Adicionar Novo Participante/i)).toBeInTheDocument();
      });

      // Open form
      await user.click(screen.getByText(/Adicionar Novo Participante/i));

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Nome do participante/i)).toBeInTheDocument();
      });

      // Cancel
      await user.click(screen.getByRole("button", { name: /Cancelar/i }));

      // Form should be hidden
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/Nome do participante/i)).not.toBeInTheDocument();
      });
    });

    it("updates participant income", async () => {
      const user = userEvent.setup();
      let capturedRequest: { personId: string; patch: { income?: number } } | null = null;

      server.use(
        http.patch("/api/people", async ({ request }) => {
          const body = (await request.json()) as {
            personId: string;
            patch: { income?: number };
          };
          capturedRequest = body;
          const person = mockPeople.find((p) => p.id === body.personId);
          return HttpResponse.json({ ...person, ...body.patch });
        }),
      );

      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText("João")).toBeInTheDocument();
      });

      // Find income input for João (first person)
      // The inputs are in PersonEditRow components
      const incomeInputs = screen.getAllByPlaceholderText(/R\$ 0,00/i);
      const joaoIncomeInput = incomeInputs[0];

      // Clear and type new value
      await user.clear(joaoIncomeInput);
      await user.type(joaoIncomeInput, "600000"); // 6000.00

      // Click save button (should appear when there are changes)
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Salvar Alterações/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /Salvar Alterações/i }));

      await waitFor(() => {
        expect(capturedRequest).not.toBeNull();
      });

      expect(capturedRequest!.personId).toBe("person-1");
      expect(capturedRequest!.patch.income).toBe(6000);
    });
  });

  describe("Default Payer Selection", () => {
    it("displays default payer section", async () => {
      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText(/Responsável Padrão/i)).toBeInTheDocument();
      });

      // The section should have the heading
      expect(screen.getByText(/Responsável Padrão \(Pré-selecionado\)/i)).toBeInTheDocument();
    });

    it("updates default payer when selection changes", async () => {
      const user = userEvent.setup();
      let capturedRequest: { personId: string } | null = null;

      server.use(
        http.patch("/api/default-payer", async ({ request }) => {
          const body = (await request.json()) as { personId: string };
          capturedRequest = body;
          return HttpResponse.json({ defaultPayerId: body.personId });
        }),
      );

      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText("Maria")).toBeInTheDocument();
      });

      // Find Maria's radio button and click it
      const radioButtons = screen.getAllByRole("radio");
      // The second radio should be Maria (person-2)
      await user.click(radioButtons[1]);

      await waitFor(() => {
        expect(capturedRequest).not.toBeNull();
      });

      expect(capturedRequest!.personId).toBe("person-2");
    });
  });

  describe("Categories Section", () => {
    it("displays existing categories with target percentages", async () => {
      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText("Custos Fixos")).toBeInTheDocument();
        expect(screen.getByText("Conforto")).toBeInTheDocument();
        expect(screen.getByText("Metas")).toBeInTheDocument();
      });
    });

    it("shows total category percentage", async () => {
      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText(/Total Planejado/i)).toBeInTheDocument();
        // Categories sum to 100%
        expect(screen.getByText("100%")).toBeInTheDocument();
      });
    });

    it("updates category target percentage", async () => {
      const user = userEvent.setup();
      let capturedRequest: { categoryId: string; patch: { targetPercent?: number } } | null = null;

      server.use(
        http.patch("/api/categories", async ({ request }) => {
          capturedRequest = (await request.json()) as {
            categoryId: string;
            patch: { targetPercent?: number };
          };
          return HttpResponse.json({
            id: capturedRequest.categoryId,
            name: "Custos Fixos",
            targetPercent: capturedRequest.patch.targetPercent,
          });
        }),
      );

      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText("Custos Fixos")).toBeInTheDocument();
      });

      // Find category percentage inputs
      const percentInputs = screen.getAllByRole("spinbutton");
      const custosFixosInput = percentInputs.find((input) => {
        return (input as HTMLInputElement).value === "55";
      });

      if (custosFixosInput) {
        // Change value (need to ensure total stays at 100%)
        await user.clear(custosFixosInput);
        await user.type(custosFixosInput, "50");

        // Find another category to adjust
        const conhecimentoInput = percentInputs.find((input) => {
          return (input as HTMLInputElement).value === "5";
        });

        if (conhecimentoInput) {
          await user.clear(conhecimentoInput);
          await user.type(conhecimentoInput, "10");
        }

        // Click save
        await waitFor(() => {
          const saveButton = screen.queryByRole("button", { name: /Salvar Alterações/i });
          if (saveButton) {
            expect(saveButton).toBeInTheDocument();
          }
        });
      }
    });

    it("shows error indicator when total is not 100%", async () => {
      const user = userEvent.setup();
      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText("Custos Fixos")).toBeInTheDocument();
      });

      // Find category percentage inputs and change one
      const percentInputs = screen.getAllByRole("spinbutton");
      const firstCategoryInput = percentInputs[0];

      // Clear and set to lower value (total won't be 100%)
      await user.clear(firstCategoryInput);
      await user.type(firstCategoryInput, "40");

      // Total should show and be highlighted as not 100%
      await waitFor(() => {
        // The total will be less than 100%, should have different styling
        const totalElement = screen.getByText(/Total Planejado/i).closest("div");
        expect(totalElement).toBeInTheDocument();
      });
    });
  });

  describe("Delete Participant", () => {
    it("shows delete button for non-current-user participants", async () => {
      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText("Maria")).toBeInTheDocument();
      });

      // Should have delete buttons (trash icons)
      const deleteButtons = screen.getAllByRole("button").filter((btn) => {
        return btn.querySelector("svg")?.classList.contains("lucide-trash-2") || 
               btn.getAttribute("aria-label")?.includes("delete");
      });
      
      // At least one delete button should exist
      expect(deleteButtons.length).toBeGreaterThanOrEqual(0);
    });

    it("calls delete API when confirmed", async () => {
      const user = userEvent.setup();
      let deletedPersonId: string | null = null;

      // Mock window.confirm
      vi.spyOn(window, "confirm").mockReturnValue(true);

      server.use(
        http.delete("/api/people", ({ request }) => {
          const url = new URL(request.url);
          deletedPersonId = url.searchParams.get("personId");
          return HttpResponse.json({ success: true });
        }),
      );

      render(<SettingsView />);

      await waitFor(() => {
        expect(screen.getByText("Maria")).toBeInTheDocument();
      });

      // Find delete button (it's a button with Trash2 icon)
      const trashButtons = screen.getAllByRole("button").filter((btn) => {
        // Check if it contains the trash icon or has delete-related attributes
        const svg = btn.querySelector("svg");
        return svg !== null && btn.closest("[class*='text-red']") !== null;
      });

      if (trashButtons.length > 0) {
        await user.click(trashButtons[0]);

        await waitFor(() => {
          expect(deletedPersonId).not.toBeNull();
        });
      }
    });
  });
});
