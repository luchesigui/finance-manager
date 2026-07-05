import { describe, expect, it } from "vitest";
import { formatDayOfMonth, getDaysInMonth, getNextMonth, getPrevMonth } from "./queries";

describe("getPrevMonth", () => {
  it("returns the previous month within the same year", () => {
    expect(getPrevMonth("2026-07")).toBe("2026-06");
  });

  it("wraps to December of the previous year", () => {
    expect(getPrevMonth("2026-01")).toBe("2025-12");
  });
});

describe("getNextMonth", () => {
  it("returns the next month within the same year", () => {
    expect(getNextMonth("2026-07")).toBe("2026-08");
  });

  it("wraps to January of the next year", () => {
    expect(getNextMonth("2026-12")).toBe("2027-01");
  });
});

describe("getDaysInMonth", () => {
  it("knows 31-day and 30-day months", () => {
    expect(getDaysInMonth(2026, 7)).toBe(31);
    expect(getDaysInMonth(2026, 6)).toBe(30);
  });

  it("handles February in common and leap years", () => {
    expect(getDaysInMonth(2026, 2)).toBe(28);
    expect(getDaysInMonth(2028, 2)).toBe(29);
  });
});

describe("formatDayOfMonth", () => {
  it("keeps the day when it fits in the month", () => {
    expect(formatDayOfMonth("2026-07", 15)).toBe("2026-07-15");
  });

  it("caps day 31 to the last day of February", () => {
    expect(formatDayOfMonth("2026-02", 31)).toBe("2026-02-28");
  });

  it("caps day 31 to 29 in a leap-year February", () => {
    expect(formatDayOfMonth("2028-02", 31)).toBe("2028-02-29");
  });

  it("pads single-digit days", () => {
    expect(formatDayOfMonth("2026-07", 5)).toBe("2026-07-05");
  });
});
