import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/server/household", () => ({
  getPrimaryHouseholdId: vi.fn(),
}));

vi.mock("@/features/recurring-templates/server/store", () => ({
  getRecurringTemplates: vi.fn(),
}));

vi.mock("@/features/snapshots/server/store", () => ({
  isMonthClosed: vi.fn(),
}));

import { getRecurringTemplates } from "@/features/recurring-templates/server/store";
import { isMonthClosed } from "@/features/snapshots/server/store";
import { getTransactions } from "@/features/transactions/server/store";
import { getPrimaryHouseholdId } from "@/lib/server/household";
import { createClient } from "@/lib/supabase/server";
import type { TransactionRow } from "@/lib/types";

type MockData = {
  transactions: TransactionRow[];
};

function createSupabaseMock(data: MockData) {
  function applyFilters(rows: Record<string, unknown>[], filters: Array<[string, unknown]>) {
    return rows.filter((row) => filters.every(([column, value]) => row[column] === value));
  }

  function applyRange(
    rows: Record<string, unknown>[],
    dateColumn: string,
    gteValue: string | null,
    lteValue: string | null,
  ) {
    return rows.filter((row) => {
      const value = String(row[dateColumn] ?? "");
      if (gteValue && value < gteValue) return false;
      if (lteValue && value > lteValue) return false;
      return true;
    });
  }

  return {
    from(table: "transactions") {
      const filters: Array<[string, unknown]> = [];
      let gteValue: string | null = null;
      let lteValue: string | null = null;

      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn((column: string, value: unknown) => {
          filters.push([column, value]);
          return builder;
        }),
        gte: vi.fn((_column: string, value: string) => {
          gteValue = value;
          return builder;
        }),
        lte: vi.fn((_column: string, value: string) => {
          lteValue = value;
          return builder;
        }),
        order: vi.fn(() => {
          const sourceRows = data.transactions as Record<string, unknown>[];
          const filtered = applyFilters(sourceRows, filters);
          const ranged = applyRange(filtered, "date", gteValue, lteValue);
          return Promise.resolve({ data: ranged, error: null });
        }),
      };

      return builder;
    },
  };
}

describe("transactions store monthly query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPrimaryHouseholdId).mockResolvedValue("house-1");
    vi.mocked(getRecurringTemplates).mockResolvedValue({ templates: [], total: 0 });
    vi.mocked(isMonthClosed).mockResolvedValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns only real transactions for the selected accounting month", async () => {
    vi.mocked(createClient).mockResolvedValue(
      createSupabaseMock({
        transactions: [
          {
            id: 1,
            description: "Supermercado",
            amount: 300,
            category_id: "c1",
            paid_by: "p1",
            recurring_template_id: null,
            is_credit_card: false,
            exclude_from_split: false,
            is_forecast: false,
            date: "2026-03-10",
            created_at: "2026-03-10T12:00:00.000Z",
            household_id: "house-1",
            type: "expense",
            is_increment: true,
          },
          {
            id: 2,
            description: "Fatura cartao",
            amount: 120,
            category_id: "c2",
            paid_by: "p1",
            recurring_template_id: null,
            is_credit_card: true,
            exclude_from_split: false,
            is_forecast: false,
            date: "2026-02-20",
            created_at: "2026-02-20T12:00:00.000Z",
            household_id: "house-1",
            type: "expense",
            is_increment: true,
          },
          {
            id: 3,
            description: "Mes anterior",
            amount: 50,
            category_id: "c3",
            paid_by: "p1",
            recurring_template_id: null,
            is_credit_card: false,
            exclude_from_split: false,
            is_forecast: false,
            date: "2026-02-05",
            created_at: "2026-02-05T12:00:00.000Z",
            household_id: "house-1",
            type: "expense",
            is_increment: true,
          },
        ],
      }) as never,
    );

    const result = await getTransactions(2026, 3);

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.description)).toEqual(["Supermercado", "Fatura cartao"]);
  });

  it("keeps recurring_template_id from persisted rows", async () => {
    vi.mocked(createClient).mockResolvedValue(
      createSupabaseMock({
        transactions: [
          {
            id: 10,
            description: "Aluguel",
            amount: 4100,
            category_id: "c-home",
            paid_by: "p1",
            recurring_template_id: 77,
            is_credit_card: false,
            exclude_from_split: false,
            is_forecast: false,
            date: "2026-03-01",
            created_at: "2026-03-01T08:00:00.000Z",
            household_id: "house-1",
            type: "expense",
            is_increment: true,
          },
        ],
      }) as never,
    );

    const result = await getTransactions(2026, 3);

    expect(result).toHaveLength(1);
    expect(result[0].recurringTemplateId).toBe(77);
  });

  it("returns only real transactions when month is closed (no virtual)", async () => {
    vi.mocked(isMonthClosed).mockResolvedValue(true);
    vi.mocked(createClient).mockResolvedValue(
      createSupabaseMock({
        transactions: [
          {
            id: 1,
            description: "Only real",
            amount: 100,
            category_id: "c1",
            paid_by: "p1",
            recurring_template_id: null,
            is_credit_card: false,
            exclude_from_split: false,
            is_forecast: false,
            date: "2026-03-15",
            created_at: "2026-03-15T12:00:00.000Z",
            household_id: "house-1",
            type: "expense",
            is_increment: true,
          },
        ],
      }) as never,
    );

    const result = await getTransactions(2026, 3);

    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("Only real");
    expect(getRecurringTemplates).not.toHaveBeenCalled();
  });
});
