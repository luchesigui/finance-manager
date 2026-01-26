import { describe, it, expect } from 'vitest'
import {
  transactionTypeSchema,
  transactionPatchSchema,
  bulkTransactionPatchSchema,
  createTransactionSchema,
  createTransactionsBodySchema,
  updateTransactionBodySchema,
  bulkUpdateBodySchema,
  bulkDeleteBodySchema,
  createPersonBodySchema,
  updatePersonBodySchema,
  updateCategoryBodySchema,
  updateDefaultPayerBodySchema,
} from './schemas'

describe('schemas', () => {
  describe('transactionTypeSchema', () => {
    it('should accept "expense"', () => {
      const result = transactionTypeSchema.safeParse('expense')
      expect(result.success).toBe(true)
    })

    it('should accept "income"', () => {
      const result = transactionTypeSchema.safeParse('income')
      expect(result.success).toBe(true)
    })

    it('should reject invalid types', () => {
      const result = transactionTypeSchema.safeParse('invalid')
      expect(result.success).toBe(false)
    })
  })

  describe('createTransactionSchema', () => {
    const validTransaction = {
      description: 'Test transaction',
      amount: 100.50,
      categoryId: 'cat-123',
      paidBy: 'person-123',
      isRecurring: false,
      isCreditCard: false,
      excludeFromSplit: false,
      isForecast: false,
      date: '2024-03-15',
      type: 'expense' as const,
      isIncrement: true,
    }

    it('should validate a valid transaction', () => {
      const result = createTransactionSchema.safeParse(validTransaction)
      expect(result.success).toBe(true)
    })

    it('should reject empty description', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        description: '',
      })
      expect(result.success).toBe(false)
    })

    it('should reject negative amount', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        amount: -100,
      })
      expect(result.success).toBe(false)
    })

    it('should reject zero amount', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        amount: 0,
      })
      expect(result.success).toBe(false)
    })

    it('should accept null categoryId', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        categoryId: null,
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty paidBy', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        paidBy: '',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid date format', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        date: '15-03-2024',
      })
      expect(result.success).toBe(false)
    })

    it('should reject date without leading zeros', () => {
      const result = createTransactionSchema.safeParse({
        ...validTransaction,
        date: '2024-3-15',
      })
      expect(result.success).toBe(false)
    })

    it('should apply default values', () => {
      const minimal = {
        description: 'Test',
        amount: 100,
        categoryId: null,
        paidBy: 'person-123',
        isRecurring: false,
        isCreditCard: false,
        excludeFromSplit: false,
        date: '2024-03-15',
      }
      const result = createTransactionSchema.safeParse(minimal)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('expense')
        expect(result.data.isForecast).toBe(false)
        expect(result.data.isIncrement).toBe(true)
      }
    })
  })

  describe('createTransactionsBodySchema', () => {
    const validTransaction = {
      description: 'Test',
      amount: 100,
      categoryId: null,
      paidBy: 'person-123',
      isRecurring: false,
      isCreditCard: false,
      excludeFromSplit: false,
      date: '2024-03-15',
    }

    it('should accept a single transaction', () => {
      const result = createTransactionsBodySchema.safeParse(validTransaction)
      expect(result.success).toBe(true)
    })

    it('should accept an array of transactions', () => {
      const result = createTransactionsBodySchema.safeParse([validTransaction])
      expect(result.success).toBe(true)
    })

    it('should reject an empty array', () => {
      const result = createTransactionsBodySchema.safeParse([])
      expect(result.success).toBe(false)
    })

    it('should accept multiple transactions in array', () => {
      const result = createTransactionsBodySchema.safeParse([
        validTransaction,
        { ...validTransaction, description: 'Second transaction' },
      ])
      expect(result.success).toBe(true)
    })
  })

  describe('transactionPatchSchema', () => {
    it('should accept partial updates', () => {
      const result = transactionPatchSchema.safeParse({
        description: 'Updated description',
      })
      expect(result.success).toBe(true)
    })

    it('should accept multiple fields', () => {
      const result = transactionPatchSchema.safeParse({
        description: 'Updated',
        amount: 200,
        isRecurring: true,
      })
      expect(result.success).toBe(true)
    })

    it('should accept empty object', () => {
      const result = transactionPatchSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('bulkUpdateBodySchema', () => {
    it('should validate bulk update with valid ids and patch', () => {
      const result = bulkUpdateBodySchema.safeParse({
        ids: [1, 2, 3],
        patch: { isRecurring: true },
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty ids array', () => {
      const result = bulkUpdateBodySchema.safeParse({
        ids: [],
        patch: { isRecurring: true },
      })
      expect(result.success).toBe(false)
    })

    it('should reject negative ids', () => {
      const result = bulkUpdateBodySchema.safeParse({
        ids: [-1, 2, 3],
        patch: { isRecurring: true },
      })
      expect(result.success).toBe(false)
    })

    it('should reject zero ids', () => {
      const result = bulkUpdateBodySchema.safeParse({
        ids: [0, 2, 3],
        patch: { isRecurring: true },
      })
      expect(result.success).toBe(false)
    })

    it('should reject decimal ids', () => {
      const result = bulkUpdateBodySchema.safeParse({
        ids: [1.5, 2, 3],
        patch: { isRecurring: true },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('bulkDeleteBodySchema', () => {
    it('should validate bulk delete with valid ids', () => {
      const result = bulkDeleteBodySchema.safeParse({
        ids: [1, 2, 3],
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty ids array', () => {
      const result = bulkDeleteBodySchema.safeParse({
        ids: [],
      })
      expect(result.success).toBe(false)
    })

    it('should reject non-positive ids', () => {
      const result = bulkDeleteBodySchema.safeParse({
        ids: [0, 2],
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createPersonBodySchema', () => {
    it('should validate a valid person', () => {
      const result = createPersonBodySchema.safeParse({
        name: 'John Doe',
        income: 5000,
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const result = createPersonBodySchema.safeParse({
        name: '',
        income: 5000,
      })
      expect(result.success).toBe(false)
    })

    it('should accept zero income', () => {
      const result = createPersonBodySchema.safeParse({
        name: 'John Doe',
        income: 0,
      })
      expect(result.success).toBe(true)
    })

    it('should reject negative income', () => {
      const result = createPersonBodySchema.safeParse({
        name: 'John Doe',
        income: -1000,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updatePersonBodySchema', () => {
    it('should validate a valid person update', () => {
      const result = updatePersonBodySchema.safeParse({
        personId: 'person-123',
        patch: { name: 'Jane Doe' },
      })
      expect(result.success).toBe(true)
    })

    it('should accept partial updates', () => {
      const result = updatePersonBodySchema.safeParse({
        personId: 'person-123',
        patch: { income: 6000 },
      })
      expect(result.success).toBe(true)
    })

    it('should accept empty patch', () => {
      const result = updatePersonBodySchema.safeParse({
        personId: 'person-123',
        patch: {},
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty personId', () => {
      const result = updatePersonBodySchema.safeParse({
        personId: '',
        patch: { name: 'Jane' },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateCategoryBodySchema', () => {
    it('should validate a valid category update', () => {
      const result = updateCategoryBodySchema.safeParse({
        categoryId: 'cat-123',
        patch: { name: 'Food' },
      })
      expect(result.success).toBe(true)
    })

    it('should accept targetPercent within range', () => {
      const result = updateCategoryBodySchema.safeParse({
        categoryId: 'cat-123',
        patch: { targetPercent: 50 },
      })
      expect(result.success).toBe(true)
    })

    it('should accept 0% targetPercent', () => {
      const result = updateCategoryBodySchema.safeParse({
        categoryId: 'cat-123',
        patch: { targetPercent: 0 },
      })
      expect(result.success).toBe(true)
    })

    it('should accept 100% targetPercent', () => {
      const result = updateCategoryBodySchema.safeParse({
        categoryId: 'cat-123',
        patch: { targetPercent: 100 },
      })
      expect(result.success).toBe(true)
    })

    it('should reject negative targetPercent', () => {
      const result = updateCategoryBodySchema.safeParse({
        categoryId: 'cat-123',
        patch: { targetPercent: -1 },
      })
      expect(result.success).toBe(false)
    })

    it('should reject targetPercent over 100', () => {
      const result = updateCategoryBodySchema.safeParse({
        categoryId: 'cat-123',
        patch: { targetPercent: 101 },
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty categoryId', () => {
      const result = updateCategoryBodySchema.safeParse({
        categoryId: '',
        patch: { name: 'Food' },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateDefaultPayerBodySchema', () => {
    it('should validate a valid default payer update', () => {
      const result = updateDefaultPayerBodySchema.safeParse({
        personId: 'person-123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty personId', () => {
      const result = updateDefaultPayerBodySchema.safeParse({
        personId: '',
      })
      expect(result.success).toBe(false)
    })
  })
})
