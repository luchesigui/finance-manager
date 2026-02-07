import { render, screen } from "@/test/test-utils";
import { describe, expect, it } from "vitest";
import { HealthScore } from "../HealthScore";
import type { HealthScoreFactors, HealthScoreResult } from "../hooks/useHealthScore";

function makeHealthScore(overrides: Partial<HealthScoreResult>): HealthScoreResult {
  const defaultFactors: HealthScoreFactors = {
    liberdadeFinanceira: { score: 100, actual: 5000, target: 5000, percentAchieved: 100 },
    categoriesOnBudget: { score: 100, onBudget: 5, total: 5 },
    outliers: { score: 100, count: 0 },
    settlement: { score: 100, balanced: true },
    freeBalance: { score: 100, value: 1000 },
  };
  return {
    score: 85,
    status: "healthy",
    factors: defaultFactors,
    summary: "Tudo dentro do esperado.",
    ...overrides,
  };
}

const selectors = {
  getScore: (score: string) => screen.getByText(score),
  getSlash100: () => screen.getByText("/100"),
  getSaudavel: () => screen.getByText("SAUDÁVEL"),
  getHeadingSaude: () => screen.getByRole("heading", { name: /saúde financeira/i }),
  getAtencao: () => screen.getByText("ATENÇÃO"),
  getCritico: () => screen.getByText("CRÍTICO"),
  getSummary: (text: string) => screen.getByText(text),
  querySaudavel: () => screen.queryByText("SAUDÁVEL"),
  querySlash100: () => screen.queryByText("/100"),
  getLoadingSkeleton: () => document.querySelector(".animate-pulse"),
  getProgressBar65: () => document.querySelector('[style*="width: 65%"]'),
};

describe("HealthScore", () => {
  it("displays correct score (0-100) according to provided data", () => {
    render(<HealthScore healthScore={makeHealthScore({ score: 72 })} />);
    expect(selectors.getScore("72")).toBeInTheDocument();
    expect(selectors.getSlash100()).toBeInTheDocument();
  });

  it("status name SAUDÁVEL and icon match when status is healthy", () => {
    render(<HealthScore healthScore={makeHealthScore({ status: "healthy" })} />);
    expect(selectors.getSaudavel()).toBeInTheDocument();
    expect(selectors.getHeadingSaude()).toBeInTheDocument();
  });

  it("status name ATENÇÃO matches when status is warning", () => {
    render(<HealthScore healthScore={makeHealthScore({ status: "warning" })} />);
    expect(selectors.getAtencao()).toBeInTheDocument();
  });

  it("status name CRÍTICO matches when status is critical", () => {
    render(<HealthScore healthScore={makeHealthScore({ status: "critical" })} />);
    expect(selectors.getCritico()).toBeInTheDocument();
  });

  it("displays the reason for the score when summary is present", () => {
    const summary = "Gastos acima do orçamento em 2 categorias.";
    render(<HealthScore healthScore={makeHealthScore({ summary })} />);
    expect(selectors.getSummary(summary)).toBeInTheDocument();
  });

  it("loading state shows skeleton and does not show score or status label", () => {
    render(<HealthScore healthScore={makeHealthScore({})} isLoading={true} />);
    expect(selectors.querySaudavel()).not.toBeInTheDocument();
    expect(selectors.querySlash100()).not.toBeInTheDocument();
    expect(selectors.getLoadingSkeleton()).toBeInTheDocument();
  });

  it("progress bar width reflects score value", () => {
    render(<HealthScore healthScore={makeHealthScore({ score: 65 })} />);
    const bar = selectors.getProgressBar65();
    expect(bar).toBeInTheDocument();
  });
});
