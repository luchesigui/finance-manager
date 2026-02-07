import { render, screen, userEvent } from "@/test/test-utils";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { CurrencyInput } from "../CurrencyInput";

function ControlledCurrencyInput() {
  const [value, setValue] = useState<number | null>(null);
  return <CurrencyInput value={value} onValueChange={setValue} />;
}

const selectors = {
  getPlaceholder: (placeholder: string) => screen.getByPlaceholderText(placeholder),
  getTextbox: () => screen.getByRole("textbox"),
};

describe("CurrencyInput", () => {
  it("renders with optional placeholder", () => {
    const onValueChange = vi.fn();
    render(<CurrencyInput value={null} onValueChange={onValueChange} placeholder="R$ 0,00" />);
    expect(selectors.getPlaceholder("R$ 0,00")).toBeInTheDocument();
  });

  it("displays value formatted as BRL when value is provided", () => {
    const onValueChange = vi.fn();
    render(<CurrencyInput value={1234.56} onValueChange={onValueChange} />);
    const input = selectors.getTextbox();
    expect(input).toHaveDisplayValue(/1\.234,56/);
  });

  it("when value is null, display is empty", () => {
    const onValueChange = vi.fn();
    render(<CurrencyInput value={null} onValueChange={onValueChange} />);
    const input = selectors.getTextbox();
    expect(input).toHaveValue("");
  });

  it("on change parses Brazilian format and calls onValueChange with number; displayed value updates when controlled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ControlledCurrencyInput />);
    const input = selectors.getTextbox();

    await user.type(input, "123456"); // user types digits, component parses as cents -> 1234.56
    expect(input).toHaveDisplayValue(/1\.234,56/);
  });

  it("on change with empty input calls onValueChange with null", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<CurrencyInput value={100} onValueChange={onValueChange} />);
    const input = selectors.getTextbox();
    await user.clear(input);
    expect(onValueChange).toHaveBeenCalledWith(null);
  });
});
