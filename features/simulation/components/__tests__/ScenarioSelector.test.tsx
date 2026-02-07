import { render, screen, userEvent } from "@/test/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ScenarioSelector } from "../ScenarioSelector";

const selectors = {
  heading: {
    getCenarioGastos: () => screen.getByRole("heading", { name: /Cenário de Gastos/i }),
    getMesAtual: () => screen.getByRole("heading", { name: "Mês Atual" }),
    getMinimalista: () => screen.getByRole("heading", { name: "Minimalista" }),
    getMediaUltimosMeses: () => screen.getByRole("heading", { name: "Média dos Últimos Meses" }),
    getPersonalizado: () => screen.getByRole("heading", { name: "Personalizado" }),
  },
  getMinimalistaText: () => screen.getByText(/Minimalista/i),
  getCustomValueInput: () =>
    screen.getByLabelText(/Valor mensal personalizado/i) ?? document.querySelector("#custom-expense-value"),
  getCustomExpenseValueInput: () => document.querySelector("#custom-expense-value") as HTMLInputElement,
};

describe("ScenarioSelector", () => {
  const defaultProps = {
    selectedScenario: "currentMonth" as const,
    onScenarioChange: vi.fn(),
    currentMonthTotal: 10000,
    minimalistTotal: 5000,
    realisticTotal: 7500,
    customValue: 0,
    onCustomValueChange: vi.fn(),
  };

  it("renders Cenário de Gastos with options", () => {
    render(<ScenarioSelector {...defaultProps} />);
    expect(selectors.heading.getCenarioGastos()).toBeInTheDocument();
    expect(selectors.heading.getMesAtual()).toBeInTheDocument();
    expect(selectors.heading.getMinimalista()).toBeInTheDocument();
    expect(selectors.heading.getMediaUltimosMeses()).toBeInTheDocument();
    expect(selectors.heading.getPersonalizado()).toBeInTheDocument();
  });

  it("clicking option selects it and calls onScenarioChange", async () => {
    const user = userEvent.setup();
    const onScenarioChange = vi.fn();
    render(
      <ScenarioSelector
        {...defaultProps}
        onScenarioChange={onScenarioChange}
      />,
    );
    await user.click(selectors.getMinimalistaText());
    expect(onScenarioChange).toHaveBeenCalledWith("minimalist");
  });

  it("when Personalizado selected shows CurrencyInput for custom value", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioSelector
        {...defaultProps}
        selectedScenario="custom"
        customValue={8000}
      />,
    );
    const customInput = selectors.getCustomValueInput();
    expect(customInput).toBeInTheDocument();
  });

  it("changing custom value calls onCustomValueChange", async () => {
    const user = userEvent.setup();
    const onCustomValueChange = vi.fn();
    render(
      <ScenarioSelector
        {...defaultProps}
        selectedScenario="custom"
        customValue={0}
        onCustomValueChange={onCustomValueChange}
      />,
    );
    const customInput = selectors.getCustomExpenseValueInput();
    if (customInput) {
      await user.clear(customInput);
      await user.type(customInput, "8000");
      expect(onCustomValueChange).toHaveBeenCalled();
    }
  });
});
