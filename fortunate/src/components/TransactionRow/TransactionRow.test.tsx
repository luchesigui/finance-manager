import { TransactionRowPage } from "@/test/pageObjects/TransactionRowPage";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransactionRow } from "./TransactionRow";

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const baseProps = {
  avatar: "GU",
  description: "Academia",
  category: "Saúde",
  date: "10/07/2026",
  amount: 120,
  transactionType: "expense" as const,
};

describe("TransactionRow", () => {
  it("shows an expense as a negative amount", () => {
    render(<TransactionRow {...baseProps} />);
    const row = new TransactionRowPage();
    expect(row.amountText()).toBe(brl(-120));
  });

  it("shows income and transfers as positive amounts", () => {
    const { unmount } = render(
      <TransactionRow {...baseProps} transactionType="income" amount={5000} />,
    );
    expect(new TransactionRowPage().amountText()).toBe(brl(5000));
    unmount();

    render(<TransactionRow {...baseProps} transactionType="transfer" amount={300} />);
    expect(new TransactionRowPage().amountText()).toBe(brl(300));
  });

  it("renders description, category, date and tags", () => {
    render(<TransactionRow {...baseProps} pills={["recorrente", "cartao"]} />);
    const row = new TransactionRowPage();
    expect(screen.getByText("Academia")).toBeInTheDocument();
    expect(screen.getByText("Saúde")).toBeInTheDocument();
    expect(screen.getByText("10/07/2026")).toBeInTheDocument();
    expect(row.hasTag("Recorrente")).toBe(true);
    expect(row.hasTag("Cartão")).toBe(true);
  });

  it("shows the confirm action only for previsão expenses", () => {
    const { unmount } = render(
      <TransactionRow {...baseProps} pills={["previsao"]} onConfirm={() => {}} />,
    );
    expect(new TransactionRowPage().confirmButtonOrNull()).not.toBeNull();
    unmount();

    render(<TransactionRow {...baseProps} onConfirm={() => {}} />);
    expect(new TransactionRowPage().confirmButtonOrNull()).toBeNull();
  });

  it("does not show the confirm action for previsão income", () => {
    render(
      <TransactionRow
        {...baseProps}
        transactionType="income"
        pills={["previsao"]}
        onConfirm={() => {}}
      />,
    );
    expect(new TransactionRowPage().confirmButtonOrNull()).toBeNull();
  });

  it("fires the edit, delete and confirm callbacks", async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onConfirm = vi.fn();
    render(
      <TransactionRow
        {...baseProps}
        pills={["previsao"]}
        onEdit={onEdit}
        onDelete={onDelete}
        onConfirm={onConfirm}
      />,
    );

    const row = new TransactionRowPage();
    await row.clickEdit();
    await row.clickDelete();
    await row.clickConfirm();

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
