import { describe, expect, it } from "vitest";
import {
  bulkDeleteBodySchema,
  bulkTransactionPatchSchema,
  bulkUpdateBodySchema,
  createPersonBodySchema,
  createTransactionSchema,
  createTransactionsBodySchema,
  transactionPatchSchema,
  transactionTypeSchema,
  updateCategoryBodySchema,
  updateDefaultPayerBodySchema,
  updatePersonBodySchema,
  updateTransactionBodySchema,
} from "../schemas";

describe("schemas", () => {
  describe("transactionTypeSchema", () => {
    it("accepts 'expense' as valid", () => {
      const result = transactionTypeSchema.safeParse("expense");
      expect(result.success).toBe(true);
    });

    it("accepts 'income' as valid", () => {
      const result = transactionTypeSchema.safeParse("income");
      expect(result.success).toBe(true);
    });

    it("rejects invalid transaction types", () => {
      const result = transactionTypeSchema.safeParse("transfer");
      expect(result.success).toBe(false);
    });
  });

  describe("createTransactionSchema", () => {
    const validTransaction = {
      description: "Groceries",
      amount: 150.5,
      categoryId: "cat-123",
      paidBy: "person-123",
      isRecurring: false,
      isCreditCard: true,
      excludeFromSplit: false,
      isForecast: false,
      date: "2024-03-15",
      type: "expense" as const,
      isIncrement: true,
    };

    it("accepts a valid transaction", () => {
      const result = createTransactionSchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
    });

    it("accepts transaction with null categoryId", () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        categoryId: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty description", () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        description: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects non-positive amount", () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        amount: 0,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative amount", () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        amount: -10,
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty paidBy", () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        paidBy: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid date format", () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        date: "03/15/2024",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid date format (missing leading zeros)", () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        date: "2024-3-15",
      });
      expect(result.success).toBe(false);
    });

    it("uses default values for optional fields", () => {
      const minimal = {
        description: "Test",
        amount: 100,
        categoryId: null,
        paidBy: "person-1",
        isRecurring: false,
        isCreditCard: false,
        excludeFromSplit: false,
        date: "2024-03-15",
      };
      const result = createTransactionSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isForecast).toBe(false);
        expect(result.data.type).toBe("expense");
        expect(result.data.isIncrement).toBe(true);
      }
    });
  });

  describe("createTransactionsBodySchema", () => {
    const validTransaction = {
      description: "Groceries",
      amount: 150.5,
      categoryId: "cat-123",
      paidBy: "person-123",
      isRecurring: false,
      isCreditCard: true,
      excludeFromSplit: false,
      isForecast: false,
      date: "2024-03-15",
      type: "expense" as const,
      isIncrement: true,
    };

    it("accepts a single transaction object", () => {
      const result = createTransactionsBodySchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
    });

    it("accepts an array of transactions", () => {
      const result = createTransactionsBodySchema.safeParse([
        validTransaction,
        { ...validTransaction, description: "Utilities" },
      ]);
      expect(result.success).toBe(true);
    });

    it("rejects empty array", () => {
      const result = createTransactionsBodySchema.safeParse([]);
      expect(result.success).toBe(false);
    });
  });

  describe("transactionPatchSchema", () => {
    it("accepts partial updates", () => {
      const result = transactionPatchSchema.safeParse({
        description: "Updated description",
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty object", () => {
      const result = transactionPatchSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("accepts all fields", () => {
      const result = transactionPatchSchema.safeParse({
        description: "Updated",
        amount: 200,
        categoryId: "new-cat",
        paidBy: "new-person",
        isRecurring: true,
        isCreditCard: false,
        excludeFromSplit: true,
        isForecast: true,
        date: "2024-04-01",
        type: "income",
        isIncrement: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkTransactionPatchSchema", () => {
    it("accepts partial updates without description/amount/date", () => {
      const result = bulkTransactionPatchSchema.safeParse({
        categoryId: "new-cat",
        isCreditCard: true,
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty object", () => {
      const result = bulkTransactionPatchSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("updateTransactionBodySchema", () => {
    it("accepts valid update body", () => {
      const result = updateTransactionBodySchema.safeParse({
        patch: { description: "Updated" },
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing patch", () => {
      const result = updateTransactionBodySchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("bulkUpdateBodySchema", () => {
    it("accepts valid bulk update", () => {
      const result = bulkUpdateBodySchema.safeParse({
        ids: [1, 2, 3],
        patch: { isCreditCard: true },
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty ids array", () => {
      const result = bulkUpdateBodySchema.safeParse({
        ids: [],
        patch: { isCreditCard: true },
      });
      expect(result.success).toBe(false);
    });

    it("rejects non-positive ids", () => {
      const result = bulkUpdateBodySchema.safeParse({
        ids: [1, 0, 3],
        patch: { isCreditCard: true },
      });
      expect(result.success).toBe(false);
    });

    it("rejects non-integer ids", () => {
      const result = bulkUpdateBodySchema.safeParse({
        ids: [1, 2.5, 3],
        patch: { isCreditCard: true },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("bulkDeleteBodySchema", () => {
    it("accepts valid ids array", () => {
      const result = bulkDeleteBodySchema.safeParse({
        ids: [1, 2, 3],
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty ids array", () => {
      const result = bulkDeleteBodySchema.safeParse({
        ids: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createPersonBodySchema", () => {
    it("accepts valid person data", () => {
      const result = createPersonBodySchema.safeParse({
        name: "John Doe",
        income: 5000,
      });
      expect(result.success).toBe(true);
    });

    it("accepts zero income", () => {
      const result = createPersonBodySchema.safeParse({
        name: "Jane Doe",
        income: 0,
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = createPersonBodySchema.safeParse({
        name: "",
        income: 5000,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative income", () => {
      const result = createPersonBodySchema.safeParse({
        name: "John",
        income: -100,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updatePersonBodySchema", () => {
    it("accepts valid update with name only", () => {
      const result = updatePersonBodySchema.safeParse({
        personId: "person-123",
        patch: { name: "New Name" },
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid update with income only", () => {
      const result = updatePersonBodySchema.safeParse({
        personId: "person-123",
        patch: { income: 6000 },
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid update with both fields", () => {
      const result = updatePersonBodySchema.safeParse({
        personId: "person-123",
        patch: { name: "New Name", income: 6000 },
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty personId", () => {
      const result = updatePersonBodySchema.safeParse({
        personId: "",
        patch: { name: "New Name" },
      });
      expect(result.success).toBe(false);
    });

    it("accepts empty patch", () => {
      const result = updatePersonBodySchema.safeParse({
        personId: "person-123",
        patch: {},
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateCategoryBodySchema", () => {
    it("accepts valid update with name only", () => {
      const result = updateCategoryBodySchema.safeParse({
        categoryId: "cat-123",
        patch: { name: "New Category" },
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid update with targetPercent only", () => {
      const result = updateCategoryBodySchema.safeParse({
        categoryId: "cat-123",
        patch: { targetPercent: 25 },
      });
      expect(result.success).toBe(true);
    });

    it("accepts targetPercent of 0", () => {
      const result = updateCategoryBodySchema.safeParse({
        categoryId: "cat-123",
        patch: { targetPercent: 0 },
      });
      expect(result.success).toBe(true);
    });

    it("accepts targetPercent of 100", () => {
      const result = updateCategoryBodySchema.safeParse({
        categoryId: "cat-123",
        patch: { targetPercent: 100 },
      });
      expect(result.success).toBe(true);
    });

    it("rejects targetPercent greater than 100", () => {
      const result = updateCategoryBodySchema.safeParse({
        categoryId: "cat-123",
        patch: { targetPercent: 101 },
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative targetPercent", () => {
      const result = updateCategoryBodySchema.safeParse({
        categoryId: "cat-123",
        patch: { targetPercent: -1 },
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty categoryId", () => {
      const result = updateCategoryBodySchema.safeParse({
        categoryId: "",
        patch: { name: "New Name" },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateDefaultPayerBodySchema", () => {
    it("accepts valid personId", () => {
      const result = updateDefaultPayerBodySchema.safeParse({
        personId: "person-123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty personId", () => {
      const result = updateDefaultPayerBodySchema.safeParse({
        personId: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing personId", () => {
      const result = updateDefaultPayerBodySchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
