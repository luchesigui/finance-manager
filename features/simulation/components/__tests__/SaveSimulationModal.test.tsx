import { render, screen, userEvent } from "@/test/test-utils";
import { describe, expect, it, vi } from "vitest";
import { SaveSimulationModal } from "../SaveSimulationModal";

const selectors = {
  getDialog: () => screen.getByRole("dialog", { name: /salvar simulação/i }),
  getNomeInput: () => screen.getByLabelText(/nome da simulação/i),
  getPlaceholder: () => screen.getByPlaceholderText(/cenário sem aluguel/i),
  getCancelarButton: () => screen.getByRole("button", { name: /cancelar/i }),
  getSalvarButton: () => screen.getByRole("button", { name: /salvar/i }),
  getSalvandoButton: () => screen.getByRole("button", { name: /salvando/i }),
  getFecharModalButton: () => screen.getByRole("button", { name: /fechar modal/i }),
};

describe("SaveSimulationModal", () => {
  it("renders with title Salvar Simulação, input, Cancel and Salvar buttons", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(
      <SaveSimulationModal onSave={onSave} onClose={onClose} isSaving={false} />,
    );

    expect(selectors.getDialog()).toBeInTheDocument();
    expect(selectors.getNomeInput()).toBeInTheDocument();
    expect(selectors.getPlaceholder()).toBeInTheDocument();
    expect(selectors.getCancelarButton()).toBeInTheDocument();
    expect(selectors.getSalvarButton()).toBeInTheDocument();
  });

  it("submit button is disabled when name is empty", () => {
    render(
      <SaveSimulationModal
        onSave={vi.fn()}
        onClose={vi.fn()}
        isSaving={false}
      />,
    );
    expect(selectors.getSalvarButton()).toBeDisabled();
  });

  it("submit button is disabled when name is only whitespace", async () => {
    const user = userEvent.setup();
    render(
      <SaveSimulationModal
        onSave={vi.fn()}
        onClose={vi.fn()}
        isSaving={false}
      />,
    );
    await user.type(selectors.getNomeInput(), "   ");
    expect(selectors.getSalvarButton()).toBeDisabled();
  });

  it("typing a name enables submit; submitting calls onSave(trimmedName) and does not call onClose", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(
      <SaveSimulationModal onSave={onSave} onClose={onClose} isSaving={false} />,
    );

    await user.type(selectors.getNomeInput(), "  Minha sim  ");
    expect(selectors.getSalvarButton()).not.toBeDisabled();

    await user.click(selectors.getSalvarButton());

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith("Minha sim");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("Cancel button calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <SaveSimulationModal onSave={vi.fn()} onClose={onClose} isSaving={false} />,
    );
    await user.click(selectors.getCancelarButton());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closing via X button calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <SaveSimulationModal onSave={vi.fn()} onClose={onClose} isSaving={false} />,
    );
    await user.click(selectors.getFecharModalButton());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("when isSaving is true, submit shows loading state and buttons are disabled", () => {
    render(
      <SaveSimulationModal
        onSave={vi.fn()}
        onClose={vi.fn()}
        isSaving={true}
      />,
    );
    expect(selectors.getSalvandoButton()).toBeInTheDocument();
    expect(selectors.getSalvandoButton()).toBeDisabled();
    expect(selectors.getCancelarButton()).toBeDisabled();
    expect(selectors.getNomeInput()).toBeDisabled();
  });
});
