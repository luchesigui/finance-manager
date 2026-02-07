import { render, screen } from "@/test/test-utils";
import { describe, expect, it } from "vitest";
import { QuickStatsGrid } from "../QuickStatsGrid";
import type { HealthScoreFactors } from "../hooks/useHealthScore";

function makeFactors(overrides: Partial<HealthScoreFactors>): HealthScoreFactors {
  return {
    liberdadeFinanceira: {
      score: 80,
      actual: 3000,
      target: 5000,
      percentAchieved: 60,
    },
    categoriesOnBudget: { score: 100, onBudget: 5, total: 5 },
    outliers: { score: 100, count: 0 },
    settlement: { score: 100, balanced: true },
    freeBalance: { score: 80, value: 500 },
    ...overrides,
  };
}

const selectors = {
  getLiberdadeFinanceira: () => screen.getByText("Liberdade Financeira"),
  getAmount: (text: string) => screen.getByText(text),
  getProgressBar50: () => document.querySelector('[style*="width: 50%"]'),
  getMetaAtingida: () => screen.getByText("Meta Atingida"),
  getFaltamRS: () => screen.getByText(/Faltam R\$/),
  getAmount3000: () => screen.getByText(/R\$ 3\.000,00/),
  getGastosDoMes: () => screen.getByText("Gastos do Mês"),
  getAllAmount7000: () => screen.getAllByText("R$ 7.000,00"),
  getDentroOrcamento: () => screen.getByText("Dentro do orçamento"),
  getAcimaOrcamento: () => screen.getByText("Acima do orçamento"),
};

describe("QuickStatsGrid", () => {
  it("Liberdade Financeira card shows value from factors.liberdadeFinanceira.actual", () => {
    const factors = makeFactors({
      liberdadeFinanceira: {
        score: 100,
        actual: 5000,
        target: 5000,
        percentAchieved: 100,
      },
    });
    render(<QuickStatsGrid factors={factors} totalExpenses={8000} effectiveIncome={15000} />);
    expect(selectors.getLiberdadeFinanceira()).toBeInTheDocument();
    expect(selectors.getAmount("R$ 5.000,00")).toBeInTheDocument();
  });

  it("progress bar width matches percentAchieved (capped at 100%)", () => {
    const factors = makeFactors({
      liberdadeFinanceira: {
        score: 80,
        actual: 2500,
        target: 5000,
        percentAchieved: 50,
      },
    });
    render(<QuickStatsGrid factors={factors} totalExpenses={6000} effectiveIncome={12000} />);
    const bar = selectors.getProgressBar50();
    expect(bar).toBeInTheDocument();
  });

  it('exibe "Meta Atingida" quando percentAchieved >= 100', () => {
    const factors = makeFactors({
      liberdadeFinanceira: {
        score: 100,
        actual: 5000,
        target: 5000,
        percentAchieved: 100,
      },
    });
    render(<QuickStatsGrid factors={factors} totalExpenses={5000} effectiveIncome={15000} />);
    expect(selectors.getMetaAtingida()).toBeInTheDocument();
  });

  it('exibe "Faltam R$ X" quando percentAchieved < 100', () => {
    const factors = makeFactors({
      liberdadeFinanceira: {
        score: 60,
        actual: 2000,
        target: 5000,
        percentAchieved: 40,
      },
    });
    render(<QuickStatsGrid factors={factors} totalExpenses={7000} effectiveIncome={12000} />);
    expect(selectors.getFaltamRS()).toBeInTheDocument();
    expect(selectors.getAmount3000()).toBeInTheDocument();
  });

  it("Gastos do Mês card displays totalExpenses and budget status", () => {
    render(
      <QuickStatsGrid factors={makeFactors({})} totalExpenses={7000} effectiveIncome={15000} />,
    );
    expect(selectors.getGastosDoMes()).toBeInTheDocument();
    expect(selectors.getAllAmount7000().length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Dentro do orçamento" when budget usage <= 100%', () => {
    render(
      <QuickStatsGrid
        factors={makeFactors({
          liberdadeFinanceira: { score: 100, actual: 5000, target: 5000, percentAchieved: 100 },
        })}
        totalExpenses={5000}
        effectiveIncome={15000}
      />,
    );
    expect(selectors.getDentroOrcamento()).toBeInTheDocument();
  });

  it('shows "Acima do orçamento" when budget usage > 100%', () => {
    render(
      <QuickStatsGrid
        factors={makeFactors({
          liberdadeFinanceira: { score: 0, actual: 0, target: 5000, percentAchieved: 0 },
        })}
        totalExpenses={12000}
        effectiveIncome={10000}
      />,
    );
    expect(selectors.getAcimaOrcamento()).toBeInTheDocument();
  });
});
