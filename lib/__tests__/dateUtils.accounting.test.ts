import { describe, expect, it } from "vitest";

import { transactionMatchesAccountingPeriod } from "@/lib/dateUtils";

describe("transactionMatchesAccountingPeriod", () => {
  it("includes calendar-month expense in that accounting month when not next billing", () => {
    expect(
      transactionMatchesAccountingPeriod({ date: "2025-03-10", isNextBilling: false }, 2025, 3),
    ).toBe(true);
  });

  it("excludes current-month dated expense with next billing from that month totals", () => {
    expect(
      transactionMatchesAccountingPeriod({ date: "2025-03-10", isNextBilling: true }, 2025, 3),
    ).toBe(false);
  });

  it("includes that expense in the following accounting month", () => {
    expect(
      transactionMatchesAccountingPeriod({ date: "2025-03-10", isNextBilling: true }, 2025, 4),
    ).toBe(true);
  });

  it("includes previous calendar month next-billing in current accounting month", () => {
    expect(
      transactionMatchesAccountingPeriod({ date: "2025-02-28", isNextBilling: true }, 2025, 3),
    ).toBe(true);
  });
});
