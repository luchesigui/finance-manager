import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";

/**
 * Page object for the NovoLancamento view. Encapsulates all queries and
 * interactions so the tests read as user intentions, not DOM plumbing.
 */
export class NovoLancamentoPage {
  readonly user: UserEvent = userEvent.setup();

  /* ─── Form fields ─── */

  descriptionInput(): HTMLInputElement {
    return screen.getByLabelText("Descrição") as HTMLInputElement;
  }

  valorInput(): HTMLInputElement {
    return screen.getByLabelText("Valor") as HTMLInputElement;
  }

  dateInput(): HTMLInputElement {
    return screen.getByLabelText("Data") as HTMLInputElement;
  }

  async fillDescription(text: string): Promise<void> {
    await this.user.clear(this.descriptionInput());
    await this.user.type(this.descriptionInput(), text);
  }

  /** Types the amount as digits, e.g. "3990" becomes R$ 39,90. */
  async fillValor(digits: string): Promise<void> {
    await this.user.clear(this.valorInput());
    await this.user.type(this.valorInput(), digits);
  }

  async setDate(date: string): Promise<void> {
    fireEvent.change(this.dateInput(), { target: { value: date } });
  }

  // When checked, the InlineCheck label renders a leading "✓", so match on
  // the label text with that indicator stripped.
  private checkboxLabelMatcher(label: string) {
    return (content: string) => content.replace(/^✓\s*/, "").trim() === label;
  }

  async toggleCheckbox(
    label:
      | "Recorrente"
      | "Parcelado"
      | "Previsão"
      | "Cartão de Crédito"
      | "Próxima Fatura"
      | "Não entra na divisão",
  ): Promise<void> {
    await this.user.click(screen.getByLabelText(this.checkboxLabelMatcher(label)));
  }

  checkboxOrNull(label: string): HTMLElement | null {
    return screen.queryByLabelText(this.checkboxLabelMatcher(label));
  }

  async selectFormTab(label: "Despesa" | "Renda" | "Transferência"): Promise<void> {
    await this.user.click(screen.getByRole("button", { name: label }));
  }

  /* ─── Actions ─── */

  async submitNew(): Promise<void> {
    await this.user.click(screen.getByRole("button", { name: /Adicionar/ }));
  }

  async saveEdit(): Promise<void> {
    await this.user.click(screen.getByRole("button", { name: "Salvar Alterações" }));
  }

  async cancel(): Promise<void> {
    await this.user.click(screen.getByRole("button", { name: "Cancelar" }));
  }

  formTitle(): string {
    return document.querySelector("h2")?.textContent ?? "";
  }

  /* ─── Transaction list ─── */

  async waitForRow(description: string): Promise<void> {
    await screen.findByText(description);
  }

  /** Root element of a TransactionRow, resolved from its description text. */
  row(description: string): HTMLElement {
    const descriptionEl = screen.getByText(description);
    // markup: .row > .body > span(description)
    const row = descriptionEl.parentElement?.parentElement;
    if (!row) throw new Error(`Row not found for "${description}"`);
    return row as HTMLElement;
  }

  rowText(description: string): string {
    return this.row(description).textContent ?? "";
  }

  async editRow(description: string): Promise<void> {
    await this.user.click(within(this.row(description)).getByLabelText("Editar"));
  }

  async deleteRow(description: string): Promise<void> {
    await this.user.click(within(this.row(description)).getByLabelText("Excluir"));
  }

  async confirmRow(description: string): Promise<void> {
    await this.user.click(within(this.row(description)).getByLabelText("Confirmar"));
  }

  async switchListView(label: "Despesas" | "Rendas" | "Transferências"): Promise<void> {
    await this.user.click(screen.getByRole("button", { name: label }));
  }

  async searchList(term: string): Promise<void> {
    await this.user.type(screen.getByPlaceholderText("Buscar por descrição..."), term);
  }

  /** Formatted value shown in the "Total do Contexto" sum row. */
  sumValue(): string {
    const label = screen.getByText("Total do Contexto:");
    return label.nextElementSibling?.textContent ?? "";
  }

  emptyStateVisible(): boolean {
    return !!screen.queryByText(/Nenhum lançamento/);
  }

  /* ─── Recurrence choice modal ─── */

  openDialog(): HTMLElement {
    const dialog = document.querySelector("dialog[open]");
    if (!dialog) throw new Error("No open dialog found");
    return dialog as HTMLElement;
  }

  async waitForDialog(title: string): Promise<void> {
    await waitFor(() => {
      within(this.openDialog()).getByText(title);
    });
  }

  dialogIsOpen(): boolean {
    return !!document.querySelector("dialog[open]");
  }

  async chooseRecurrenceOption(name: string | RegExp): Promise<void> {
    await this.user.click(within(this.openDialog()).getByRole("button", { name }));
  }
}
