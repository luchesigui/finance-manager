import { render, screen, userEvent } from "@/test/test-utils";
import { describe, expect, it } from "vitest";
import { AlertsPanel } from "../AlertsPanel";
import type { Alert } from "../hooks/useDashboardAlerts";

function makeAlert(overrides: Partial<Alert>): Alert {
  return {
    id: "alert-1",
    type: "warning",
    category: "budget",
    title: "Categoria acima do orçamento",
    description: "Alimentação está 20% acima.",
    ...overrides,
  };
}

const selectors = {
  getHeadingAtencao: () => screen.getByRole("heading", { name: /atenção necessária/i }),
  getCountBadge: (n: string) => screen.getByText(n),
  getHeaderButton: () => screen.getByRole("button", { name: /atenção necessária/i }),
  getAlertText: (text: string) => screen.getByText(text),
  queryAlertText: (text: string) => screen.queryByText(text),
  queryAtencaoNecessaria: () => screen.queryByText(/atenção necessária/i),
};

describe("AlertsPanel", () => {
  it('has correct title "Atenção Necessária"', () => {
    render(<AlertsPanel alerts={[makeAlert({})]} />);
    expect(selectors.getHeadingAtencao()).toBeInTheDocument();
  });

  it("shows correct alert count in badge", () => {
    render(
      <AlertsPanel
        alerts={[makeAlert({ id: "1" }), makeAlert({ id: "2", title: "Outro alerta" })]}
      />,
    );
    expect(selectors.getCountBadge("2")).toBeInTheDocument();
  });

  it("is collapsible: click toggles expanded/collapsed; list visible when expanded", async () => {
    const user = userEvent.setup();
    render(<AlertsPanel alerts={[makeAlert({ title: "Test alert" })]} />);
    const header = selectors.getHeaderButton();
    expect(selectors.getAlertText("Test alert")).toBeInTheDocument();

    await user.click(header);
    expect(selectors.queryAlertText("Test alert")).not.toBeInTheDocument();

    await user.click(header);
    expect(selectors.getAlertText("Test alert")).toBeInTheDocument();
  });

  it("shows list of alerts with title and description when expanded", () => {
    render(
      <AlertsPanel
        alerts={[
          makeAlert({ id: "1", title: "Alert One", description: "Description one" }),
          makeAlert({ id: "2", title: "Alert Two", description: "Description two" }),
        ]}
      />,
    );
    expect(selectors.getAlertText("Alert One")).toBeInTheDocument();
    expect(selectors.getAlertText("Description one")).toBeInTheDocument();
    expect(selectors.getAlertText("Alert Two")).toBeInTheDocument();
    expect(selectors.getAlertText("Description two")).toBeInTheDocument();
  });

  it("returns null when alerts.length === 0 (does not render panel)", () => {
    const { container } = render(<AlertsPanel alerts={[]} />);
    expect(selectors.queryAtencaoNecessaria()).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });
});
