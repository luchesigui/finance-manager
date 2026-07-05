import { describe, expect, it } from "vitest";
import { formatBrlCurrency, parseBrazilianCurrencyToNumber } from "./currency";

describe("parseBrazilianCurrencyToNumber", () => {
  it("converts a full BRL string to a float", () => {
    expect(parseBrazilianCurrencyToNumber("R$ 1.250,75")).toBe(1250.75);
  });

  it("converts plain digits treating them as cents", () => {
    expect(parseBrazilianCurrencyToNumber("3990")).toBe(39.9);
  });

  it("converts values without thousands separator", () => {
    expect(parseBrazilianCurrencyToNumber("1250,75")).toBe(1250.75);
  });

  it("returns null for empty input", () => {
    expect(parseBrazilianCurrencyToNumber("")).toBeNull();
  });

  it("returns null when there are no digits", () => {
    expect(parseBrazilianCurrencyToNumber("R$ ,")).toBeNull();
  });
});

describe("formatBrlCurrency", () => {
  it("formats a float as BRL", () => {
    expect(formatBrlCurrency(1250.75)).toBe("R$ 1.250,75");
  });

  it("formats zero", () => {
    expect(formatBrlCurrency(0)).toBe("R$ 0,00");
  });

  it("round-trips with the parser", () => {
    const parsed = parseBrazilianCurrencyToNumber(formatBrlCurrency(39.9));
    expect(parsed).toBe(39.9);
  });
});
