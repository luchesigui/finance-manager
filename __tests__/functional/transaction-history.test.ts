/**
 * Functional tests for Transaction History feature
 * These tests verify the transaction list displays and filters correctly
 */

import { describe, it, expect } from 'vitest'
import type { Transaction, Person, Category } from '@/lib/types'
import { getAccountingYearMonth } from '@/lib/dateUtils'
import { formatCurrency, formatDateString } from '@/lib/format'

describe('Transaction History Functionality', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 1,
      description: 'March groceries',
      amount: 500,
      categoryId: 'cat-1',
      paidBy: 'person-1',
      isRecurring: false,
      isCreditCard: false,
      excludeFromSplit: false,
      isForecast: false,
      date: '2024-03-15',
      createdAt: '2024-03-15T10:00:00Z',
      type: 'expense',
      isIncrement: true,
    },
    {
      id: 2,
      description: 'February credit card expense',
      amount: 300,
      categoryId: 'cat-2',
      paidBy: 'person-2',
      isRecurring: false,
      isCreditCard: true, // Accounted in March
      excludeFromSplit: false,
      isForecast: false,
      date: '2024-02-20',
      createdAt: '2024-02-20T10:00:00Z',
      type: 'expense',
      isIncrement: true,
    },
    {
      id: 3,
      description: 'April expense',
      amount: 200,
      categoryId: 'cat-1',
      paidBy: 'person-1',
      isRecurring: false,
      isCreditCard: false,
      excludeFromSplit: false,
      isForecast: false,
      date: '2024-04-10',
      createdAt: '2024-04-10T10:00:00Z',
      type: 'expense',
      isIncrement: true,
    },
    {
      id: 4,
      description: 'March recurring expense',
      amount: 100,
      categoryId: 'cat-3',
      paidBy: 'person-1',
      isRecurring: true,
      isCreditCard: false,
      excludeFromSplit: false,
      isForecast: false,
      date: '2024-03-01',
      createdAt: '2024-03-01T10:00:00Z',
      type: 'expense',
      isIncrement: true,
    },
    {
      id: 5,
      description: 'March income',
      amount: 1000,
      categoryId: null,
      paidBy: 'person-1',
      isRecurring: false,
      isCreditCard: false,
      excludeFromSplit: false,
      isForecast: false,
      date: '2024-03-05',
      createdAt: '2024-03-05T10:00:00Z',
      type: 'income',
      isIncrement: true,
    },
    {
      id: 6,
      description: 'March forecast expense',
      amount: 250,
      categoryId: 'cat-1',
      paidBy: 'person-1',
      isRecurring: false,
      isCreditCard: false,
      excludeFromSplit: true,
      isForecast: true,
      date: '2024-03-20',
      createdAt: '2024-03-20T10:00:00Z',
      type: 'expense',
      isIncrement: true,
    },
  ]

  const mockPeople: Person[] = [
    { id: 'person-1', name: 'Alice', income: 6000 },
    { id: 'person-2', name: 'Bob', income: 4000 },
  ]

  const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Food', targetPercent: 30 },
    { id: 'cat-2', name: 'Transport', targetPercent: 20 },
    { id: 'cat-3', name: 'Utilities', targetPercent: 15 },
  ]

  describe('Filtering transactions by month', () => {
    it('should filter transactions for March 2024 (accounting month)', () => {
      // Simulate filtering by accounting month like the app does
      const targetYear = 2024
      const targetMonth = 3

      const marchTransactions = mockTransactions.filter((transaction) => {
        const accounting = getAccountingYearMonth(transaction.date, transaction.isCreditCard)
        return accounting.year === targetYear && accounting.month === targetMonth
      })

      // Should include:
      // - March groceries (regular expense in March)
      // - February credit card (accounted in March)
      // - March recurring expense
      // - March income
      // - March forecast expense
      // Should NOT include:
      // - April expense
      expect(marchTransactions).toHaveLength(5)
      expect(marchTransactions.find((t) => t.id === 1)).toBeDefined() // March groceries
      expect(marchTransactions.find((t) => t.id === 2)).toBeDefined() // Feb CC expense
      expect(marchTransactions.find((t) => t.id === 4)).toBeDefined() // March recurring
      expect(marchTransactions.find((t) => t.id === 5)).toBeDefined() // March income
      expect(marchTransactions.find((t) => t.id === 6)).toBeDefined() // March forecast
      expect(marchTransactions.find((t) => t.id === 3)).toBeUndefined() // April expense
    })

    it('should filter transactions for April 2024', () => {
      const targetYear = 2024
      const targetMonth = 4

      const aprilTransactions = mockTransactions.filter((transaction) => {
        const accounting = getAccountingYearMonth(transaction.date, transaction.isCreditCard)
        return accounting.year === targetYear && accounting.month === targetMonth
      })

      // Should only include April expense
      expect(aprilTransactions).toHaveLength(1)
      expect(aprilTransactions[0].id).toBe(3)
      expect(aprilTransactions[0].description).toBe('April expense')
    })

    it('should filter transactions for February 2024 (no credit card expenses)', () => {
      const targetYear = 2024
      const targetMonth = 2

      const februaryTransactions = mockTransactions.filter((transaction) => {
        const accounting = getAccountingYearMonth(transaction.date, transaction.isCreditCard)
        return accounting.year === targetYear && accounting.month === targetMonth
      })

      // February credit card should be accounted in March, not February
      expect(februaryTransactions).toHaveLength(0)
    })
  })

  describe('Transaction display formatting', () => {
    it('should format transaction amounts as currency', () => {
      const transaction = mockTransactions[0]
      const formattedAmount = formatCurrency(transaction.amount)

      expect(formattedAmount).toBe('R$\u00A0500,00')
    })

    it('should format transaction dates', () => {
      const transaction = mockTransactions[0]
      const formattedDate = formatDateString(transaction.date)

      expect(formattedDate).toBe('15/03/2024')
    })

    it('should show person name for transaction', () => {
      const transaction = mockTransactions[0]
      const person = mockPeople.find((p) => p.id === transaction.paidBy)

      expect(person?.name).toBe('Alice')
    })

    it('should show category name for transaction', () => {
      const transaction = mockTransactions[0]
      const category = mockCategories.find((c) => c.id === transaction.categoryId)

      expect(category?.name).toBe('Food')
    })

    it('should handle income transactions with no category', () => {
      const incomeTransaction = mockTransactions[4]

      expect(incomeTransaction.type).toBe('income')
      expect(incomeTransaction.categoryId).toBeNull()
    })
  })

  describe('Transaction sorting and ordering', () => {
    it('should sort transactions by creation date (most recent first)', () => {
      const sorted = [...mockTransactions].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date).getTime()
        const dateB = new Date(b.createdAt || b.date).getTime()
        return dateB - dateA
      })

      // Most recent should be April expense (id: 3) - 2024-04-10
      expect(sorted[0].id).toBe(3)
      expect(sorted[0].description).toBe('April expense')

      // Oldest should be February credit card (id: 2) - 2024-02-20
      expect(sorted[sorted.length - 1].id).toBe(2)
    })
  })

  describe('Transaction type filtering', () => {
    it('should filter only expense transactions', () => {
      const expenses = mockTransactions.filter((t) => t.type === 'expense')

      expect(expenses).toHaveLength(5)
      expect(expenses.every((t) => t.type === 'expense')).toBe(true)
    })

    it('should filter only income transactions', () => {
      const incomes = mockTransactions.filter((t) => t.type === 'income')

      expect(incomes).toHaveLength(1)
      expect(incomes[0].description).toBe('March income')
    })
  })

  describe('Transaction flags and indicators', () => {
    it('should identify recurring transactions', () => {
      const recurring = mockTransactions.filter((t) => t.isRecurring)

      expect(recurring).toHaveLength(1)
      expect(recurring[0].description).toBe('March recurring expense')
    })

    it('should identify credit card transactions', () => {
      const creditCard = mockTransactions.filter((t) => t.isCreditCard)

      expect(creditCard).toHaveLength(1)
      expect(creditCard[0].description).toBe('February credit card expense')
    })

    it('should identify forecast transactions', () => {
      const forecast = mockTransactions.filter((t) => t.isForecast)

      expect(forecast).toHaveLength(1)
      expect(forecast[0].description).toBe('March forecast expense')
    })

    it('should identify transactions excluded from split', () => {
      const excluded = mockTransactions.filter((t) => t.excludeFromSplit)

      expect(excluded).toHaveLength(1)
      expect(excluded[0].isForecast).toBe(true)
    })
  })

  describe('Transaction search and filtering', () => {
    it('should search transactions by description', () => {
      const searchTerm = 'groceries'
      const results = mockTransactions.filter((t) =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      )

      expect(results).toHaveLength(1)
      expect(results[0].description).toBe('March groceries')
    })

    it('should filter transactions by category', () => {
      const categoryId = 'cat-1'
      const results = mockTransactions.filter((t) => t.categoryId === categoryId)

      expect(results).toHaveLength(3)
      expect(results.every((t) => t.categoryId === 'cat-1')).toBe(true)
    })

    it('should filter transactions by person', () => {
      const personId = 'person-1'
      const results = mockTransactions.filter((t) => t.paidBy === personId)

      expect(results).toHaveLength(5) // March groceries, April expense, March recurring, March income, March forecast
      expect(results.every((t) => t.paidBy === 'person-1')).toBe(true)
    })

    it('should support multiple filter criteria', () => {
      // Filter for Alice's expenses in Food category
      const results = mockTransactions.filter(
        (t) =>
          t.paidBy === 'person-1' &&
          t.categoryId === 'cat-1' &&
          t.type === 'expense'
      )

      expect(results).toHaveLength(3) // March groceries, April expense, March forecast
      expect(results.every((t) => t.paidBy === 'person-1')).toBe(true)
      expect(results.every((t) => t.categoryId === 'cat-1')).toBe(true)
      expect(results.every((t) => t.type === 'expense')).toBe(true)
    })
  })

  describe('Empty state handling', () => {
    it('should handle month with no transactions', () => {
      const targetYear = 2024
      const targetMonth = 1 // January

      const januaryTransactions = mockTransactions.filter((transaction) => {
        const accounting = getAccountingYearMonth(transaction.date, transaction.isCreditCard)
        return accounting.year === targetYear && accounting.month === targetMonth
      })

      expect(januaryTransactions).toHaveLength(0)
    })

    it('should handle empty transaction list', () => {
      const emptyList: Transaction[] = []

      expect(emptyList).toHaveLength(0)
    })
  })

  describe('Transaction list pagination behavior', () => {
    it('should handle transaction list with many items', () => {
      // Generate 100 transactions
      const manyTransactions: Transaction[] = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        description: `Transaction ${i + 1}`,
        amount: 100 + i,
        categoryId: 'cat-1',
        paidBy: 'person-1',
        isRecurring: false,
        isCreditCard: false,
        excludeFromSplit: false,
        isForecast: false,
        date: '2024-03-15',
        type: 'expense' as const,
        isIncrement: true,
      }))

      expect(manyTransactions).toHaveLength(100)

      // Simulate pagination (first 20 items)
      const firstPage = manyTransactions.slice(0, 20)
      expect(firstPage).toHaveLength(20)

      // Simulate second page
      const secondPage = manyTransactions.slice(20, 40)
      expect(secondPage).toHaveLength(20)
      expect(secondPage[0].id).toBe(21)
    })
  })

  describe('Transaction selection for bulk operations', () => {
    it('should select multiple transactions', () => {
      const selectedIds = [1, 3, 5]
      const selectedTransactions = mockTransactions.filter((t) =>
        selectedIds.includes(t.id)
      )

      expect(selectedTransactions).toHaveLength(3)
      expect(selectedTransactions.map((t) => t.id)).toEqual([1, 3, 5])
    })

    it('should select all transactions on page', () => {
      const allIds = mockTransactions.map((t) => t.id)

      expect(allIds).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('should deselect transactions', () => {
      let selectedIds = [1, 2, 3, 4, 5]

      // Deselect id 3
      selectedIds = selectedIds.filter((id) => id !== 3)

      expect(selectedIds).toEqual([1, 2, 4, 5])
      expect(selectedIds).not.toContain(3)
    })
  })
})
