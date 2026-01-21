import type { Category, Person, Transaction } from "@/lib/types";
import { describe, expect, it } from "vitest";
import {
  calculateCategorySummary,
  calculateFinancialSummary,
  calculateIncomeBreakdown,
  calculatePeopleShare,
  calculatePeopleShareWithIncomeTransactions,
  calculateSettlementData,
  calculateTotalExpenses,
  calculateTotalIncome,
  getExpenseTransactions,
  getIncomeTransactions,
} from "../useFinanceCalculations";

// ============================================================================
// Test Fixtures
// ============================================================================

const createPerson = (overrides: Partial<Person> = {}): Person => ({
  id: "person-1",
  name: "John",
  income: 5000,
  ...overrides,
});

const createCategory = (overrides: Partial<Category> = {}): Category => ({
  id: "cat-1",
  name: "Groceries",
  targetPercent: 10,
  ...overrides,
});

const createTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 1,
  description: "Test transaction",
  amount: 100,
  categoryId: "cat-1",
  paidBy: "person-1",
  isRecurring: false,
  isCreditCard: false,
  excludeFromSplit: false,
  isForecast: false,
  date: "2024-03-15",
  type: "expense",
  isIncrement: true,
  ...overrides,
});

// ============================================================================
// Tests
// ============================================================================

