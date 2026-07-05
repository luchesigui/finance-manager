import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("opens the dialog with title and content when open=true", () => {
    render(
      <Modal open onClose={() => {}} title="Editar Transação Recorrente">
        <p>Conteúdo do modal</p>
      </Modal>,
    );

    const dialog = document.querySelector("dialog");
    expect(dialog).toHaveAttribute("open");
    expect(screen.getByText("Editar Transação Recorrente")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo do modal")).toBeInTheDocument();
  });

  it("keeps the dialog closed when open=false", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Fechado">
        <p>Invisível</p>
      </Modal>,
    );

    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open onClose={onClose} title="Título">
        <p>Conteúdo</p>
      </Modal>,
    );

    await user.click(screen.getByLabelText("Fechar"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
