import { describe, expect, it } from "vitest";
import { formatCurrency, formatDateString, formatMonthYear, formatPercent } from "../format";

describe("format", () => {
  describe("formatCurrency", () => {
    it("formats a positive number as Brazilian Real", () => {
      const result = formatCurrency(1234.56);
      // Format: R$ 1.234,56 (Brazilian format uses . for thousands, , for decimals)
      expect(result).toContain("R$");
      expect(result).toContain("1.234,56");
    });

    it("formats zero as currency", () => {
      const result = formatCurrency(0);
      expect(result).toContain("R$");
      expect(result).toContain("0,00");
    });

    it("formats negative numbers as currency", () => {
      const result = formatCurrency(-500.5);
      expect(result).toContain("R$");
      expect(result).toContain("500,50");
    });

    it("formats large numbers with thousands separators", () => {
      const result = formatCurrency(1000000);
      expect(result).toContain("R$");
      expect(result).toContain("1.000.000");
    });

    it("formats small decimal values", () => {
      const result = formatCurrency(0.01);
      expect(result).toContain("R$");
      expect(result).toContain("0,01");
    });
  });

  describe("formatPercent", () => {
    it("formats a number as percentage", () => {
      const result = formatPercent(25);
      // Format: 25,0% (Brazilian format)
      expect(result).toBe("25,0%");
    });

    it("formats zero as percentage", () => {
      const result = formatPercent(0);
      expect(result).toBe("0,0%");
    });

    it("formats decimal percentages", () => {
      const result = formatPercent(33.33);
      expect(result).toBe("33,3%");
    });

    it("formats 100% correctly", () => {
      const result = formatPercent(100);
      expect(result).toBe("100,0%");
    });

    it("formats small percentages", () => {
      const result = formatPercent(0.5);
      expect(result).toBe("0,5%");
    });

    it("formats percentages greater than 100", () => {
      const result = formatPercent(150);
      expect(result).toBe("150,0%");
    });
  });

  describe("formatMonthYear", () => {
    it("formats a date as month and year in Portuguese", () => {
      const date = new Date(2024, 0, 15); // January 2024
      const result = formatMonthYear(date);
      expect(result.toLowerCase()).toContain("janeiro");
      expect(result).toContain("2024");
    });

    it("formats different months correctly", () => {
      const months = [
        { month: 0, expected: "janeiro" },
        { month: 5, expected: "junho" },
        { month: 11, expected: "dezembro" },
      ];

      for (const { month, expected } of months) {
        const date = new Date(2024, month, 15);
        const result = formatMonthYear(date).toLowerCase();
        expect(result).toContain(expected);
      }
    });
  });

  describe("formatDateString", () => {
    it("formats a YYYY-MM-DD string to localized date", () => {
      const result = formatDateString("2024-03-15");
      // Brazilian format: DD/MM/YYYY
      expect(result).toBe("15/03/2024");
    });

    it("formats the first day of the year", () => {
      const result = formatDateString("2024-01-01");
      expect(result).toBe("01/01/2024");
    });

    it("formats the last day of the year", () => {
      const result = formatDateString("2024-12-31");
      expect(result).toBe("31/12/2024");
    });

    it("uses custom locale when provided", () => {
      const result = formatDateString("2024-03-15", "en-US");
      // US format: MM/DD/YYYY or M/D/YYYY
      expect(result).toContain("3");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });
  });
});
