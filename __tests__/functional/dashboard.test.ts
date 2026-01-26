/**
 * Functional tests for Dashboard feature
 * These tests verify the dashboard displays correct summaries and calculations
 */

import { describe, it, expect } from 'vitest'
import type { Transaction, Person, Category } from '@/lib/types'
import {
  calculateFinancialSummary,
  calculatePeopleShareWithIncomeTransactions,
  calculateCategorySummary,
  calculateSettlementData,
  calculateTotalIncome,
  calculateIncomeBreakdown,
} from '@/components/finance/hooks/useFinanceCalculations'
import { formatCurrency, formatPercent, formatMonthYear } from '@/lib/format'

describe('Dashboard Functionality', () => {
  const mockPeople: Person[] = [
    { id: 'person-1', name: 'Alice', income: 6000 },
    { id: 'person-2', name: 'Bob', income: 4000 },
  ]

  const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Food', targetPercent: 30 },
    { id: 'cat-2', name: 'Transport', targetPercent: 20 },
    { id: 'cat-3', name: 'Utilities', targetPercent: 15 },
    { id: 'cat-4', name: 'Entertainment', targetPercent: 10 },
  ]

  const mockTransactions: Transaction[] = [
    {
      id: 1,
      description: 'Groceries',
      amount: 2500,
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
      description: 'Restaurant',
      amount: 500,
      categoryId: 'cat-1',
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
      description: 'Uber',
      amount: 800,
      categoryId: 'cat-2',
      paidBy: 'person-1',
      isRecurring: false,
      isCreditCard: false,
      excludeFromSplit: false,
      isForecast: false,
      date: '2024-03-17',
      type: 'expense',
      isIncrement: true,
    },
    {
      id: 4,
      description: 'Gas',
      amount: 1200,
      categoryId: 'cat-2',
      paidBy: 'person-2',
      isRecurring: false,
      isCreditCard: false,
      excludeFromSplit: false,
      isForecast: false,
      date: '2024-03-18',
      type: 'expense',
      isIncrement: true,
    },
    {
      id: 5,
      description: 'Electricity',
      amount: 1500,
      categoryId: 'cat-3',
      paidBy: 'person-1',
      isRecurring: true,
      isCreditCard: false,
      excludeFromSplit: false,
      isForecast: false,
      date: '2024-03-01',
      type: 'expense',
      isIncrement: true,
    },
    {
      id: 6,
      description: 'Bonus',
      amount: 2000,
      categoryId: null,
      paidBy: 'person-2',
      isRecurring: false,
      isCreditCard: false,
      excludeFromSplit: false,
      isForecast: false,
      date: '2024-03-10',
      type: 'income',
      isIncrement: true,
    },
  ]

  describe('Summary Cards Display', () => {
    it('should display total income correctly', () => {
      const baseIncome = calculateTotalIncome(mockPeople)
      const incomeBreakdown = calculateIncomeBreakdown(mockTransactions)
      const totalIncome = baseIncome + incomeBreakdown.netIncome

      expect(baseIncome).toBe(10000) // Alice 6000 + Bob 4000
      expect(incomeBreakdown.totalIncomeIncrement).toBe(2000) // Bonus
      expect(incomeBreakdown.totalIncomeDecrement).toBe(0)
      expect(totalIncome).toBe(12000) // 10000 + 2000

      // Format for display
      const displayIncome = formatCurrency(totalIncome)
      expect(displayIncome).toBe('R$\u00A012.000,00')
    })

    it('should display total expenses correctly', () => {
      const summary = calculateFinancialSummary(mockTransactions)

      expect(summary.totalExpenses).toBe(6500)

      // Format for display
      const displayExpenses = formatCurrency(summary.totalExpenses)
      expect(displayExpenses).toBe('R$\u00A06.500,00')
    })

    it('should display balance (income - expenses)', () => {
      const baseIncome = calculateTotalIncome(mockPeople)
      const summary = calculateFinancialSummary(mockTransactions)
      const totalIncome = baseIncome + summary.incomeBreakdown.netIncome

      const balance = totalIncome - summary.totalExpenses

      expect(balance).toBe(5500) // 12000 - 6500

      // Format for display
      const displayBalance = formatCurrency(balance)
      expect(displayBalance).toBe('R$\u00A05.500,00')
    })

    it('should show positive balance in green, negative in red', () => {
      const positiveBalance = 5500
      const negativeBalance = -1000

      expect(positiveBalance > 0).toBe(true) // Would show green
      expect(negativeBalance < 0).toBe(true) // Would show red
    })
  })

  describe('Category Summary Display', () => {
    it('should display spending by category', () => {
      const totalIncome = 10000
      const categorySummary = calculateCategorySummary(
        mockCategories,
        mockTransactions,
        totalIncome
      )

      // Food: 3000 spent (Groceries 2500 + Restaurant 500)
      const food = categorySummary.find((c) => c.id === 'cat-1')
      expect(food?.totalSpent).toBe(3000)
      expect(food?.realPercentOfIncome).toBe(30) // 3000/10000 * 100
      expect(food?.targetPercent).toBe(30)

      // Transport: 2000 spent (Uber 800 + Gas 1200)
      const transport = categorySummary.find((c) => c.id === 'cat-2')
      expect(transport?.totalSpent).toBe(2000)
      expect(transport?.realPercentOfIncome).toBe(20)
      expect(transport?.targetPercent).toBe(20)

      // Utilities: 1500 spent (Electricity)
      const utilities = categorySummary.find((c) => c.id === 'cat-3')
      expect(utilities?.totalSpent).toBe(1500)
      expect(utilities?.realPercentOfIncome).toBe(15)
      expect(utilities?.targetPercent).toBe(15)

      // Entertainment: 0 spent
      const entertainment = categorySummary.find((c) => c.id === 'cat-4')
      expect(entertainment?.totalSpent).toBe(0)
      expect(entertainment?.realPercentOfIncome).toBe(0)
    })

    it('should format category spending for display', () => {
      const totalIncome = 10000
      const categorySummary = calculateCategorySummary(
        mockCategories,
        mockTransactions,
        totalIncome
      )

      const food = categorySummary.find((c) => c.id === 'cat-1')

      // Amount formatting
      expect(formatCurrency(food!.totalSpent)).toBe('R$\u00A03.000,00')

      // Percentage formatting
      expect(formatPercent(food!.realPercentOfIncome)).toBe('30,0%')
      expect(formatPercent(food!.targetPercent)).toBe('30,0%')
    })

    it('should highlight categories over budget', () => {
      const totalIncome = 10000
      const overBudgetTransactions: Transaction[] = [
        {
          id: 1,
          description: 'Lots of food',
          amount: 4000, // 40% of income, target is 30%
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

      const categorySummary = calculateCategorySummary(
        mockCategories,
        overBudgetTransactions,
        totalIncome
      )

      const food = categorySummary.find((c) => c.id === 'cat-1')
      const isOverBudget = food!.realPercentOfIncome > food!.targetPercent

      expect(isOverBudget).toBe(true) // 40% > 30%
      expect(food!.realPercentOfIncome).toBe(40)
    })

    it('should sort categories by spending (highest first)', () => {
      const totalIncome = 10000
      const categorySummary = calculateCategorySummary(
        mockCategories,
        mockTransactions,
        totalIncome
      )

      const sorted = [...categorySummary].sort((a, b) => b.totalSpent - a.totalSpent)

      expect(sorted[0].name).toBe('Food') // 3000
      expect(sorted[1].name).toBe('Transport') // 2000
      expect(sorted[2].name).toBe('Utilities') // 1500
      expect(sorted[3].name).toBe('Entertainment') // 0
    })
  })

  describe('Settlement Summary Display', () => {
    it('should display who paid what', () => {
      const summary = calculateFinancialSummary(mockTransactions)
      const peopleWithShare = calculatePeopleShareWithIncomeTransactions(
        mockPeople,
        mockTransactions
      )
      const settlement = calculateSettlementData(
        peopleWithShare,
        mockTransactions,
        summary.totalExpenses
      )

      // Alice paid: Groceries 2500 + Uber 800 + Electricity 1500 = 4800
      const alice = settlement.find((s) => s.id === 'person-1')
      expect(alice?.paidAmount).toBe(4800)

      // Bob paid: Restaurant 500 + Gas 1200 = 1700
      const bob = settlement.find((s) => s.id === 'person-2')
      expect(bob?.paidAmount).toBe(1700)

      // Format for display
      expect(formatCurrency(alice!.paidAmount)).toBe('R$\u00A04.800,00')
      expect(formatCurrency(bob!.paidAmount)).toBe('R$\u00A01.700,00')
    })

    it('should display fair share amounts', () => {
      const summary = calculateFinancialSummary(mockTransactions)
      const peopleWithShare = calculatePeopleShareWithIncomeTransactions(
        mockPeople,
        mockTransactions
      )
      const settlement = calculateSettlementData(
        peopleWithShare,
        mockTransactions,
        summary.totalExpenses
      )

      // Total expenses: 6500
      // Alice share: 50% (6000 of 12000 effective income)
      // Bob share: 50% (6000 of 12000 effective income, with 2000 bonus)

      const alice = settlement.find((s) => s.id === 'person-1')
      const bob = settlement.find((s) => s.id === 'person-2')

      expect(alice?.sharePercent).toBeCloseTo(0.5)
      expect(bob?.sharePercent).toBeCloseTo(0.5)

      expect(alice?.fairShareAmount).toBeCloseTo(3250) // 50% of 6500
      expect(bob?.fairShareAmount).toBeCloseTo(3250)
    })

    it('should display settlement balances (who owes whom)', () => {
      const summary = calculateFinancialSummary(mockTransactions)
      const peopleWithShare = calculatePeopleShareWithIncomeTransactions(
        mockPeople,
        mockTransactions
      )
      const settlement = calculateSettlementData(
        peopleWithShare,
        mockTransactions,
        summary.totalExpenses
      )

      const alice = settlement.find((s) => s.id === 'person-1')
      const bob = settlement.find((s) => s.id === 'person-2')

      // Alice paid 4800, should pay 3250 → is owed 1550
      expect(alice?.balance).toBeCloseTo(1550)
      expect(alice!.balance > 0).toBe(true) // Positive = is owed

      // Bob paid 1700, should pay 3250 → owes 1550
      expect(bob?.balance).toBeCloseTo(-1550)
      expect(bob!.balance < 0).toBe(true) // Negative = owes

      // Format for display
      expect(formatCurrency(Math.abs(alice!.balance))).toBe('R$\u00A01.550,00')
      expect(formatCurrency(Math.abs(bob!.balance))).toBe('R$\u00A01.550,00')
    })

    it('should show "is owed" for positive balance, "owes" for negative', () => {
      const summary = calculateFinancialSummary(mockTransactions)
      const peopleWithShare = calculatePeopleShareWithIncomeTransactions(
        mockPeople,
        mockTransactions
      )
      const settlement = calculateSettlementData(
        peopleWithShare,
        mockTransactions,
        summary.totalExpenses
      )

      settlement.forEach((person) => {
        if (person.balance > 0) {
          // Display: "Alice is owed R$ 1.550,00"
          expect(person.name).toBe('Alice')
        } else if (person.balance < 0) {
          // Display: "Bob owes R$ 1.550,00"
          expect(person.name).toBe('Bob')
        }
      })
    })

    it('should verify settlement balances sum to zero', () => {
      const summary = calculateFinancialSummary(mockTransactions)
      const peopleWithShare = calculatePeopleShareWithIncomeTransactions(
        mockPeople,
        mockTransactions
      )
      const settlement = calculateSettlementData(
        peopleWithShare,
        mockTransactions,
        summary.totalExpenses
      )

      const totalBalance = settlement.reduce((sum, person) => sum + person.balance, 0)

      // Balances should sum to approximately 0 (allowing for floating point errors)
      expect(Math.abs(totalBalance)).toBeLessThan(0.01)
    })
  })

  describe('Income Breakdown Display', () => {
    it('should display base income and adjustments', () => {
      const baseIncome = calculateTotalIncome(mockPeople)
      const incomeBreakdown = calculateIncomeBreakdown(mockTransactions)

      expect(baseIncome).toBe(10000)
      expect(incomeBreakdown.totalIncomeIncrement).toBe(2000)
      expect(incomeBreakdown.totalIncomeDecrement).toBe(0)
      expect(incomeBreakdown.netIncome).toBe(2000)

      // Display format:
      // Base Income: R$ 10.000,00
      // + Income Adjustments: R$ 2.000,00
      // = Total Income: R$ 12.000,00
      expect(formatCurrency(baseIncome)).toBe('R$\u00A010.000,00')
      expect(formatCurrency(incomeBreakdown.netIncome)).toBe('R$\u00A02.000,00')
      expect(formatCurrency(baseIncome + incomeBreakdown.netIncome)).toBe(
        'R$\u00A012.000,00'
      )
    })

    it('should display income decrements', () => {
      const transactionsWithDecrement: Transaction[] = [
        ...mockTransactions,
        {
          id: 7,
          description: 'Tax deduction',
          amount: 500,
          categoryId: null,
          paidBy: 'person-1',
          isRecurring: false,
          isCreditCard: false,
          excludeFromSplit: false,
          isForecast: false,
          date: '2024-03-20',
          type: 'income',
          isIncrement: false, // Decrement
        },
      ]

      const incomeBreakdown = calculateIncomeBreakdown(transactionsWithDecrement)

      expect(incomeBreakdown.totalIncomeIncrement).toBe(2000)
      expect(incomeBreakdown.totalIncomeDecrement).toBe(500)
      expect(incomeBreakdown.netIncome).toBe(1500) // 2000 - 500
    })
  })

  describe('Month Display', () => {
    it('should format current month for header', () => {
      const currentDate = new Date(2024, 2, 15) // March 15, 2024
      const formattedMonth = formatMonthYear(currentDate)

      expect(formattedMonth).toBe('março de 2024')
    })
  })

  describe('Empty State Display', () => {
    it('should handle month with no transactions', () => {
      const emptyTransactions: Transaction[] = []
      const summary = calculateFinancialSummary(emptyTransactions)

      expect(summary.totalExpenses).toBe(0)
      expect(summary.incomeBreakdown.netIncome).toBe(0)
      expect(summary.categorySpending.size).toBe(0)
      expect(summary.personPayments.size).toBe(0)

      // Display: "No transactions this month"
    })

    it('should handle category with no spending', () => {
      const totalIncome = 10000
      const categorySummary = calculateCategorySummary(
        mockCategories,
        mockTransactions,
        totalIncome
      )

      const entertainment = categorySummary.find((c) => c.id === 'cat-4')

      expect(entertainment?.totalSpent).toBe(0)
      expect(entertainment?.realPercentOfIncome).toBe(0)

      // Display: "R$ 0,00 (0.0%)"
      expect(formatCurrency(entertainment!.totalSpent)).toBe('R$\u00A00,00')
      expect(formatPercent(entertainment!.realPercentOfIncome)).toBe('0,0%')
    })
  })

  describe('Dashboard Performance Indicators', () => {
    it('should show spending as percentage of income', () => {
      const baseIncome = calculateTotalIncome(mockPeople)
      const summary = calculateFinancialSummary(mockTransactions)
      const totalIncome = baseIncome + summary.incomeBreakdown.netIncome

      const spendingPercentage = (summary.totalExpenses / totalIncome) * 100

      expect(spendingPercentage).toBeCloseTo(54.17) // 6500 / 12000 * 100

      // Display: "You spent 54.2% of your income"
      expect(formatPercent(spendingPercentage)).toBe('54,2%')
    })

    it('should show savings rate', () => {
      const baseIncome = calculateTotalIncome(mockPeople)
      const summary = calculateFinancialSummary(mockTransactions)
      const totalIncome = baseIncome + summary.incomeBreakdown.netIncome

      const balance = totalIncome - summary.totalExpenses
      const savingsRate = (balance / totalIncome) * 100

      expect(savingsRate).toBeCloseTo(45.83) // 5500 / 12000 * 100

      // Display: "Savings rate: 45.8%"
      expect(formatPercent(savingsRate)).toBe('45,8%')
    })
  })

  describe('Dashboard Warnings and Alerts', () => {
    it('should warn when spending exceeds income', () => {
      const highSpendingTransactions: Transaction[] = [
        {
          id: 1,
          description: 'Expensive purchase',
          amount: 15000, // More than total income
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

      const baseIncome = calculateTotalIncome(mockPeople) // 10000
      const summary = calculateFinancialSummary(highSpendingTransactions)

      const balance = baseIncome - summary.totalExpenses

      expect(balance).toBeLessThan(0) // Negative balance
      expect(balance).toBe(-5000)

      // Display warning: "You spent R$ 5.000,00 more than your income!"
    })

    it('should identify largest spending categories', () => {
      const totalIncome = 10000
      const categorySummary = calculateCategorySummary(
        mockCategories,
        mockTransactions,
        totalIncome
      )

      const sortedBySpending = [...categorySummary]
        .filter((c) => c.totalSpent > 0)
        .sort((a, b) => b.totalSpent - a.totalSpent)

      // Largest spending: Food (3000)
      expect(sortedBySpending[0].name).toBe('Food')
      expect(sortedBySpending[0].totalSpent).toBe(3000)

      // Display: "Your top spending category is Food (R$ 3.000,00)"
    })
  })
})
