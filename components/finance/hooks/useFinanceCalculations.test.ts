import { describe, it, expect } from 'vitest';
import {
  calculateTotalIncome,
  calculatePeopleShare,
  calculateTotalExpenses,
  calculateCategorySummary,
  calculateSettlementData,
  calculateFinancialSummary,
  calculateIncomeBreakdown,
  calculatePeopleShareWithIncomeTransactions,
} from './useFinanceCalculations';
import type { Person, Transaction, Category } from '@/lib/types';

// Helper to create mock people
const createPerson = (id: string, name: string, income: number): Person => ({
  id,
  name,
  income,
});

// Helper to create mock transactions
const createTransaction = (
  id: number,
  amount: number,
  paidBy: string,
  categoryId: string | null = 'cat1',
  type: 'expense' | 'income' = 'expense',
  isForecast = false,
  excludeFromSplit = false,
  isIncrement = true
): Transaction => ({
  id,
  description: 'Test',
  amount,
  categoryId,
  paidBy,
  isRecurring: false,
  isCreditCard: false,
  excludeFromSplit,
  isForecast,
  date: '2024-01-15',
  type,
  isIncrement,
});

// Helper to create mock categories
const createCategory = (id: string, name: string): Category => ({
  id,
  name,
  targetPercent: 10,
});

describe('useFinanceCalculations', () => {
  const personA = createPerson('p1', 'Alice', 6000);
  const personB = createPerson('p2', 'Bob', 4000);
  const people = [personA, personB];

  describe('calculateTotalIncome', () => {
    it('should sum incomes correctly', () => {
      expect(calculateTotalIncome(people)).toBe(10000);
    });

    it('should handle empty list', () => {
      expect(calculateTotalIncome([])).toBe(0);
    });
  });

  describe('calculatePeopleShare', () => {
    it('should calculate shares correctly', () => {
      const shares = calculatePeopleShare(people, 10000);
      expect(shares).toHaveLength(2);
      expect(shares.find(p => p.id === 'p1')?.sharePercent).toBe(0.6);
      expect(shares.find(p => p.id === 'p2')?.sharePercent).toBe(0.4);
    });

    it('should handle zero total income', () => {
      const result = calculatePeopleShare(people, 0);
      expect(result[0].sharePercent).toBe(0);
      expect(result[1].sharePercent).toBe(0);
    });
  });

  describe('calculateTotalExpenses', () => {
    it('should sum expenses correctly', () => {
      const transactions = [
        createTransaction(1, 100, 'p1'),
        createTransaction(2, 200, 'p2'),
      ];
      expect(calculateTotalExpenses(transactions)).toBe(300);
    });

    it('should ignore income transactions', () => {
      const transactions = [
        createTransaction(1, 100, 'p1', 'cat1', 'expense'),
        createTransaction(2, 200, 'p2', null, 'income'),
      ];
      expect(calculateTotalExpenses(transactions)).toBe(100);
    });

    it('should include forecast transactions by default', () => {
      const transactions = [
        createTransaction(1, 100, 'p1', 'cat1', 'expense', true), // Forecast
      ];
      expect(calculateTotalExpenses(transactions)).toBe(100);
    });

    it('should ignore transactions when excludeFromSplit is true', () => {
      const transactions = [
        createTransaction(1, 100, 'p1', 'cat1', 'expense', false, true), // Normal, excluded
        createTransaction(2, 200, 'p1', 'cat1', 'expense', true, true), // Forecast, excluded
      ];
      expect(calculateTotalExpenses(transactions)).toBe(0);
    });
  });

  describe('calculateCategorySummary', () => {
    it('should summarize by category', () => {
      const categories = [createCategory('cat1', 'Food'), createCategory('cat2', 'Rent')];
      const transactions = [
        createTransaction(1, 100, 'p1', 'cat1'),
        createTransaction(2, 50, 'p2', 'cat1'),
        createTransaction(3, 1000, 'p1', 'cat2'),
      ];

      const summary = calculateCategorySummary(categories, transactions, 10000);
      
      const food = summary.find(c => c.id === 'cat1');
      const rent = summary.find(c => c.id === 'cat2');

      expect(food?.totalSpent).toBe(150);
      expect(rent?.totalSpent).toBe(1000);
      expect(food?.realPercentOfIncome).toBe(1.5); // 150 / 10000 * 100
    });
  });

  describe('calculateSettlementData', () => {
    it('should calculate settlements correctly', () => {
      // Alice: 60% share, Bob: 40% share
      // Total expenses: 1000
      // Fair share: Alice 600, Bob 400
      // Alice paid 1000, Bob paid 0
      // Alice balance: 1000 - 600 = +400 (owed)
      // Bob balance: 0 - 400 = -400 (owes)

      const peopleWithShare = [
        { ...personA, sharePercent: 0.6 },
        { ...personB, sharePercent: 0.4 },
      ];
      const transactions = [createTransaction(1, 1000, 'p1')];
      
      const settlement = calculateSettlementData(peopleWithShare, transactions, 1000);

      const alice = settlement.find(p => p.id === 'p1');
      const bob = settlement.find(p => p.id === 'p2');

      expect(alice?.paidAmount).toBe(1000);
      expect(alice?.fairShareAmount).toBe(600);
      expect(alice?.balance).toBe(400);

      expect(bob?.paidAmount).toBe(0);
      expect(bob?.fairShareAmount).toBe(400);
      expect(bob?.balance).toBe(-400);
    });
  });

  describe('calculateIncomeBreakdown', () => {
    it('should calculate income breakdown correctly', () => {
      const transactions = [
        createTransaction(1, 1000, 'p1', null, 'income', false, false, true), // +1000
        createTransaction(2, 200, 'p1', null, 'income', false, false, false), // -200
      ];

      const breakdown = calculateIncomeBreakdown(transactions);
      expect(breakdown.totalIncomeIncrement).toBe(1000);
      expect(breakdown.totalIncomeDecrement).toBe(200);
      expect(breakdown.netIncome).toBe(800);
    });
  });

  describe('calculatePeopleShareWithIncomeTransactions', () => {
    it('should adjust shares based on income transactions', () => {
      // Alice base: 6000. Transaction: +1000 -> 7000
      // Bob base: 4000. Transaction: -500 -> 3500
      // Total effective: 10500
      // Alice share: 7000 / 10500 = 2/3 (~0.666)
      // Bob share: 3500 / 10500 = 1/3 (~0.333)

      const transactions = [
        createTransaction(1, 1000, 'p1', null, 'income', false, false, true),
        createTransaction(2, 500, 'p2', null, 'income', false, false, false),
      ];

      const result = calculatePeopleShareWithIncomeTransactions(people, transactions);
      
      const alice = result.find(p => p.id === 'p1');
      const bob = result.find(p => p.id === 'p2');

      expect(alice?.income).toBe(7000);
      expect(bob?.income).toBe(3500);
      expect(alice?.sharePercent).toBeCloseTo(2/3);
      expect(bob?.sharePercent).toBeCloseTo(1/3);
    });
  });
});
