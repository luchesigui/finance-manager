import { screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";

/** Page object for a single rendered TransactionRow. */
export class TransactionRowPage {
  readonly user: UserEvent = userEvent.setup();

  amountText(): string {
    // The amount is the only text starting with R$ or -R$ in the row.
    const el = screen.getByText(/R\$/);
    return el.textContent ?? "";
  }

  confirmButtonOrNull(): HTMLElement | null {
    return screen.queryByLabelText("Confirmar");
  }

  async clickConfirm(): Promise<void> {
    await this.user.click(screen.getByLabelText("Confirmar"));
  }

  async clickEdit(): Promise<void> {
    await this.user.click(screen.getByLabelText("Editar"));
  }

  async clickDelete(): Promise<void> {
    await this.user.click(screen.getByLabelText("Excluir"));
  }

  hasTag(tagText: string | RegExp): boolean {
    return !!screen.queryByText(tagText);
  }
}
