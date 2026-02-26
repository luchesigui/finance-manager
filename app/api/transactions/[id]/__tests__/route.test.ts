import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/requestBodyValidation", () => ({
  requireAuth: vi.fn(),
  readJsonBody: vi.fn(),
  validateBody: vi.fn(),
  parseNumericId: vi.fn(),
}));

vi.mock("@/features/transactions/server/store", () => ({
  getTransaction: vi.fn(),
  updateTransaction: vi.fn(),
}));

vi.mock("@/features/recurring-templates/server/store", () => ({
  createRecurringTemplate: vi.fn(),
}));

import { PATCH } from "@/app/api/transactions/[id]/route";
import { createRecurringTemplate } from "@/features/recurring-templates/server/store";
import { getTransaction, updateTransaction } from "@/features/transactions/server/store";
import {
  parseNumericId,
  readJsonBody,
  requireAuth,
  validateBody,
} from "@/lib/server/requestBodyValidation";

const existingTransaction = {
  id: 42,
  description: "Netflix",
  amount: 45,
  categoryId: "c1",
  paidBy: "p1",
  recurringTemplateId: null,
  isCreditCard: false,
  isNextBilling: false,
  excludeFromSplit: false,
  isForecast: false,
  date: "2025-02-15",
  type: "expense" as const,
  isIncrement: true,
};

describe("PATCH /api/transactions/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue({ success: true, userId: "u1" });
    vi.mocked(parseNumericId).mockReturnValue(42);
    vi.mocked(getTransaction).mockResolvedValue(existingTransaction as never);
    vi.mocked(updateTransaction).mockResolvedValue({
      ...existingTransaction,
      description: "Updated",
    } as never);
  });

  it("updates transaction when patch has no isRecurring", async () => {
    vi.mocked(readJsonBody).mockResolvedValue({
      patch: { description: "Updated" },
    });
    vi.mocked(validateBody).mockReturnValue({
      success: true,
      data: { patch: { description: "Updated" } },
    });

    const response = await PATCH(
      new Request("http://localhost/api/transactions/42", { method: "PATCH" }),
      { params: Promise.resolve({ id: "42" }) },
    );

    expect(response.status).toBe(200);
    expect(updateTransaction).toHaveBeenCalledWith(42, { description: "Updated" });
    expect(createRecurringTemplate).not.toHaveBeenCalled();
  });

  it("when isRecurring true and transaction has no template, creates template and links transaction", async () => {
    vi.mocked(readJsonBody).mockResolvedValue({
      patch: {
        description: "Netflix",
        amount: 45,
        categoryId: "c1",
        paidBy: "p1",
        type: "expense",
        isIncrement: true,
        isCreditCard: false,
        isNextBilling: false,
        excludeFromSplit: false,
        isRecurring: true,
      },
    });
    vi.mocked(validateBody).mockReturnValue({
      success: true,
      data: {
        patch: {
          description: "Netflix",
          amount: 45,
          categoryId: "c1",
          paidBy: "p1",
          type: "expense",
          isIncrement: true,
          isCreditCard: false,
          isNextBilling: false,
          excludeFromSplit: false,
          isRecurring: true,
        },
      },
    });
    const createdTemplate = {
      id: 99,
      description: "Netflix",
      amount: 45,
      categoryId: "c1",
      paidBy: "p1",
      type: "expense" as const,
      isIncrement: true,
      isCreditCard: false,
      isNextBilling: false,
      excludeFromSplit: false,
      dayOfMonth: 15,
      isActive: true,
    };
    vi.mocked(createRecurringTemplate).mockResolvedValue(createdTemplate as never);
    vi.mocked(updateTransaction).mockResolvedValue({
      ...existingTransaction,
      recurringTemplateId: 99,
    } as never);

    const response = await PATCH(
      new Request("http://localhost/api/transactions/42", { method: "PATCH" }),
      { params: Promise.resolve({ id: "42" }) },
    );

    expect(response.status).toBe(200);
    expect(createRecurringTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Netflix",
        amount: 45,
        categoryId: "c1",
        paidBy: "p1",
        type: "expense",
        isIncrement: true,
        isCreditCard: false,
        isNextBilling: false,
        excludeFromSplit: false,
        dayOfMonth: 15,
        isActive: true,
      }),
    );
    expect(updateTransaction).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        recurringTemplateId: 99,
        description: "Netflix",
        amount: 45,
      }),
    );
  });

  it("when isRecurring false and transaction has template, unlinks transaction", async () => {
    vi.mocked(getTransaction).mockResolvedValue({
      ...existingTransaction,
      recurringTemplateId: 77,
    } as never);
    vi.mocked(readJsonBody).mockResolvedValue({
      patch: { isRecurring: false, description: "Netflix" },
    });
    vi.mocked(validateBody).mockReturnValue({
      success: true,
      data: {
        patch: { isRecurring: false, description: "Netflix" },
      },
    });
    vi.mocked(updateTransaction).mockResolvedValue({
      ...existingTransaction,
      recurringTemplateId: null,
      description: "Netflix",
    } as never);

    const response = await PATCH(
      new Request("http://localhost/api/transactions/42", { method: "PATCH" }),
      { params: Promise.resolve({ id: "42" }) },
    );

    expect(response.status).toBe(200);
    expect(createRecurringTemplate).not.toHaveBeenCalled();
    expect(updateTransaction).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        recurringTemplateId: null,
        description: "Netflix",
      }),
    );
  });
});
