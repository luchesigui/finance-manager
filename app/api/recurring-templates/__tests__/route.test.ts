import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/requestBodyValidation", () => ({
  requireAuth: vi.fn(),
  readJsonBody: vi.fn(),
  validateBody: vi.fn(),
}));

vi.mock("@/features/recurring-templates/server/store", () => ({
  getRecurringTemplates: vi.fn(),
  createRecurringTemplate: vi.fn(),
}));

import { GET, POST } from "@/app/api/recurring-templates/route";
import {
  createRecurringTemplate,
  getRecurringTemplates,
} from "@/features/recurring-templates/server/store";
import { readJsonBody, requireAuth, validateBody } from "@/lib/server/requestBodyValidation";

describe("/api/recurring-templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue({ success: true, userId: "u1" });
  });

  it("GET returns templates payload", async () => {
    vi.mocked(getRecurringTemplates).mockResolvedValue({
      templates: [{ id: 1, description: "Rent", amount: 1000 } as never],
      total: 1,
    });

    const request = new Request("http://localhost/api/recurring-templates?includeInactive=true");
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      templates: [{ id: 1, description: "Rent", amount: 1000 }],
      total: 1,
    });
    expect(getRecurringTemplates).toHaveBeenCalledWith({
      activeOnly: false,
      limit: 100,
      offset: 0,
    });
  });

  it("POST validates body and creates template", async () => {
    vi.mocked(readJsonBody).mockResolvedValue({ description: "Salary" });
    vi.mocked(validateBody).mockReturnValue({
      success: true,
      data: {
        description: "Salary",
        amount: 5000,
        categoryId: null,
        paidBy: "p1",
        type: "income",
        isIncrement: true,
        isCreditCard: false,
        isNextBilling: false,
        excludeFromSplit: false,
        dayOfMonth: 5,
        isActive: true,
      },
    });
    vi.mocked(createRecurringTemplate).mockResolvedValue({
      id: 10,
      description: "Salary",
    } as never);

    const response = await POST(
      new Request("http://localhost/api/recurring-templates", { method: "POST" }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: 10, description: "Salary" });
    expect(createRecurringTemplate).toHaveBeenCalled();
  });
});
