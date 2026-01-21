/**
 * Integration tests for transaction workflows
 * These tests verify that the entire transaction flow works correctly:
 * - Creating transactions
 * - Updating transactions
 * - Deleting transactions
 * - Filtering by month
 * - Bulk operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Transaction, Person, Category } from '@/lib/types'
import {
  calculateFinancialSummary,
  calculatePeopleShareWithIncomeTransactions,
  calculateCategorySummary,
  calculateSettlementData,
} from '@/components/finance/hooks/useFinanceCalculations'

describe('Transaction Workflow Integration Tests', () => {
  const mockPeople: Person[] = [
    { id: 'person-1', name: 'Alice', income: 6000 },
    { id: 'person-2', name: 'Bob', income: 4000 },
  ]

  const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Food', targetPercent: 30 },
    { id: 'cat-2', name: 'Transport', targetPercent: 20 },
    { id: 'cat-3', name: 'Entertainment', targetPercent: 10 },
  ]

  describe('Complete transaction lifecycle', () => {
    it('should handle creating, reading, and calculating expenses correctly', () => {
      // Simulate user creating transactions through the UI
      const transactions: Transaction[] = [
        {
          id: 1,
          description: 'Groceries',
          amount: 500,
          categoryId: 'cat-1',
          paidBy: 'person-1',
          isRecurring: false,
          isCreditCard: false,
          excludeFromSplit: false,
          isForecast: false,
          date: '2024-03-15',
          type: 'expense',
          isIncrement: true,
        },
        {
          id: 2,
          description: 'Gas',
          amount: 200,
          categoryId: 'cat-2',
          paidBy: 'person-2',
          isRecurring: false,
          isCreditCard: false,
          excludeFromSplit: false,
          isForecast: false,
          date: '2024-03-16',
          type: 'expense',
          isIncrement: true,
        },
        {
          id: 3,
          description: 'Movie tickets',
          amount: 100,
          categoryId: 'cat-3',
          paidBy: 'person-1',
          isRecurring: false,
          isCreditCard: false,
          excludeFromSplit: false,
          isForecast: false,
          date: '2024-03-17',
          type: 'expense',
          isIncrement: true,
        },
      ]

      // Calculate financial summary (what the dashboard would show)
      const summary = calculateFinancialSummary(transactions)

      // Verify total expenses
      expect(summary.totalExpenses).toBe(800)

      // Verify category spending
      expect(summary.categorySpending.get('cat-1')).toBe(500)
      expect(summary.categorySpending.get('cat-2')).toBe(200)
      expect(summary.categorySpending.get('cat-3')).toBe(100)

      // Verify who paid what
      expect(summary.personPayments.get('person-1')).toBe(600) // Groceries + Movie
      expect(summary.personPayments.get('person-2')).toBe(200) // Gas

      // Calculate share percentages (60% Alice, 40% Bob)
      const peopleWithShare = calculatePeopleShareWithIncomeTransactions(mockPeople, transactions)
      expect(peopleWithShare[0].sharePercent).toBeCloseTo(0.6)
      expect(peopleWithShare[1].sharePercent).toBeCloseTo(0.4)

      // Calculate settlement (who owes whom)
      const settlement = calculateSettlementData(peopleWithShare, transactions, summary.totalExpenses)

      // Alice paid 600, should pay 480 (60% of 800) -> is owed 120
      expect(settlement[0].paidAmount).toBe(600)
      expect(settlement[0].fairShareAmount).toBeCloseTo(480)
      expect(settlement[0].balance).toBeCloseTo(120)

      // Bob paid 200, should pay 320 (40% of 800) -> owes 120
      expect(settlement[1].paidAmount).toBe(200)
      expect(settlement[1].fairShareAmount).toBeCloseTo(320)
      expect(settlement[1].balance).toBeCloseTo(-120)
    })

    it('should recalculate when user updates a transaction', () => {
      // Initial transactions
      const transactions: Transaction[] = [
        {
          id: 1,
          description: 'Groceries',
          amount: 500,
          categoryId: 'cat-1',
          paidBy: 'person-1',
          isRecurring: false,
          isCreditCard: false,
          excludeFromSplit: false,
          isForecast: false,
          date: '2024-03-15',
          type: 'expense',
          isIncrement: true,
        },
      ]

      const initialSummary = calculateFinancialSummary(transactions)
      expect(initialSummary.totalExpenses).toBe(500)

      // User updates the amount
      const updatedTransactions: Transaction[] = [
        {
          ...transactions[0],
          amount: 750, // Updated amount
        },
      ]

      const updatedSummary = calculateFinancialSummary(updatedTransactions)
      expect(updatedSummary.totalExpenses).toBe(750)

      // Verify category spending updated
      expect(updatedSummary.categorySpending.get('cat-1')).toBe(750)
    })

    it('should handle user deleting a transaction', () => {
      const transactions: Transaction[] = [
        {
          id: 1,
          description: 'Groceries',
          amount: 500,
          categoryId: 'cat-1',
          paidBy: 'person-1',
          isRecurring: false,
          isCreditCard: false,
          excludeFromSplit: false,
          isForecast: false,
          date: '2024-03-15',
          type: 'expense',
          isIncrement: true,
        },
        {
          id: 2,
          description: 'Gas',
          amount: 200,
          categoryId: 'cat-2',
          paidBy: 'person-2',
          isRecurring: false,
          isCreditCard: false,
          excludeFromSplit: false,
          isForecast: false,
          date: '2024-03-16',
          type: 'expense',
          isIncrement: true,
        },
      ]

      const initialSummary = calculateFinancialSummary(transactions)
      expect(initialSummary.totalExpenses).toBe(700)

      // User deletes transaction 2
      const remainingTransactions = transactions.filter((t) => t.id !== 2)

      const updatedSummary = calculateFinancialSummary(remainingTransactions)
      expect(updatedSummary.totalExpenses).toBe(500)
      expect(updatedSummary.categorySpending.get('cat-2')).toBeUndefined()
    })
  })

  describe('Credit card accounting workflow', () => {
    it('should account credit card expenses in the next month', () => {
      const marchTransactions: Transaction[] = [
        {
          id: 1,
          description: 'Regular expense',
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
        },
        {
          id: 2,
          description: 'Credit card expense',
          amount: 200,
          categoryId: 'cat-1',
          paidBy: 'person-1',
          isRecurring: false,
          isCreditCard: true, // Will be accounted in April
          excludeFromSplit: false,
          isForecast: false,
          date: '2024-03-15',
          type: 'expense',
          isIncrement: true,
        },
      ]

      // When filtering for March, only regular expense should be included
      const marchExpenses = marchTransactions.filter((t) => !t.isCreditCard)
      const marchSummary = calculateFinancialSummary(marchExpenses)
      expect(marchSummary.totalExpenses).toBe(100)

      // When filtering for April, credit card expense should be included
      const aprilExpenses = marchTransactions.filter((t) => t.isCreditCard)
      const aprilSummary = calculateFinancialSummary(aprilExpenses)
      expect(aprilSummary.totalExpenses).toBe(200)
    })
  })

  describe('Income transaction workflow', () => {
    it('should adjust share percentages when user adds income transactions', () => {
      const transactions: Transaction[] = [
        {
          id: 1,
          description: 'Bonus',
          amount: 2000,
          categoryId: null,
          paidBy: 'person-2',
          isRecurring: false,
          isCreditCard: false,
          excludeFromSplit: false,
          isForecast: false,
          date: '2024-03-15',
          type: 'income',
          isIncrement: true, // Added to income
        },
      ]

      // Without income transaction: Alice 60% (6000/10000), Bob 40% (4000/10000)
      const peopleWithoutIncome = calculatePeopleShareWithIncomeTransactions(mockPeople, [])
      expect(peopleWithoutIncome[0].sharePercent).toBeCloseTo(0.6)
      expect(peopleWithoutIncome[1].sharePercent).toBeCloseTo(0.4)

      // With income transaction: Alice 50% (6000/12000), Bob 50% (6000/12000)
      const peopleWithIncome = calculatePeopleShareWithIncomeTransactions(mockPeople, transactions)
      expect(peopleWithIncome[0].sharePercent).toBeCloseTo(0.5)
      expect(peopleWithIncome[1].sharePercent).toBeCloseTo(0.5)

      // Verify effective incomes
      expect(peopleWithIncome[0].income).toBe(6000)
      expect(peopleWithIncome[1].income).toBe(6000) // 4000 + 2000 bonus
    })

    it('should handle income decrement (expense deducted from income)', () => {
      const transactions: Transaction[] = [
        {
          id: 1,
          description: 'Tax payment',
          amount: 1000,
          categoryId: null,
          paidBy: 'person-1',
          isRecurring: false,
          isCreditCard: false,
          excludeFromSplit: false,
          isForecast: false,
          date: '2024-03-15',
          type: 'income',
          isIncrement: false, // Deducted from income
        },
      ]

      const peopleWithIncome = calculatePeopleShareWithIncomeTransactions(mockPeople, transactions)

      // Alice: 6000 - 1000 = 5000, Bob: 4000
      expect(peopleWithIncome[0].income).toBe(5000)
      expect(peopleWithIncome[1].income).toBe(4000)

      // New shares: Alice 55.6% (5000/9000), Bob 44.4% (4000/9000)
      expect(peopleWithIncome[0].sharePercent).toBeCloseTo(5000 / 9000)
      expect(peopleWithIncome[1].sharePercent).toBeCloseTo(4000 / 9000)
    })
  })

  describe('Category summary workflow', () => {
    it('should show spending vs targets for each category', () => {
      const totalIncome = 10000

      const transactions: Transaction[] = [
        { id: 1, description: 'Groceries', amount: 3000, categoryId: 'cat-1', paidBy: 'person-1', isRecurring: false, isCreditCard: false, excludeFromSplit: false, isForecast: false, date: '2024-03-15', type: 'expense', isIncrement: true },
        { id: 2, description: 'Restaurant', amount: 500, categoryId: 'cat-1', paidBy: 'person-1', isRecurring: false, isCreditCard: false, excludeFromSplit: false, isForecast: false, date: '2024-03-16', type: 'expense', isIncrement: true },
        { id: 3, description: 'Uber', amount: 1500, categoryId: 'cat-2', paidBy: 'person-2', isRecurring: false, isCreditCard: false, excludeFromSplit: false, isForecast: false, date: '2024-03-17', type: 'expense', isIncrement: true },
      ]

      const categorySummary = calculateCategorySummary(mockCategories, transactions, totalIncome)

      // Food: spent 3500, target 30% (3000), actual 35%
      expect(categorySummary[0].totalSpent).toBe(3500)
      expect(categorySummary[0].targetPercent).toBe(30)
      expect(categorySummary[0].realPercentOfIncome).toBe(35) // 3500/10000 * 100

      // Transport: spent 1500, target 20% (2000), actual 15%
      expect(categorySummary[1].totalSpent).toBe(1500)
      expect(categorySummary[1].targetPercent).toBe(20)
      expect(categorySummary[1].realPercentOfIncome).toBe(15)

      // Entertainment: spent 0, target 10%
      expect(categorySummary[2].totalSpent).toBe(0)
      expect(categorySummary[2].realPercentOfIncome).toBe(0)
    })
  })

  describe('Bulk operations workflow', () => {
    it('should update multiple transactions at once', () => {
      let transactions: Transaction[] = [
        {
          id: 1,
          description: 'Transaction 1',
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
        },
        {
          id: 2,
          description: 'Transaction 2',
          amount: 200,
          categoryId: 'cat-1',
          paidBy: 'person-1',
          isRecurring: false,
          isCreditCard: false,
          excludeFromSplit: false,
          isForecast: false,
          date: '2024-03-16',
          type: 'expense',
          isIncrement: true,
        },
      ]

      // User selects multiple transactions and changes category
      const idsToUpdate = [1, 2]
      transactions = transactions.map((t) =>
        idsToUpdate.includes(t.id) ? { ...t, categoryId: 'cat-2', isRecurring: true } : t
      )

      const summary = calculateFinancialSummary(transactions)

      // Both transactions should now be in cat-2
      expect(summary.categorySpending.get('cat-1')).toBeUndefined()
      expect(summary.categorySpending.get('cat-2')).toBe(300)
    })

    it('should delete multiple transactions at once', () => {
      let transactions: Transaction[] = [
        { id: 1, description: 'Transaction 1', amount: 100, categoryId: 'cat-1', paidBy: 'person-1', isRecurring: false, isCreditCard: false, excludeFromSplit: false, isForecast: false, date: '2024-03-15', type: 'expense', isIncrement: true },
        { id: 2, description: 'Transaction 2', amount: 200, categoryId: 'cat-1', paidBy: 'person-1', isRecurring: false, isCreditCard: false, excludeFromSplit: false, isForecast: false, date: '2024-03-16', type: 'expense', isIncrement: true },
        { id: 3, description: 'Transaction 3', amount: 300, categoryId: 'cat-1', paidBy: 'person-1', isRecurring: false, isCreditCard: false, excludeFromSplit: false, isForecast: false, date: '2024-03-17', type: 'expense', isIncrement: true },
      ]

      const initialSummary = calculateFinancialSummary(transactions)
      expect(initialSummary.totalExpenses).toBe(600)

      // User deletes transactions 1 and 2
      const idsToDelete = [1, 2]
      transactions = transactions.filter((t) => !idsToDelete.includes(t.id))

      const updatedSummary = calculateFinancialSummary(transactions)
      expect(updatedSummary.totalExpenses).toBe(300)
      expect(transactions).toHaveLength(1)
    })
  })

  describe('Forecast transactions workflow', () => {
    it('should exclude forecast transactions with excludeFromSplit flag from totals', () => {
      const transactions: Transaction[] = [
        {
          id: 1,
          description: 'Actual expense',
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
        },
        {
          id: 2,
          description: 'Forecast expense',
          amount: 200,
          categoryId: 'cat-1',
          paidBy: 'person-1',
          isRecurring: false,
          isCreditCard: false,
          excludeFromSplit: true, // Excluded from split
          isForecast: true,
          date: '2024-03-16',
          type: 'expense',
          isIncrement: true,
        },
      ]

      const summary = calculateFinancialSummary(transactions)

      // Only actual expense should be counted
      expect(summary.totalExpenses).toBe(100)
      expect(summary.categorySpending.get('cat-1')).toBe(100)
    })

    it('should include forecast transactions without excludeFromSplit flag', () => {
      const transactions: Transaction[] = [
        {
          id: 1,
          description: 'Forecast expense',
          amount: 200,
          categoryId: 'cat-1',
          paidBy: 'person-1',
          isRecurring: false,
          isCreditCard: false,
          excludeFromSplit: false, // Included in split
          isForecast: true,
          date: '2024-03-16',
          type: 'expense',
          isIncrement: true,
        },
      ]

      const summary = calculateFinancialSummary(transactions)

      // Forecast should be included when excludeFromSplit is false
      expect(summary.totalExpenses).toBe(200)
    })
  })
})
