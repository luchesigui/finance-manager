import type { SimulationState } from "@/features/simulation/types";
import type { SavedSimulation } from "@/lib/types";
import { render, screen, userEvent } from "@/test/test-utils";
import { describe, expect, it, vi } from "vitest";
import { SavedSimulationsList } from "../SavedSimulationsList";

const mockSimulationState: SimulationState = {
  participants: [],
  scenario: "currentMonth",
  expenseOverrides: { ignoredExpenseIds: [], manualExpenses: [] },
};

const mockSimulations: SavedSimulation[] = [
  {
    id: "sim-1",
    name: "Cenário sem aluguel",
    state: mockSimulationState,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    householdId: "h1",
  },
  {
    id: "sim-2",
    name: "Minimalista",
    state: { ...mockSimulationState, scenario: "minimalist" },
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
    householdId: "h1",
  },
];

const selectors = {
  getSimulacoesSalvas: () => screen.getByText(/Simulações salvas/i),
  getCountBadge: () => screen.getByText("2"),
  getToggleButton: () =>
    screen.getByRole("button", { name: /Simulações salvas/i }) ??
    screen.getByText(/Simulações salvas/i).closest("button"),
  getToggleByText: () => screen.getByText(/Simulações salvas/i).closest("button"),
  getSimulationName: (name: string) => screen.getByText(name),
  getLoadButtons: () => screen.getAllByRole("button", { name: /Carregar/i }),
  getSalvarButton: () => screen.getByRole("button", { name: /Salvar/i }),
  getExcluirButton: (name: string) =>
    screen.getByLabelText(new RegExp(`Excluir simulação ${name}`, "i")),
  getCarregandoText: () => screen.getByText(/Carregando simulações salvas/i),
};

describe("SavedSimulationsList", () => {
  it("when simulations.length === 0 returns null", () => {
    const { container } = render(
      <SavedSimulationsList
        simulations={[]}
        onLoad={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        activeSimulationId={null}
        isLoading={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders Simulações salvas with count badge", () => {
    render(
      <SavedSimulationsList
        simulations={mockSimulations}
        onLoad={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        activeSimulationId={null}
        isLoading={false}
      />,
    );
    expect(selectors.getSimulacoesSalvas()).toBeInTheDocument();
    expect(selectors.getCountBadge()).toBeInTheDocument();
  });

  it("is collapsible with ChevronDown/ChevronRight", async () => {
    const user = userEvent.setup();
    render(
      <SavedSimulationsList
        simulations={mockSimulations}
        onLoad={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        activeSimulationId={null}
        isLoading={false}
      />,
    );
    const toggleButton = selectors.getToggleButton();
    expect(toggleButton).toBeInTheDocument();
    if (toggleButton) await user.click(toggleButton);
    expect(selectors.getSimulationName("Cenário sem aluguel")).toBeInTheDocument();
  });

  it("shows Carregar, Salvar (if active), Excluir for each simulation", async () => {
    const user = userEvent.setup();
    render(
      <SavedSimulationsList
        simulations={mockSimulations}
        onLoad={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        activeSimulationId="sim-1"
        isLoading={false}
      />,
    );
    const toggleButton = selectors.getToggleByText();
    if (toggleButton) await user.click(toggleButton);
    expect(selectors.getLoadButtons().length).toBe(2);
    expect(selectors.getSalvarButton()).toBeInTheDocument();
    expect(selectors.getExcluirButton("Cenário sem aluguel")).toBeInTheDocument();
  });

  it("clicking Carregar calls onLoad with simulation", async () => {
    const user = userEvent.setup();
    const onLoad = vi.fn();
    render(
      <SavedSimulationsList
        simulations={mockSimulations}
        onLoad={onLoad}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        activeSimulationId={null}
        isLoading={false}
      />,
    );
    const toggleButton = selectors.getToggleByText();
    if (toggleButton) await user.click(toggleButton);
    const loadButtons = selectors.getLoadButtons();
    await user.click(loadButtons[0]);
    expect(onLoad).toHaveBeenCalledWith(mockSimulations[0]);
  });

  it("clicking Salvar calls onUpdate with id", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(
      <SavedSimulationsList
        simulations={mockSimulations}
        onLoad={vi.fn()}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
        activeSimulationId="sim-1"
        isLoading={false}
      />,
    );
    const toggleButton = selectors.getToggleByText();
    if (toggleButton) await user.click(toggleButton);
    await user.click(selectors.getSalvarButton());
    expect(onUpdate).toHaveBeenCalledWith("sim-1");
  });

  it("clicking Excluir calls onDelete with id", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <SavedSimulationsList
        simulations={mockSimulations}
        onLoad={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={onDelete}
        activeSimulationId={null}
        isLoading={false}
      />,
    );
    const toggleButton = selectors.getToggleByText();
    if (toggleButton) await user.click(toggleButton);
    await user.click(selectors.getExcluirButton("Cenário sem aluguel"));
    expect(onDelete).toHaveBeenCalledWith("sim-1");
  });

  it("shows loading state when isLoading", () => {
    render(
      <SavedSimulationsList
        simulations={[]}
        onLoad={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        activeSimulationId={null}
        isLoading={true}
      />,
    );
    expect(selectors.getCarregandoText()).toBeInTheDocument();
  });

  it.todo(
    "ao falhar save/update/delete: exibir toast ou mensagem de erro e não alterar lista até sucesso",
  );
});
