import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/requestBodyValidation", () => ({
  requireAuth: vi.fn(),
  readJsonBody: vi.fn(),
  validateBody: vi.fn(),
  parseNumericId: vi.fn(),
}));

vi.mock("@/features/recurring-templates/server/store", () => ({
  getRecurringTemplate: vi.fn(),
  updateRecurringTemplate: vi.fn(),
  deleteRecurringTemplate: vi.fn(),
}));

import { DELETE, GET, PATCH } from "@/app/api/recurring-templates/[id]/route";
import {
  deleteRecurringTemplate,
  getRecurringTemplate,
  updateRecurringTemplate,
} from "@/features/recurring-templates/server/store";
import {
  parseNumericId,
  readJsonBody,
  requireAuth,
  validateBody,
} from "@/lib/server/requestBodyValidation";

describe("/api/recurring-templates/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue({ success: true, userId: "u1" });
    vi.mocked(parseNumericId).mockReturnValue(7);
  });

  it("GET returns 404 when not found", async () => {
    vi.mocked(getRecurringTemplate).mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "7" }),
    });

    expect(response.status).toBe(404);
  });

  it("PATCH updates template", async () => {
    vi.mocked(readJsonBody).mockResolvedValue({ patch: { description: "Updated" } });
    vi.mocked(validateBody).mockReturnValue({
      success: true,
      data: { patch: { description: "Updated" } },
    });
    vi.mocked(getRecurringTemplate).mockResolvedValue({ id: 7, description: "Old" } as never);
    vi.mocked(updateRecurringTemplate).mockResolvedValue({
      id: 7,
      description: "Updated",
    } as never);

    const response = await PATCH(new Request("http://localhost", { method: "PATCH" }), {
      params: Promise.resolve({ id: "7" }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 7, description: "Updated" });
    expect(updateRecurringTemplate).toHaveBeenCalledWith(
      7,
      { description: "Updated" },
      {
        scope: "template_only",
      },
    );
  });

  it("DELETE with default scope soft-deletes template only", async () => {
    vi.mocked(getRecurringTemplate).mockResolvedValue({ id: 7 } as never);

    const response = await DELETE(new Request("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ id: "7" }),
    });

    expect(response.status).toBe(200);
    expect(deleteRecurringTemplate).toHaveBeenCalledWith(7, {
      scope: "template_only",
      purgeTransactions: false,
      fromDate: undefined,
    });
  });

  it("DELETE with scope=full_history passes full_history to store", async () => {
    vi.mocked(getRecurringTemplate).mockResolvedValue({ id: 7 } as never);

    const response = await DELETE(
      new Request("http://localhost/api/recurring-templates/7?scope=full_history", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: "7" }) },
    );

    expect(response.status).toBe(200);
    expect(deleteRecurringTemplate).toHaveBeenCalledWith(7, {
      scope: "full_history",
      purgeTransactions: false,
      fromDate: undefined,
    });
  });

  it("PATCH with scope passes scope to updateRecurringTemplate", async () => {
    vi.mocked(readJsonBody).mockResolvedValue({
      patch: { description: "Updated" },
      scope: "full_history",
    });
    vi.mocked(validateBody).mockReturnValue({
      success: true,
      data: { patch: { description: "Updated" }, scope: "full_history" },
    });
    vi.mocked(getRecurringTemplate).mockResolvedValue({ id: 7, description: "Old" } as never);
    vi.mocked(updateRecurringTemplate).mockResolvedValue({
      id: 7,
      description: "Updated",
    } as never);

    const response = await PATCH(new Request("http://localhost", { method: "PATCH" }), {
      params: Promise.resolve({ id: "7" }),
    });

    expect(response.status).toBe(200);
    expect(updateRecurringTemplate).toHaveBeenCalledWith(
      7,
      { description: "Updated" },
      {
        scope: "full_history",
      },
    );
  });
});
