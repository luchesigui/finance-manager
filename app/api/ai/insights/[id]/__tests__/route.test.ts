import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/requestBodyValidation", () => ({
  requireAuth: vi.fn(),
  readJsonBody: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { PATCH } from "@/app/api/ai/insights/[id]/route";
import { readJsonBody, requireAuth } from "@/lib/server/requestBodyValidation";
import { createClient } from "@/lib/supabase/server";

describe("PATCH /api/ai/insights/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue({ success: true, userId: "u1" });
  });

  it("updates insight comment and returns success", async () => {
    vi.mocked(readJsonBody).mockResolvedValue({ comment: "Novo comentário" });

    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "insight-1",
        type: "positive",
        title: "Test Title",
        description: "Test Description",
        comment: "Novo comentário",
        is_deleted: false,
      },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });

    const mockEq = vi.fn().mockReturnValue({
      select: mockSelect,
    });

    const mockUpdate = vi.fn().mockReturnValue({
      eq: mockEq,
    });

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
      }),
    };

    // biome-ignore lint/suspicious/noExplicitAny: Mocking createClient
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const response = await PATCH(
      new Request("http://localhost/api/ai/insights/insight-1", { method: "PATCH" }),
      { params: Promise.resolve({ id: "insight-1" }) },
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.insight.comment).toBe("Novo comentário");
    expect(mockSupabase.from).toHaveBeenCalledWith("ai_insights");
    expect(mockUpdate).toHaveBeenCalledWith({ comment: "Novo comentário" });
    expect(mockEq).toHaveBeenCalledWith("id", "insight-1");
  });

  it("updates isDeleted flag", async () => {
    vi.mocked(readJsonBody).mockResolvedValue({ isDeleted: true });

    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "insight-1",
        type: "negative",
        title: "Warning Title",
        description: "Warning Description",
        comment: null,
        is_deleted: true,
      },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });

    const mockEq = vi.fn().mockReturnValue({
      select: mockSelect,
    });

    const mockUpdate = vi.fn().mockReturnValue({
      eq: mockEq,
    });

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
      }),
    };

    // biome-ignore lint/suspicious/noExplicitAny: Mocking createClient
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const response = await PATCH(
      new Request("http://localhost/api/ai/insights/insight-1", { method: "PATCH" }),
      { params: Promise.resolve({ id: "insight-1" }) },
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.insight.isDeleted).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({ is_deleted: true });
  });

  it("updates isArchived flag", async () => {
    vi.mocked(readJsonBody).mockResolvedValue({ isArchived: true });

    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "insight-1",
        type: "negative",
        title: "Warning Title",
        description: "Warning Description",
        comment: null,
        is_deleted: false,
        is_archived: true,
      },
      error: null,
    });

    const mockSelect = vi.fn().mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });

    const mockEq = vi.fn().mockReturnValue({
      select: mockSelect,
    });

    const mockUpdate = vi.fn().mockReturnValue({
      eq: mockEq,
    });

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
      }),
    };

    // biome-ignore lint/suspicious/noExplicitAny: Mocking createClient
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const response = await PATCH(
      new Request("http://localhost/api/ai/insights/insight-1", { method: "PATCH" }),
      { params: Promise.resolve({ id: "insight-1" }) },
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.insight.isArchived).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({ is_archived: true });
  });

  it("returns 404 if insight not found or access denied", async () => {
    vi.mocked(readJsonBody).mockResolvedValue({ comment: "No effect" });

    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockSelect = vi.fn().mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });

    const mockEq = vi.fn().mockReturnValue({
      select: mockSelect,
    });

    const mockUpdate = vi.fn().mockReturnValue({
      eq: mockEq,
    });

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
      }),
    };

    // biome-ignore lint/suspicious/noExplicitAny: Mocking createClient
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const response = await PATCH(
      new Request("http://localhost/api/ai/insights/insight-1", { method: "PATCH" }),
      { params: Promise.resolve({ id: "insight-1" }) },
    );

    expect(response.status).toBe(404);
  });
});
