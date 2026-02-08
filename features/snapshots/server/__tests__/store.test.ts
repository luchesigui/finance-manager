import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { getClosedMonthsSet, isMonthClosed } from "@/features/snapshots/server/store";
import { createClient } from "@/lib/supabase/server";

describe("snapshots store (closed periods)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isMonthClosed", () => {
    it("returns true when a closed period exists for the period", async () => {
      vi.mocked(createClient).mockResolvedValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: () =>
                    Promise.resolve({ data: { household_id: "house-1" }, error: null }),
                }),
              }),
            }),
          }),
        }),
      } as never);

      const result = await isMonthClosed("house-1", 2026, 3);

      expect(result).toBe(true);
    });

    it("returns false when no closed period exists for the period", async () => {
      vi.mocked(createClient).mockResolvedValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: () => Promise.resolve({ data: null, error: null }),
                }),
              }),
            }),
          }),
        }),
      } as never);

      const result = await isMonthClosed("house-1", 2026, 4);

      expect(result).toBe(false);
    });
  });

  describe("getClosedMonthsSet", () => {
    it("returns empty set when periods is empty", async () => {
      const result = await getClosedMonthsSet("house-1", []);
      expect(result).toEqual(new Set());
      expect(createClient).not.toHaveBeenCalled();
    });

    it("returns set of closed period keys when closed periods exist", async () => {
      vi.mocked(createClient).mockResolvedValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              in: () =>
                Promise.resolve({
                  data: [
                    { year: 2026, month: 1 },
                    { year: 2026, month: 3 },
                  ],
                  error: null,
                }),
            }),
          }),
        }),
      } as never);

      const result = await getClosedMonthsSet("house-1", [
        { year: 2026, month: 1 },
        { year: 2026, month: 2 },
        { year: 2026, month: 3 },
      ]);

      expect(result).toEqual(new Set(["2026,1", "2026,3"]));
    });
  });
});
