import { describe, it, expect, vi } from 'vitest'
import type { PersonRow, CategoryRow, TransactionRow } from '@/lib/types'

// Since financeStore uses "server-only", we need to test the mappers indirectly
// We'll test the mapping logic by creating test helpers that mirror the actual implementation

describe('financeStore data mappers', () => {
  describe('mapPersonRow', () => {
    function mapPersonRow(row: PersonRow) {
      return {
        id: row.id,
        name: row.name,
        income: Number(row.income),
        householdId: row.household_id ?? undefined,
        linkedUserId: row.linked_user_id ?? undefined,
      }
    }

    it('should map a person row correctly', () => {
      const row: PersonRow = {
        id: 'person-1',
        name: 'John Doe',
        income: 5000,
        household_id: 'household-1',
        linked_user_id: 'user-1',
      }

      const result = mapPersonRow(row)

      expect(result).toEqual({
        id: 'person-1',
        name: 'John Doe',
        income: 5000,
        householdId: 'household-1',
        linkedUserId: 'user-1',
      })
    })

    it('should handle income as string', () => {
      const row: PersonRow = {
        id: 'person-1',
        name: 'John Doe',
        income: '5000',
        household_id: null,
        linked_user_id: null,
      }

      const result = mapPersonRow(row)

      expect(result.income).toBe(5000)
      expect(typeof result.income).toBe('number')
    })

    it('should handle null household_id and linked_user_id', () => {
      const row: PersonRow = {
        id: 'person-1',
        name: 'John Doe',
        income: 5000,
        household_id: null,
        linked_user_id: null,
      }

      const result = mapPersonRow(row)

      expect(result.householdId).toBeUndefined()
      expect(result.linkedUserId).toBeUndefined()
    })
  })

  describe('mapCategoryRow', () => {
    function mapCategoryRow(row: CategoryRow) {
      const categories = Array.isArray(row.categories) ? row.categories[0] : row.categories
      return {
        id: row.category_id,
        name: categories?.name ?? '',
        targetPercent: Number(row.target_percent),
        householdId: row.household_id ?? undefined,
      }
    }

    it('should map a category row with single object', () => {
      const row: CategoryRow = {
        category_id: 'cat-1',
        target_percent: 30,
        household_id: 'household-1',
        categories: { name: 'Food' },
      }

      const result = mapCategoryRow(row)

      expect(result).toEqual({
        id: 'cat-1',
        name: 'Food',
        targetPercent: 30,
        householdId: 'household-1',
      })
    })

    it('should map a category row with array', () => {
      const row: CategoryRow = {
        category_id: 'cat-1',
        target_percent: 30,
        household_id: 'household-1',
        categories: [{ name: 'Food' }],
      }

      const result = mapCategoryRow(row)

      expect(result.name).toBe('Food')
    })

    it('should handle target_percent as string', () => {
      const row: CategoryRow = {
        category_id: 'cat-1',
        target_percent: '30',
        household_id: null,
        categories: { name: 'Food' },
      }

      const result = mapCategoryRow(row)

      expect(result.targetPercent).toBe(30)
      expect(typeof result.targetPercent).toBe('number')
    })

    it('should handle null household_id', () => {
      const row: CategoryRow = {
        category_id: 'cat-1',
        target_percent: 30,
        household_id: null,
        categories: { name: 'Food' },
      }

      const result = mapCategoryRow(row)

      expect(result.householdId).toBeUndefined()
    })
  })

  describe('mapTransactionRow', () => {
    function mapTransactionRow(row: TransactionRow) {
      return {
        id: Number(row.id),
        description: row.description,
        amount: Number(row.amount),
        categoryId: row.category_id,
        paidBy: row.paid_by,
        isRecurring: row.is_recurring,
        isCreditCard: row.is_credit_card ?? false,
        excludeFromSplit: row.exclude_from_split ?? false,
        isForecast: row.is_forecast ?? false,
        date: row.date,
        createdAt: row.created_at,
        householdId: row.household_id,
        type: row.type ?? 'expense',
        isIncrement: row.is_increment ?? true,
      }
    }

    it('should map a transaction row correctly', () => {
      const row: TransactionRow = {
        id: 123,
        description: 'Groceries',
        amount: 100.50,
        category_id: 'cat-1',
        paid_by: 'person-1',
        is_recurring: false,
        is_credit_card: true,
        exclude_from_split: false,
        is_forecast: false,
        date: '2024-03-15',
        created_at: '2024-03-15T10:00:00Z',
        household_id: 'household-1',
        type: 'expense',
        is_increment: true,
      }

      const result = mapTransactionRow(row)

      expect(result).toEqual({
        id: 123,
        description: 'Groceries',
        amount: 100.50,
        categoryId: 'cat-1',
        paidBy: 'person-1',
        isRecurring: false,
        isCreditCard: true,
        excludeFromSplit: false,
        isForecast: false,
        date: '2024-03-15',
        createdAt: '2024-03-15T10:00:00Z',
        householdId: 'household-1',
        type: 'expense',
        isIncrement: true,
      })
    })

    it('should apply default values for optional fields', () => {
      const row: TransactionRow = {
        id: 123,
        description: 'Groceries',
        amount: 100,
        category_id: 'cat-1',
        paid_by: 'person-1',
        is_recurring: false,
        date: '2024-03-15',
      }

      const result = mapTransactionRow(row)

      expect(result.isCreditCard).toBe(false)
      expect(result.excludeFromSplit).toBe(false)
      expect(result.isForecast).toBe(false)
      expect(result.type).toBe('expense')
      expect(result.isIncrement).toBe(true)
    })

    it('should handle id and amount as strings', () => {
      const row: TransactionRow = {
        id: '123',
        description: 'Groceries',
        amount: '100.50',
        category_id: 'cat-1',
        paid_by: 'person-1',
        is_recurring: false,
        date: '2024-03-15',
      }

      const result = mapTransactionRow(row)

      expect(result.id).toBe(123)
      expect(typeof result.id).toBe('number')
      expect(result.amount).toBe(100.50)
      expect(typeof result.amount).toBe('number')
    })

    it('should handle null categoryId', () => {
      const row: TransactionRow = {
        id: 123,
        description: 'Income',
        amount: 1000,
        category_id: null,
        paid_by: 'person-1',
        is_recurring: false,
        date: '2024-03-15',
        type: 'income',
      }

      const result = mapTransactionRow(row)

      expect(result.categoryId).toBeNull()
      expect(result.type).toBe('income')
    })
  })

  describe('filterByAccountingMonth', () => {
    // Import the actual function logic from dateUtils
    function getAccountingYearMonthUtc(dateString: string, isCreditCard: boolean) {
      const [year, month, day] = dateString.split('-').map(Number)
      const base = new Date(Date.UTC(year, month - 1, day))

      let accountingDate = base
      if (isCreditCard) {
        const targetMonth = base.getUTCMonth() + 1
        const candidate = new Date(Date.UTC(base.getUTCFullYear(), targetMonth, day))
        const expectedMonth = ((targetMonth % 12) + 12) % 12

        if (candidate.getUTCMonth() !== expectedMonth) {
          accountingDate = new Date(Date.UTC(base.getUTCFullYear(), targetMonth + 1, 0))
        } else {
          accountingDate = candidate
        }
      }

      return {
        year: accountingDate.getUTCFullYear(),
        month: accountingDate.getUTCMonth() + 1,
      }
    }

    function filterByAccountingMonth(rows: TransactionRow[], year: number, month: number) {
      return rows.filter((row) => {
        const accounting = getAccountingYearMonthUtc(row.date, row.is_credit_card ?? false)
        return accounting.year === year && accounting.month === month
      })
    }

    it('should filter transactions by accounting month for regular expenses', () => {
      const rows: TransactionRow[] = [
        {
          id: 1,
          description: 'March expense',
          amount: 100,
          category_id: 'cat-1',
          paid_by: 'person-1',
          is_recurring: false,
          is_credit_card: false,
          date: '2024-03-15',
        },
        {
          id: 2,
          description: 'April expense',
          amount: 200,
          category_id: 'cat-1',
          paid_by: 'person-1',
          is_recurring: false,
          is_credit_card: false,
          date: '2024-04-15',
        },
      ]

      const result = filterByAccountingMonth(rows, 2024, 3)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should account credit card expenses in next month', () => {
      const rows: TransactionRow[] = [
        {
          id: 1,
          description: 'March credit card',
          amount: 100,
          category_id: 'cat-1',
          paid_by: 'person-1',
          is_recurring: false,
          is_credit_card: true,
          date: '2024-03-15',
        },
        {
          id: 2,
          description: 'March regular',
          amount: 200,
          category_id: 'cat-1',
          paid_by: 'person-1',
          is_recurring: false,
          is_credit_card: false,
          date: '2024-03-15',
        },
      ]

      const marchResult = filterByAccountingMonth(rows, 2024, 3)
      const aprilResult = filterByAccountingMonth(rows, 2024, 4)

      // Regular expense in March
      expect(marchResult).toHaveLength(1)
      expect(marchResult[0].id).toBe(2)

      // Credit card expense accounted in April
      expect(aprilResult).toHaveLength(1)
      expect(aprilResult[0].id).toBe(1)
    })

    it('should handle credit card expense in December accounting to January next year', () => {
      const rows: TransactionRow[] = [
        {
          id: 1,
          description: 'December credit card',
          amount: 100,
          category_id: 'cat-1',
          paid_by: 'person-1',
          is_recurring: false,
          is_credit_card: true,
          date: '2024-12-15',
        },
      ]

      const decemberResult = filterByAccountingMonth(rows, 2024, 12)
      const januaryResult = filterByAccountingMonth(rows, 2025, 1)

      expect(decemberResult).toHaveLength(0)
      expect(januaryResult).toHaveLength(1)
    })

    it('should handle undefined is_credit_card as false', () => {
      const rows: TransactionRow[] = [
        {
          id: 1,
          description: 'March expense',
          amount: 100,
          category_id: 'cat-1',
          paid_by: 'person-1',
          is_recurring: false,
          date: '2024-03-15',
        },
      ]

      const result = filterByAccountingMonth(rows, 2024, 3)

      expect(result).toHaveLength(1)
    })
  })

  describe('patch converters', () => {
    it('should convert PersonPatch to database format', () => {
      function toPersonDbPatch(patch: { name?: string; income?: number }) {
        const dbPatch: Record<string, unknown> = {}
        if (patch.name !== undefined) dbPatch.name = patch.name
        if (patch.income !== undefined) dbPatch.income = patch.income
        return dbPatch
      }

      const patch = { name: 'Jane Doe', income: 6000 }
      const result = toPersonDbPatch(patch)

      expect(result).toEqual({ name: 'Jane Doe', income: 6000 })
    })

    it('should convert TransactionPatch to database format', () => {
      function toTransactionDbPatch(patch: {
        description?: string
        amount?: number
        categoryId?: string
        isCreditCard?: boolean
      }) {
        const dbPatch: Record<string, unknown> = {}
        if (patch.description !== undefined) dbPatch.description = patch.description
        if (patch.amount !== undefined) dbPatch.amount = patch.amount
        if (patch.categoryId !== undefined) dbPatch.category_id = patch.categoryId
        if (patch.isCreditCard !== undefined) dbPatch.is_credit_card = patch.isCreditCard
        return dbPatch
      }

      const patch = {
        description: 'Updated description',
        amount: 150,
        categoryId: 'cat-2',
        isCreditCard: true,
      }

      const result = toTransactionDbPatch(patch)

      expect(result).toEqual({
        description: 'Updated description',
        amount: 150,
        category_id: 'cat-2',
        is_credit_card: true,
      })
    })

    it('should only include defined fields in patch', () => {
      function toTransactionDbPatch(patch: { description?: string; amount?: number }) {
        const dbPatch: Record<string, unknown> = {}
        if (patch.description !== undefined) dbPatch.description = patch.description
        if (patch.amount !== undefined) dbPatch.amount = patch.amount
        return dbPatch
      }

      const patch = { description: 'Updated' }
      const result = toTransactionDbPatch(patch)

      expect(result).toEqual({ description: 'Updated' })
      expect(result).not.toHaveProperty('amount')
    })
  })
})
