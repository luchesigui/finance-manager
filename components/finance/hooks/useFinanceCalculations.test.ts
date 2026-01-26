import { describe, it, expect } from 'vitest'
import type { Category, Person, Transaction } from '@/lib/types'
import {
  calculateTotalIncome,
  calculatePeopleShare,
  calculateIncomeBreakdown,
  calculatePeopleShareWithIncomeTransactions,
  calculateTotalExpenses,
  calculateCategorySummary,
  calculateSettlementData,
  calculateFinancialSummary,
  getExpenseTransactions,
  getIncomeTransactions,
} from './useFinanceCalculations'

describe('useFinanceCalculations', () => {
  // Test data helpers
  const createPerson = (id: string, name: string, income: number): Person => ({
    id,
    name,
    income,
  })

  const createCategory = (id: string, name: string, targetPercent: number): Category => ({
    id,
    name,
    targetPercent,
  })

  const createTransaction = (
    overrides: Partial<Transaction> = {}
  ): Transaction => ({
    id: 1,
    description: 'Test transaction',
    amount: 100,
    categoryId: 'cat-1',
    paidBy: 'person-1',
    isRecurring: false,
    isCreditCard: false,
    excludeFromSplit: false,
    isForecast: false,
    date: '2024-03-15',
    type: 'expense',
    isIncrement: true,
    ...overrides,
  })

  describe('calculateTotalIncome', () => {
    it('should sum up income from all people', () => {
      const people = [
        createPerson('1', 'Alice', 5000),
        createPerson('2', 'Bob', 3000),
      ]
      expect(calculateTotalIncome(people)).toBe(8000)
    })

    it('should return 0 for empty array', () => {
      expect(calculateTotalIncome([])).toBe(0)
    })

    it('should handle single person', () => {
      const people = [createPerson('1', 'Alice', 5000)]
      expect(calculateTotalIncome(people)).toBe(5000)
    })

    it('should handle zero incomes', () => {
      const people = [
        createPerson('1', 'Alice', 0),
        createPerson('2', 'Bob', 0),
      ]
      expect(calculateTotalIncome(people)).toBe(0)
    })
  })

  describe('calculatePeopleShare', () => {
    it('should calculate share percentages based on income', () => {
      const people = [
        createPerson('1', 'Alice', 6000),
        createPerson('2', 'Bob', 4000),
      ]
      const result = calculatePeopleShare(people, 10000)

      expect(result[0].sharePercent).toBe(0.6)
      expect(result[1].sharePercent).toBe(0.4)
    })

    it('should handle zero total income by assigning 0% shares', () => {
      const people = [
        createPerson('1', 'Alice', 0),
        createPerson('2', 'Bob', 0),
      ]
      const result = calculatePeopleShare(people, 0)

      expect(result[0].sharePercent).toBe(0)
      expect(result[1].sharePercent).toBe(0)
    })

    it('should handle single person with 100% share', () => {
      const people = [createPerson('1', 'Alice', 5000)]
      const result = calculatePeopleShare(people, 5000)

      expect(result[0].sharePercent).toBe(1)
    })

    it('should handle equal incomes', () => {
      const people = [
        createPerson('1', 'Alice', 5000),
        createPerson('2', 'Bob', 5000),
      ]
      const result = calculatePeopleShare(people, 10000)

      expect(result[0].sharePercent).toBe(0.5)
      expect(result[1].sharePercent).toBe(0.5)
    })
  })

  describe('calculateIncomeBreakdown', () => {
    it('should calculate income breakdown correctly', () => {
      const transactions = [
        createTransaction({ type: 'income', amount: 1000, isIncrement: true }),
        createTransaction({ type: 'income', amount: 500, isIncrement: true }),
        createTransaction({ type: 'income', amount: 200, isIncrement: false }),
      ]

      const result = calculateIncomeBreakdown(transactions)

      expect(result.totalIncomeIncrement).toBe(1500)
      expect(result.totalIncomeDecrement).toBe(200)
      expect(result.netIncome).toBe(1300)
    })

    it('should ignore expense transactions', () => {
      const transactions = [
        createTransaction({ type: 'expense', amount: 1000 }),
        createTransaction({ type: 'income', amount: 500, isIncrement: true }),
      ]

      const result = calculateIncomeBreakdown(transactions)

      expect(result.totalIncomeIncrement).toBe(500)
      expect(result.totalIncomeDecrement).toBe(0)
      expect(result.netIncome).toBe(500)
    })

    it('should handle empty transactions', () => {
      const result = calculateIncomeBreakdown([])

      expect(result.totalIncomeIncrement).toBe(0)
      expect(result.totalIncomeDecrement).toBe(0)
      expect(result.netIncome).toBe(0)
    })

    it('should exclude forecast transactions with excludeFromSplit', () => {
      const transactions = [
        createTransaction({ type: 'income', amount: 1000, isIncrement: true, isForecast: true, excludeFromSplit: true }),
        createTransaction({ type: 'income', amount: 500, isIncrement: true }),
      ]

      const result = calculateIncomeBreakdown(transactions)

      expect(result.totalIncomeIncrement).toBe(500)
    })

    it('should include forecast transactions without excludeFromSplit', () => {
      const transactions = [
        createTransaction({ type: 'income', amount: 1000, isIncrement: true, isForecast: true, excludeFromSplit: false }),
      ]

      const result = calculateIncomeBreakdown(transactions)

      expect(result.totalIncomeIncrement).toBe(1000)
    })
  })

  describe('calculatePeopleShareWithIncomeTransactions', () => {
    it('should adjust share percentages based on income transactions', () => {
      const people = [
        createPerson('1', 'Alice', 5000),
        createPerson('2', 'Bob', 5000),
      ]
      const transactions = [
        createTransaction({ type: 'income', amount: 1000, isIncrement: true, paidBy: '1' }),
      ]

      const result = calculatePeopleShareWithIncomeTransactions(people, transactions)

      // Alice: 5000 + 1000 = 6000, Bob: 5000
      // Total: 11000
      expect(result[0].income).toBe(6000)
      expect(result[0].sharePercent).toBeCloseTo(6000 / 11000)
      expect(result[1].income).toBe(5000)
      expect(result[1].sharePercent).toBeCloseTo(5000 / 11000)
    })

    it('should handle income decrements', () => {
      const people = [
        createPerson('1', 'Alice', 5000),
        createPerson('2', 'Bob', 5000),
      ]
      const transactions = [
        createTransaction({ type: 'income', amount: 1000, isIncrement: false, paidBy: '1' }),
      ]

      const result = calculatePeopleShareWithIncomeTransactions(people, transactions)

      // Alice: 5000 - 1000 = 4000, Bob: 5000
      expect(result[0].income).toBe(4000)
      expect(result[1].income).toBe(5000)
    })

    it('should handle multiple income transactions for same person', () => {
      const people = [createPerson('1', 'Alice', 5000)]
      const transactions = [
        createTransaction({ type: 'income', amount: 1000, isIncrement: true, paidBy: '1' }),
        createTransaction({ type: 'income', amount: 500, isIncrement: true, paidBy: '1' }),
        createTransaction({ type: 'income', amount: 200, isIncrement: false, paidBy: '1' }),
      ]

      const result = calculatePeopleShareWithIncomeTransactions(people, transactions)

      // 5000 + 1000 + 500 - 200 = 6300
      expect(result[0].income).toBe(6300)
    })

    it('should return 0 shares when total income is 0', () => {
      const people = [
        createPerson('1', 'Alice', 0),
        createPerson('2', 'Bob', 0),
      ]

      const result = calculatePeopleShareWithIncomeTransactions(people, [])

      expect(result[0].sharePercent).toBe(0)
      expect(result[1].sharePercent).toBe(0)
    })
  })

  describe('calculateTotalExpenses', () => {
    it('should sum up expense transactions', () => {
      const transactions = [
        createTransaction({ type: 'expense', amount: 100 }),
        createTransaction({ type: 'expense', amount: 200 }),
        createTransaction({ type: 'expense', amount: 50 }),
      ]

      expect(calculateTotalExpenses(transactions)).toBe(350)
    })

    it('should ignore income transactions', () => {
      const transactions = [
        createTransaction({ type: 'expense', amount: 100 }),
        createTransaction({ type: 'income', amount: 500 }),
      ]

      expect(calculateTotalExpenses(transactions)).toBe(100)
    })

    it('should return 0 for empty transactions', () => {
      expect(calculateTotalExpenses([])).toBe(0)
    })

    it('should exclude forecast transactions with excludeFromSplit', () => {
      const transactions = [
        createTransaction({ type: 'expense', amount: 100, isForecast: true, excludeFromSplit: true }),
        createTransaction({ type: 'expense', amount: 200 }),
      ]

      expect(calculateTotalExpenses(transactions)).toBe(200)
    })
  })

  describe('calculateCategorySummary', () => {
    it('should calculate spending by category', () => {
      const categories = [
        createCategory('cat-1', 'Food', 30),
        createCategory('cat-2', 'Transport', 20),
      ]
      const transactions = [
        createTransaction({ categoryId: 'cat-1', amount: 300 }),
        createTransaction({ categoryId: 'cat-1', amount: 200 }),
        createTransaction({ categoryId: 'cat-2', amount: 100 }),
      ]
      const totalIncome = 1000

      const result = calculateCategorySummary(categories, transactions, totalIncome)

      expect(result[0].totalSpent).toBe(500)
      expect(result[0].realPercentOfIncome).toBe(50)
      expect(result[1].totalSpent).toBe(100)
      expect(result[1].realPercentOfIncome).toBe(10)
    })

    it('should handle categories with no spending', () => {
      const categories = [createCategory('cat-1', 'Food', 30)]
      const transactions: Transaction[] = []

      const result = calculateCategorySummary(categories, transactions, 1000)

      expect(result[0].totalSpent).toBe(0)
      expect(result[0].realPercentOfIncome).toBe(0)
    })

    it('should handle zero income by returning 0% for all categories', () => {
      const categories = [createCategory('cat-1', 'Food', 30)]
      const transactions = [createTransaction({ categoryId: 'cat-1', amount: 100 })]

      const result = calculateCategorySummary(categories, transactions, 0)

      expect(result[0].realPercentOfIncome).toBe(0)
    })

    it('should ignore transactions with null categoryId', () => {
      const categories = [createCategory('cat-1', 'Food', 30)]
      const transactions = [
        createTransaction({ categoryId: 'cat-1', amount: 100 }),
        createTransaction({ categoryId: null, amount: 200 }),
      ]

      const result = calculateCategorySummary(categories, transactions, 1000)

      expect(result[0].totalSpent).toBe(100)
    })

    it('should ignore income transactions', () => {
      const categories = [createCategory('cat-1', 'Food', 30)]
      const transactions = [
        createTransaction({ categoryId: 'cat-1', amount: 100, type: 'expense' }),
        createTransaction({ categoryId: 'cat-1', amount: 500, type: 'income' }),
      ]

      const result = calculateCategorySummary(categories, transactions, 1000)

      expect(result[0].totalSpent).toBe(100)
    })
  })

  describe('calculateSettlementData', () => {
    it('should calculate settlement balances correctly', () => {
      const peopleWithShare = [
        { ...createPerson('1', 'Alice', 6000), sharePercent: 0.6 },
        { ...createPerson('2', 'Bob', 4000), sharePercent: 0.4 },
      ]
      const transactions = [
        createTransaction({ paidBy: '1', amount: 500 }),
        createTransaction({ paidBy: '2', amount: 500 }),
      ]
      const totalExpenses = 1000

      const result = calculateSettlementData(peopleWithShare, transactions, totalExpenses)

      // Alice paid 500, fair share 600 (60% of 1000), balance = -100 (owes 100)
      expect(result[0].paidAmount).toBe(500)
      expect(result[0].fairShareAmount).toBe(600)
      expect(result[0].balance).toBe(-100)

      // Bob paid 500, fair share 400 (40% of 1000), balance = 100 (is owed 100)
      expect(result[1].paidAmount).toBe(500)
      expect(result[1].fairShareAmount).toBe(400)
      expect(result[1].balance).toBe(100)
    })

    it('should handle person who paid nothing', () => {
      const peopleWithShare = [
        { ...createPerson('1', 'Alice', 5000), sharePercent: 0.5 },
        { ...createPerson('2', 'Bob', 5000), sharePercent: 0.5 },
      ]
      const transactions = [
        createTransaction({ paidBy: '1', amount: 1000 }),
      ]
      const totalExpenses = 1000

      const result = calculateSettlementData(peopleWithShare, transactions, totalExpenses)

      expect(result[0].paidAmount).toBe(1000)
      expect(result[0].balance).toBe(500) // Paid 1000, owes 500
      expect(result[1].paidAmount).toBe(0)
      expect(result[1].balance).toBe(-500) // Paid 0, owes 500
    })

    it('should ignore income transactions', () => {
      const peopleWithShare = [
        { ...createPerson('1', 'Alice', 5000), sharePercent: 1 },
      ]
      const transactions = [
        createTransaction({ paidBy: '1', amount: 100, type: 'expense' }),
        createTransaction({ paidBy: '1', amount: 500, type: 'income' }),
      ]
      const totalExpenses = 100

      const result = calculateSettlementData(peopleWithShare, transactions, totalExpenses)

      expect(result[0].paidAmount).toBe(100)
    })
  })

  describe('calculateFinancialSummary', () => {
    it('should calculate all metrics in single pass', () => {
      const transactions = [
        createTransaction({ type: 'expense', amount: 100, categoryId: 'cat-1', paidBy: 'person-1' }),
        createTransaction({ type: 'expense', amount: 200, categoryId: 'cat-2', paidBy: 'person-2' }),
        createTransaction({ type: 'income', amount: 500, isIncrement: true, paidBy: 'person-1' }),
        createTransaction({ type: 'income', amount: 100, isIncrement: false, paidBy: 'person-2' }),
      ]

      const result = calculateFinancialSummary(transactions)

      expect(result.totalExpenses).toBe(300)
      expect(result.incomeBreakdown.totalIncomeIncrement).toBe(500)
      expect(result.incomeBreakdown.totalIncomeDecrement).toBe(100)
      expect(result.incomeBreakdown.netIncome).toBe(400)
      expect(result.categorySpending.get('cat-1')).toBe(100)
      expect(result.categorySpending.get('cat-2')).toBe(200)
      expect(result.personPayments.get('person-1')).toBe(100)
      expect(result.personPayments.get('person-2')).toBe(200)
      expect(result.personIncomeAdjustments.get('person-1')).toBe(500)
      expect(result.personIncomeAdjustments.get('person-2')).toBe(-100)
    })

    it('should handle empty transactions', () => {
      const result = calculateFinancialSummary([])

      expect(result.totalExpenses).toBe(0)
      expect(result.incomeBreakdown.netIncome).toBe(0)
      expect(result.categorySpending.size).toBe(0)
      expect(result.personPayments.size).toBe(0)
    })

    it('should exclude forecast transactions with excludeFromSplit', () => {
      const transactions = [
        createTransaction({ type: 'expense', amount: 100, isForecast: true, excludeFromSplit: true }),
        createTransaction({ type: 'expense', amount: 200 }),
      ]

      const result = calculateFinancialSummary(transactions)

      expect(result.totalExpenses).toBe(200)
    })
  })

  describe('getExpenseTransactions', () => {
    it('should filter expense transactions only', () => {
      const transactions = [
        createTransaction({ type: 'expense', amount: 100 }),
        createTransaction({ type: 'income', amount: 500 }),
        createTransaction({ type: 'expense', amount: 200 }),
      ]

      const result = getExpenseTransactions(transactions)

      expect(result).toHaveLength(2)
      expect(result[0].amount).toBe(100)
      expect(result[1].amount).toBe(200)
    })

    it('should exclude forecast transactions with excludeFromSplit', () => {
      const transactions = [
        createTransaction({ type: 'expense', amount: 100, isForecast: true, excludeFromSplit: true }),
        createTransaction({ type: 'expense', amount: 200 }),
      ]

      const result = getExpenseTransactions(transactions)

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(200)
    })
  })

  describe('getIncomeTransactions', () => {
    it('should filter income transactions only', () => {
      const transactions = [
        createTransaction({ type: 'expense', amount: 100 }),
        createTransaction({ type: 'income', amount: 500 }),
        createTransaction({ type: 'income', amount: 300 }),
      ]

      const result = getIncomeTransactions(transactions)

      expect(result).toHaveLength(2)
      expect(result[0].amount).toBe(500)
      expect(result[1].amount).toBe(300)
    })

    it('should exclude forecast transactions with excludeFromSplit', () => {
      const transactions = [
        createTransaction({ type: 'income', amount: 500, isForecast: true, excludeFromSplit: true }),
        createTransaction({ type: 'income', amount: 300 }),
      ]

      const result = getIncomeTransactions(transactions)

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(300)
    })
  })
})
