import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import type { Transaction } from '@/lib/types'

// Mock the financeStore module
vi.mock('@/lib/server/financeStore', () => ({
  getTransactions: vi.fn(),
  createTransaction: vi.fn(),
}))

// Import mocked functions
import { getTransactions, createTransaction } from '@/lib/server/financeStore'

describe('Transactions API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/transactions', () => {
    it('should fetch all transactions when no query params provided', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          description: 'Groceries',
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
      ]

      vi.mocked(getTransactions).mockResolvedValue(mockTransactions)

      const request = new Request('http://localhost:3000/api/transactions')
      const response = await GET(request)
      const data = await response.json()

      expect(getTransactions).toHaveBeenCalledWith(undefined, undefined)
      expect(response.status).toBe(200)
      expect(data).toEqual(mockTransactions)
    })

    it('should fetch transactions filtered by year and month', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          description: 'March expense',
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
      ]

      vi.mocked(getTransactions).mockResolvedValue(mockTransactions)

      const request = new Request('http://localhost:3000/api/transactions?year=2024&month=3')
      const response = await GET(request)
      const data = await response.json()

      expect(getTransactions).toHaveBeenCalledWith(2024, 3)
      expect(response.status).toBe(200)
      expect(data).toEqual(mockTransactions)
    })

    it('should return 500 on database error', async () => {
      vi.mocked(getTransactions).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/transactions')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch transactions' })
    })
  })

  describe('POST /api/transactions', () => {
    it('should create a single transaction with valid data', async () => {
      const validTransaction = {
        description: 'Test transaction',
        amount: 100,
        categoryId: 'cat-1',
        paidBy: 'person-1',
        isRecurring: false,
        isCreditCard: false,
        excludeFromSplit: false,
        date: '2024-03-15',
      }

      const createdTransaction: Transaction = {
        id: 1,
        ...validTransaction,
        isForecast: false,
        type: 'expense',
        isIncrement: true,
      }

      vi.mocked(createTransaction).mockResolvedValue(createdTransaction)

      const request = new Request('http://localhost:3000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validTransaction),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Test transaction',
          amount: 100,
          categoryId: 'cat-1',
          paidBy: 'person-1',
        })
      )
      expect(response.status).toBe(201)
      expect(data).toEqual(createdTransaction)
    })

    it('should create multiple transactions from array', async () => {
      const validTransactions = [
        {
          description: 'Transaction 1',
          amount: 100,
          categoryId: 'cat-1',
          paidBy: 'person-1',
          isRecurring: false,
          isCreditCard: false,
          excludeFromSplit: false,
          date: '2024-03-15',
        },
        {
          description: 'Transaction 2',
          amount: 200,
          categoryId: 'cat-2',
          paidBy: 'person-2',
          isRecurring: false,
          isCreditCard: false,
          excludeFromSplit: false,
          date: '2024-03-16',
        },
      ]

      const createdTransactions: Transaction[] = validTransactions.map((t, i) => ({
        id: i + 1,
        ...t,
        isForecast: false,
        type: 'expense' as const,
        isIncrement: true,
      }))

      vi.mocked(createTransaction)
        .mockResolvedValueOnce(createdTransactions[0])
        .mockResolvedValueOnce(createdTransactions[1])

      const request = new Request('http://localhost:3000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validTransactions),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(createTransaction).toHaveBeenCalledTimes(2)
      expect(response.status).toBe(201)
      expect(data).toEqual(createdTransactions)
    })

    it('should reject transaction with empty description', async () => {
      const invalidTransaction = {
        description: '',
        amount: 100,
        categoryId: 'cat-1',
        paidBy: 'person-1',
        isRecurring: false,
        isCreditCard: false,
        excludeFromSplit: false,
        date: '2024-03-15',
      }

      const request = new Request('http://localhost:3000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTransaction),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(createTransaction).not.toHaveBeenCalled()
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject transaction with negative amount', async () => {
      const invalidTransaction = {
        description: 'Test',
        amount: -100,
        categoryId: 'cat-1',
        paidBy: 'person-1',
        isRecurring: false,
        isCreditCard: false,
        excludeFromSplit: false,
        date: '2024-03-15',
      }

      const request = new Request('http://localhost:3000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTransaction),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(createTransaction).not.toHaveBeenCalled()
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject transaction with zero amount', async () => {
      const invalidTransaction = {
        description: 'Test',
        amount: 0,
        categoryId: 'cat-1',
        paidBy: 'person-1',
        isRecurring: false,
        isCreditCard: false,
        excludeFromSplit: false,
        date: '2024-03-15',
      }

      const request = new Request('http://localhost:3000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTransaction),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(createTransaction).not.toHaveBeenCalled()
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject transaction with invalid date format', async () => {
      const invalidTransaction = {
        description: 'Test',
        amount: 100,
        categoryId: 'cat-1',
        paidBy: 'person-1',
        isRecurring: false,
        isCreditCard: false,
        excludeFromSplit: false,
        date: '15-03-2024', // Wrong format
      }

      const request = new Request('http://localhost:3000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTransaction),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(createTransaction).not.toHaveBeenCalled()
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject transaction with empty paidBy', async () => {
      const invalidTransaction = {
        description: 'Test',
        amount: 100,
        categoryId: 'cat-1',
        paidBy: '',
        isRecurring: false,
        isCreditCard: false,
        excludeFromSplit: false,
        date: '2024-03-15',
      }

      const request = new Request('http://localhost:3000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTransaction),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(createTransaction).not.toHaveBeenCalled()
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should accept null categoryId', async () => {
      const validTransaction = {
        description: 'Income',
        amount: 1000,
        categoryId: null,
        paidBy: 'person-1',
        isRecurring: false,
        isCreditCard: false,
        excludeFromSplit: false,
        date: '2024-03-15',
        type: 'income',
      }

      const createdTransaction: Transaction = {
        id: 1,
        ...validTransaction,
        isForecast: false,
        isIncrement: true,
      }

      vi.mocked(createTransaction).mockResolvedValue(createdTransaction)

      const request = new Request('http://localhost:3000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validTransaction),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(createTransaction).toHaveBeenCalled()
      expect(response.status).toBe(201)
      expect(data.categoryId).toBeNull()
    })

    it('should return 500 on database error', async () => {
      const validTransaction = {
        description: 'Test',
        amount: 100,
        categoryId: 'cat-1',
        paidBy: 'person-1',
        isRecurring: false,
        isCreditCard: false,
        excludeFromSplit: false,
        date: '2024-03-15',
      }

      vi.mocked(createTransaction).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validTransaction),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create transactions' })
    })
  })
})