describe("useFinanceCalculations", () => {
  describe("getExpenseTransactions", () => {
    it("filters out income transactions", () => {
      const transactions: Transaction[] = [
        createTransaction({ id: 1, type: "expense" }),
        createTransaction({ id: 2, type: "income" }),
        createTransaction({ id: 3, type: "expense" }),
      ];

      const result = getExpenseTransactions(transactions);

      expect(result).toHaveLength(2);
      expect(result.every((t) => t.type !== "income")).toBe(true);
    });

    it("excludes forecast transactions that are excluded from split", () => {
      const transactions: Transaction[] = [
        createTransaction({ id: 1, isForecast: true, excludeFromSplit: true }),
        createTransaction({ id: 2, isForecast: true, excludeFromSplit: false }),
        createTransaction({ id: 3, isForecast: false }),
      ];

      const result = getExpenseTransactions(transactions);

      expect(result).toHaveLength(2);
      expect(result.find((t) => t.id === 1)).toBeUndefined();
    });

    it("returns empty array when all transactions are income", () => {
      const transactions: Transaction[] = [
        createTransaction({ id: 1, type: "income" }),
        createTransaction({ id: 2, type: "income" }),
      ];

      const result = getExpenseTransactions(transactions);

      expect(result).toHaveLength(0);
    });
  });

  describe("getIncomeTransactions", () => {
    it("filters to only income transactions", () => {
      const transactions: Transaction[] = [
        createTransaction({ id: 1, type: "expense" }),
        createTransaction({ id: 2, type: "income" }),
        createTransaction({ id: 3, type: "income" }),
      ];

      const result = getIncomeTransactions(transactions);

      expect(result).toHaveLength(2);
      expect(result.every((t) => t.type === "income")).toBe(true);
    });

    it("excludes forecast income that is excluded from split", () => {
      const transactions: Transaction[] = [
        createTransaction({ id: 1, type: "income", isForecast: true, excludeFromSplit: true }),
        createTransaction({ id: 2, type: "income", isForecast: true, excludeFromSplit: false }),
        createTransaction({ id: 3, type: "income", isForecast: false }),
      ];

      const result = getIncomeTransactions(transactions);

      expect(result).toHaveLength(2);
    });
  });

  describe("calculateTotalIncome", () => {
    it("sums all person incomes", () => {
      const people: Person[] = [
        createPerson({ id: "p1", income: 5000 }),
        createPerson({ id: "p2", income: 3000 }),
        createPerson({ id: "p3", income: 2000 }),
      ];

      const result = calculateTotalIncome(people);

      expect(result).toBe(10000);
    });

    it("returns 0 for empty people array", () => {
      const result = calculateTotalIncome([]);

      expect(result).toBe(0);
    });

    it("handles single person", () => {
      const people: Person[] = [createPerson({ income: 5000 })];

      const result = calculateTotalIncome(people);

      expect(result).toBe(5000);
    });

    it("handles zero incomes", () => {
      const people: Person[] = [
        createPerson({ id: "p1", income: 0 }),
        createPerson({ id: "p2", income: 0 }),
      ];

      const result = calculateTotalIncome(people);

      expect(result).toBe(0);
    });
  });

  describe("calculatePeopleShare", () => {
    it("calculates share percentages based on income proportion", () => {
      const people: Person[] = [
        createPerson({ id: "p1", income: 6000 }),
        createPerson({ id: "p2", income: 4000 }),
      ];
      const totalIncome = 10000;

      const result = calculatePeopleShare(people, totalIncome);

      expect(result[0].sharePercent).toBe(0.6);
      expect(result[1].sharePercent).toBe(0.4);
    });

    it("returns 0 share for all when total income is 0", () => {
      const people: Person[] = [
        createPerson({ id: "p1", income: 0 }),
        createPerson({ id: "p2", income: 0 }),
      ];

      const result = calculatePeopleShare(people, 0);

      expect(result[0].sharePercent).toBe(0);
      expect(result[1].sharePercent).toBe(0);
    });

    it("handles single person with 100% share", () => {
      const people: Person[] = [createPerson({ id: "p1", income: 5000 })];

      const result = calculatePeopleShare(people, 5000);

      expect(result[0].sharePercent).toBe(1);
    });

    it("preserves original person data", () => {
      const people: Person[] = [createPerson({ id: "p1", name: "John", income: 5000 })];

      const result = calculatePeopleShare(people, 5000);

      expect(result[0].id).toBe("p1");
      expect(result[0].name).toBe("John");
      expect(result[0].income).toBe(5000);
    });
  });

  describe("calculateIncomeBreakdown", () => {
    it("calculates income increments and decrements separately", () => {
      const transactions: Transaction[] = [
        createTransaction({ id: 1, type: "income", amount: 1000, isIncrement: true }),
        createTransaction({ id: 2, type: "income", amount: 500, isIncrement: true }),
        createTransaction({ id: 3, type: "income", amount: 200, isIncrement: false }),
      ];

      const result = calculateIncomeBreakdown(transactions);

      expect(result.totalIncomeIncrement).toBe(1500);
      expect(result.totalIncomeDecrement).toBe(200);
      expect(result.netIncome).toBe(1300);
    });

    it("ignores expense transactions", () => {
      const transactions: Transaction[] = [
        createTransaction({ id: 1, type: "expense", amount: 1000 }),
        createTransaction({ id: 2, type: "income", amount: 500, isIncrement: true }),
      ];

      const result = calculateIncomeBreakdown(transactions);

      expect(result.totalIncomeIncrement).toBe(500);
      expect(result.totalIncomeDecrement).toBe(0);
      expect(result.netIncome).toBe(500);
    });

    it("returns zeros for empty transactions", () => {
      const result = calculateIncomeBreakdown([]);

      expect(result.totalIncomeIncrement).toBe(0);
      expect(result.totalIncomeDecrement).toBe(0);
      expect(result.netIncome).toBe(0);
    });

    it("excludes forecast income that is excluded from split", () => {
      const transactions: Transaction[] = [
        createTransaction({
          id: 1,
          type: "income",
          amount: 1000,
          isIncrement: true,
          isForecast: true,
          excludeFromSplit: true,
        }),
        createTransaction({
          id: 2,
          type: "income",
          amount: 500,
          isIncrement: true,
          isForecast: false,
        }),
      ];

      const result = calculateIncomeBreakdown(transactions);

      expect(result.totalIncomeIncrement).toBe(500);
    });
  });

  describe("calculatePeopleShareWithIncomeTransactions", () => {
    it("adjusts share based on income transactions", () => {
      const people: Person[] = [
        createPerson({ id: "p1", income: 5000 }),
        createPerson({ id: "p2", income: 5000 }),
      ];
      const transactions: Transaction[] = [
        createTransaction({
          id: 1,
          type: "income",
          amount: 2000,
          paidBy: "p1",
          isIncrement: true,
        }),
      ];

      const result = calculatePeopleShareWithIncomeTransactions(people, transactions);

      // p1 effective: 5000 + 2000 = 7000
      // p2 effective: 5000
      // Total: 12000
      expect(result[0].income).toBe(7000);
      expect(result[0].sharePercent).toBeCloseTo(7000 / 12000);
      expect(result[1].income).toBe(5000);
      expect(result[1].sharePercent).toBeCloseTo(5000 / 12000);
    });

    it("handles income decrements", () => {
      const people: Person[] = [
        createPerson({ id: "p1", income: 5000 }),
        createPerson({ id: "p2", income: 5000 }),
      ];
      const transactions: Transaction[] = [
        createTransaction({
          id: 1,
          type: "income",
          amount: 1000,
          paidBy: "p1",
          isIncrement: false,
        }),
      ];

      const result = calculatePeopleShareWithIncomeTransactions(people, transactions);

      // p1 effective: 5000 - 1000 = 4000
      expect(result[0].income).toBe(4000);
    });

    it("returns original shares when no income transactions", () => {
      const people: Person[] = [
        createPerson({ id: "p1", income: 6000 }),
        createPerson({ id: "p2", income: 4000 }),
      ];
      const transactions: Transaction[] = [
        createTransaction({ id: 1, type: "expense", amount: 100 }),
      ];

      const result = calculatePeopleShareWithIncomeTransactions(people, transactions);

      expect(result[0].sharePercent).toBe(0.6);
      expect(result[1].sharePercent).toBe(0.4);
    });
  });

  describe("calculateTotalExpenses", () => {
    it("sums all expense transactions", () => {
      const transactions: Transaction[] = [
        createTransaction({ id: 1, type: "expense", amount: 100 }),
        createTransaction({ id: 2, type: "expense", amount: 200 }),
        createTransaction({ id: 3, type: "expense", amount: 50 }),
      ];

      const result = calculateTotalExpenses(transactions);

      expect(result).toBe(350);
    });

    it("ignores income transactions", () => {
      const transactions: Transaction[] = [
        createTransaction({ id: 1, type: "expense", amount: 100 }),
        createTransaction({ id: 2, type: "income", amount: 500 }),
      ];

      const result = calculateTotalExpenses(transactions);

      expect(result).toBe(100);
    });

    it("returns 0 for empty transactions", () => {
      const result = calculateTotalExpenses([]);

      expect(result).toBe(0);
    });

    it("excludes forecast expenses that are excluded from split", () => {
      const transactions: Transaction[] = [
        createTransaction({
          id: 1,
          type: "expense",
          amount: 100,
          isForecast: true,
          excludeFromSplit: true,
        }),
        createTransaction({
          id: 2,
          type: "expense",
          amount: 200,
          isForecast: false,
        }),
      ];

      const result = calculateTotalExpenses(transactions);

      expect(result).toBe(200);
    });
  });

  describe("calculateCategorySummary", () => {
    it("calculates spending totals per category", () => {
      const categories: Category[] = [
        createCategory({ id: "cat-1", name: "Groceries", targetPercent: 10 }),
        createCategory({ id: "cat-2", name: "Utilities", targetPercent: 5 }),
      ];
      const transactions: Transaction[] = [
        createTransaction({ id: 1, categoryId: "cat-1", amount: 100 }),
        createTransaction({ id: 2, categoryId: "cat-1", amount: 50 }),
        createTransaction({ id: 3, categoryId: "cat-2", amount: 200 }),
      ];

      const result = calculateCategorySummary(categories, transactions, 10000);

      expect(result[0].totalSpent).toBe(150);
      expect(result[1].totalSpent).toBe(200);
    });

    it("calculates percentage of income spent per category", () => {
      const categories: Category[] = [
        createCategory({ id: "cat-1", name: "Groceries", targetPercent: 10 }),
      ];
      const transactions: Transaction[] = [
        createTransaction({ id: 1, categoryId: "cat-1", amount: 1000 }),
      ];

      const result = calculateCategorySummary(categories, transactions, 10000);

      expect(result[0].realPercentOfIncome).toBe(10); // 1000/10000 * 100
    });

    it("handles categories with no transactions", () => {
      const categories: Category[] = [
        createCategory({ id: "cat-1", name: "Groceries", targetPercent: 10 }),
      ];

      const result = calculateCategorySummary(categories, [], 10000);

      expect(result[0].totalSpent).toBe(0);
      expect(result[0].realPercentOfIncome).toBe(0);
    });

    it("handles zero total income", () => {
      const categories: Category[] = [
        createCategory({ id: "cat-1", name: "Groceries", targetPercent: 10 }),
      ];
      const transactions: Transaction[] = [
        createTransaction({ id: 1, categoryId: "cat-1", amount: 100 }),
      ];

      const result = calculateCategorySummary(categories, transactions, 0);

      expect(result[0].totalSpent).toBe(100);
      expect(result[0].realPercentOfIncome).toBe(0);
    });

    it("ignores income transactions", () => {
      const categories: Category[] = [
        createCategory({ id: "cat-1", name: "Groceries", targetPercent: 10 }),
      ];
      const transactions: Transaction[] = [
        createTransaction({ id: 1, categoryId: "cat-1", amount: 100, type: "expense" }),
        createTransaction({ id: 2, categoryId: "cat-1", amount: 500, type: "income" }),
      ];

      const result = calculateCategorySummary(categories, transactions, 10000);

      expect(result[0].totalSpent).toBe(100);
    });

    it("ignores transactions without categoryId", () => {
      const categories: Category[] = [
        createCategory({ id: "cat-1", name: "Groceries", targetPercent: 10 }),
      ];
      const transactions: Transaction[] = [
        createTransaction({ id: 1, categoryId: "cat-1", amount: 100 }),
        createTransaction({ id: 2, categoryId: null, amount: 500 }),
      ];

      const result = calculateCategorySummary(categories, transactions, 10000);

      expect(result[0].totalSpent).toBe(100);
    });
  });

  describe("calculateSettlementData", () => {
    it("calculates settlement data correctly", () => {
      const peopleWithShare = [
        { ...createPerson({ id: "p1" }), sharePercent: 0.6 },
        { ...createPerson({ id: "p2" }), sharePercent: 0.4 },
      ];
      const transactions: Transaction[] = [
        createTransaction({ id: 1, paidBy: "p1", amount: 800 }),
        createTransaction({ id: 2, paidBy: "p2", amount: 200 }),
      ];
      const totalExpenses = 1000;

      const result = calculateSettlementData(peopleWithShare, transactions, totalExpenses);

      // p1: paid 800, fair share 600 (60%), balance +200
      expect(result[0].paidAmount).toBe(800);
      expect(result[0].fairShareAmount).toBe(600);
      expect(result[0].balance).toBe(200);

      // p2: paid 200, fair share 400 (40%), balance -200
      expect(result[1].paidAmount).toBe(200);
      expect(result[1].fairShareAmount).toBe(400);
      expect(result[1].balance).toBe(-200);
    });

    it("handles person with no payments", () => {
      const peopleWithShare = [
        { ...createPerson({ id: "p1" }), sharePercent: 0.5 },
        { ...createPerson({ id: "p2" }), sharePercent: 0.5 },
      ];
      const transactions: Transaction[] = [
        createTransaction({ id: 1, paidBy: "p1", amount: 1000 }),
      ];

      const result = calculateSettlementData(peopleWithShare, transactions, 1000);

      expect(result[0].paidAmount).toBe(1000);
      expect(result[0].balance).toBe(500); // paid 1000, owes 500

      expect(result[1].paidAmount).toBe(0);
      expect(result[1].balance).toBe(-500); // paid 0, owes 500
    });

    it("ignores income transactions in settlement", () => {
      const peopleWithShare = [{ ...createPerson({ id: "p1" }), sharePercent: 1 }];
      const transactions: Transaction[] = [
        createTransaction({ id: 1, paidBy: "p1", amount: 100, type: "expense" }),
        createTransaction({ id: 2, paidBy: "p1", amount: 500, type: "income" }),
      ];

      const result = calculateSettlementData(peopleWithShare, transactions, 100);

      expect(result[0].paidAmount).toBe(100);
    });

    it("handles zero total expenses", () => {
      const peopleWithShare = [
        { ...createPerson({ id: "p1" }), sharePercent: 0.5 },
        { ...createPerson({ id: "p2" }), sharePercent: 0.5 },
      ];

      const result = calculateSettlementData(peopleWithShare, [], 0);

      expect(result[0].paidAmount).toBe(0);
      expect(result[0].fairShareAmount).toBe(0);
      expect(result[0].balance).toBe(0);
    });
  });

  describe("calculateFinancialSummary (single-pass)", () => {
    it("calculates all metrics in single pass", () => {
      const transactions: Transaction[] = [
        createTransaction({
          id: 1,
          type: "expense",
          categoryId: "cat-1",
          paidBy: "p1",
          amount: 100,
        }),
        createTransaction({
          id: 2,
          type: "expense",
          categoryId: "cat-1",
          paidBy: "p1",
          amount: 50,
        }),
        createTransaction({
          id: 3,
          type: "expense",
          categoryId: "cat-2",
          paidBy: "p2",
          amount: 200,
        }),
        createTransaction({ id: 4, type: "income", paidBy: "p1", amount: 500, isIncrement: true }),
        createTransaction({ id: 5, type: "income", paidBy: "p2", amount: 100, isIncrement: false }),
      ];

      const result = calculateFinancialSummary(transactions);

      // Total expenses
      expect(result.totalExpenses).toBe(350);

      // Income breakdown
      expect(result.incomeBreakdown.totalIncomeIncrement).toBe(500);
      expect(result.incomeBreakdown.totalIncomeDecrement).toBe(100);
      expect(result.incomeBreakdown.netIncome).toBe(400);

      // Category spending
      expect(result.categorySpending.get("cat-1")).toBe(150);
      expect(result.categorySpending.get("cat-2")).toBe(200);

      // Person payments
      expect(result.personPayments.get("p1")).toBe(150);
      expect(result.personPayments.get("p2")).toBe(200);

      // Person income adjustments
      expect(result.personIncomeAdjustments.get("p1")).toBe(500);
      expect(result.personIncomeAdjustments.get("p2")).toBe(-100);
    });

    it("handles empty transactions", () => {
      const result = calculateFinancialSummary([]);

      expect(result.totalExpenses).toBe(0);
      expect(result.incomeBreakdown.netIncome).toBe(0);
      expect(result.categorySpending.size).toBe(0);
      expect(result.personPayments.size).toBe(0);
    });

    it("handles transactions without categoryId", () => {
      const transactions: Transaction[] = [
        createTransaction({ id: 1, type: "expense", categoryId: null, amount: 100 }),
      ];

      const result = calculateFinancialSummary(transactions);

      expect(result.totalExpenses).toBe(100);
      expect(result.categorySpending.size).toBe(0);
    });

    it("excludes forecast transactions that are excluded from split", () => {
      const transactions: Transaction[] = [
        createTransaction({
          id: 1,
          type: "expense",
          amount: 100,
          isForecast: true,
          excludeFromSplit: true,
        }),
        createTransaction({
          id: 2,
          type: "expense",
          amount: 200,
          isForecast: false,
        }),
      ];

      const result = calculateFinancialSummary(transactions);

      expect(result.totalExpenses).toBe(200);
    });
  });
});
