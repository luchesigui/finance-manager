import { describe, expect, it } from "vitest";
import {
  addMonthsClamped,
  addMonthsClampedUtc,
  getAccountingYearMonth,
  getAccountingYearMonthUtc,
  parseDateString,
  parseDateStringUtc,
  toDateString,
  toYearMonthString,
} from "../dateUtils";

describe("dateUtils", () => {
  describe("parseDateString", () => {
    it("parses a valid YYYY-MM-DD string to a Date in local timezone", () => {
      const date = parseDateString("2024-03-15");
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(2); // March is 0-indexed
      expect(date.getDate()).toBe(15);
    });

    it("parses the first day of the year", () => {
      const date = parseDateString("2024-01-01");
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(1);
    });

    it("parses the last day of the year", () => {
      const date = parseDateString("2024-12-31");
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(11);
      expect(date.getDate()).toBe(31);
    });

    it("handles leap year dates", () => {
      const date = parseDateString("2024-02-29");
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(1);
      expect(date.getDate()).toBe(29);
    });
  });

  describe("parseDateStringUtc", () => {
    it("parses a valid YYYY-MM-DD string to a UTC Date", () => {
      const date = parseDateStringUtc("2024-03-15");
      expect(date.getUTCFullYear()).toBe(2024);
      expect(date.getUTCMonth()).toBe(2);
      expect(date.getUTCDate()).toBe(15);
    });

    it("parses leap year dates in UTC", () => {
      const date = parseDateStringUtc("2024-02-29");
      expect(date.getUTCFullYear()).toBe(2024);
      expect(date.getUTCMonth()).toBe(1);
      expect(date.getUTCDate()).toBe(29);
    });
  });

  describe("toDateString", () => {
    it("converts a Date to YYYY-MM-DD format", () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      expect(toDateString(date)).toBe("2024-03-15");
    });

    it("pads single-digit months with leading zero", () => {
      const date = new Date(2024, 0, 5); // January 5, 2024
      expect(toDateString(date)).toBe("2024-01-05");
    });

    it("pads single-digit days with leading zero", () => {
      const date = new Date(2024, 11, 9); // December 9, 2024
      expect(toDateString(date)).toBe("2024-12-09");
    });

    it("handles the last day of the year", () => {
      const date = new Date(2024, 11, 31);
      expect(toDateString(date)).toBe("2024-12-31");
    });
  });

  describe("toYearMonthString", () => {
    it("converts a Date to YYYY-MM format", () => {
      const date = new Date(2024, 2, 15);
      expect(toYearMonthString(date)).toBe("2024-03");
    });

    it("pads single-digit months with leading zero", () => {
      const date = new Date(2024, 0, 15);
      expect(toYearMonthString(date)).toBe("2024-01");
    });

    it("handles December correctly", () => {
      const date = new Date(2024, 11, 15);
      expect(toYearMonthString(date)).toBe("2024-12");
    });
  });

  describe("addMonthsClamped", () => {
    it("adds one month to a date", () => {
      const date = new Date(2024, 0, 15); // January 15
      const result = addMonthsClamped(date, 1);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(15);
    });

    it("adds multiple months to a date", () => {
      const date = new Date(2024, 0, 15); // January 15
      const result = addMonthsClamped(date, 6);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(6); // July
      expect(result.getDate()).toBe(15);
    });

    it("clamps day when adding month would overflow (Jan 31 + 1 month = Feb 28/29)", () => {
      const date = new Date(2024, 0, 31); // January 31, 2024 (leap year)
      const result = addMonthsClamped(date, 1);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(29); // Leap year
    });

    it("clamps day for non-leap year February", () => {
      const date = new Date(2023, 0, 31); // January 31, 2023
      const result = addMonthsClamped(date, 1);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(28); // Non-leap year
    });

    it("handles year boundary crossing", () => {
      const date = new Date(2024, 10, 15); // November 15
      const result = addMonthsClamped(date, 3);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(15);
    });

    it("subtracts months when given negative value", () => {
      const date = new Date(2024, 5, 15); // June 15
      const result = addMonthsClamped(date, -3);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2); // March
      expect(result.getDate()).toBe(15);
    });

    it("handles year boundary crossing when subtracting", () => {
      const date = new Date(2024, 1, 15); // February 15
      const result = addMonthsClamped(date, -3);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(10); // November
      expect(result.getDate()).toBe(15);
    });

    it("clamps March 31 - 1 month to Feb 28/29", () => {
      const date = new Date(2024, 2, 31); // March 31, 2024
      const result = addMonthsClamped(date, -1);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(29); // Leap year
    });
  });

  describe("addMonthsClampedUtc", () => {
    it("adds one month to a UTC date", () => {
      const date = new Date(Date.UTC(2024, 0, 15));
      const result = addMonthsClampedUtc(date, 1);
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(1);
      expect(result.getUTCDate()).toBe(15);
    });

    it("clamps day when adding month would overflow (UTC)", () => {
      const date = new Date(Date.UTC(2024, 0, 31)); // January 31
      const result = addMonthsClampedUtc(date, 1);
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(1);
      expect(result.getUTCDate()).toBe(29); // Leap year
    });

    it("subtracts months when given negative value (UTC)", () => {
      const date = new Date(Date.UTC(2024, 5, 15));
      const result = addMonthsClampedUtc(date, -3);
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(2);
      expect(result.getUTCDate()).toBe(15);
    });
  });

  describe("getAccountingYearMonth", () => {
    it("returns same month for non-credit card transactions", () => {
      const result = getAccountingYearMonth("2024-03-15", false);
      expect(result.year).toBe(2024);
      expect(result.month).toBe(3);
    });

    it("returns next month for credit card transactions", () => {
      const result = getAccountingYearMonth("2024-03-15", true);
      expect(result.year).toBe(2024);
      expect(result.month).toBe(4);
    });

    it("handles year boundary for credit card transactions", () => {
      const result = getAccountingYearMonth("2024-12-15", true);
      expect(result.year).toBe(2025);
      expect(result.month).toBe(1);
    });

    it("handles first day of year for non-credit card", () => {
      const result = getAccountingYearMonth("2024-01-01", false);
      expect(result.year).toBe(2024);
      expect(result.month).toBe(1);
    });

    it("handles last day of year for non-credit card", () => {
      const result = getAccountingYearMonth("2024-12-31", false);
      expect(result.year).toBe(2024);
      expect(result.month).toBe(12);
    });
  });

  describe("getAccountingYearMonthUtc", () => {
    it("returns same month for non-credit card transactions (UTC)", () => {
      const result = getAccountingYearMonthUtc("2024-03-15", false);
      expect(result.year).toBe(2024);
      expect(result.month).toBe(3);
    });

    it("returns next month for credit card transactions (UTC)", () => {
      const result = getAccountingYearMonthUtc("2024-03-15", true);
      expect(result.year).toBe(2024);
      expect(result.month).toBe(4);
    });

    it("handles year boundary for credit card transactions (UTC)", () => {
      const result = getAccountingYearMonthUtc("2024-12-15", true);
      expect(result.year).toBe(2025);
      expect(result.month).toBe(1);
    });
  });
});
