import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH, DELETE } from './route'
import type { Transaction } from '@/lib/types'

// Mock the financeStore module
vi.mock('@/lib/server/financeStore', () => ({
  bulkUpdateTransactions: vi.fn(),
  bulkDeleteTransactions: vi.fn(),
}))

// Import mocked functions
import { bulkUpdateTransactions, bulkDeleteTransactions } from '@/lib/server/financeStore'

describe('Bulk Transactions API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PATCH /api/transactions/bulk', () => {
    it('should update multiple transactions at once', async () => {
      const updatedTransactions: Transaction[] = [
        {
          id: 1,
          description: 'Transaction 1',
          amount: 100,
          categoryId: 'cat-new',
          paidBy: 'person-1',
          isRecurring: true,
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
          categoryId: 'cat-new',
          paidBy: 'person-1',
          isRecurring: true,
          isCreditCard: false,
          excludeFromSplit: false,
          isForecast: false,
          date: '2024-03-16',
          type: 'expense',
          isIncrement: true,
        },
      ]

      vi.mocked(bulkUpdateTransactions).mockResolvedValue(updatedTransactions)

      const request = new Request('http://localhost:3000/api/transactions/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: [1, 2],
          patch: { categoryId: 'cat-new', isRecurring: true },
        }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(bulkUpdateTransactions).toHaveBeenCalledWith([1, 2], {
        categoryId: 'cat-new',
        isRecurring: true,
      })
      expect(response.status).toBe(200)
      expect(data).toEqual(updatedTransactions)
    })

    it('should reject bulk update with empty ids array', async () => {
      const request = new Request('http://localhost:3000/api/transactions/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: [],
          patch: { isRecurring: true },
        }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(bulkUpdateTransactions).not.toHaveBeenCalled()
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject bulk update with negative ids', async () => {
      const request = new Request('http://localhost:3000/api/transactions/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: [-1, 2],
          patch: { isRecurring: true },
        }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(bulkUpdateTransactions).not.toHaveBeenCalled()
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject bulk update with zero ids', async () => {
      const request = new Request('http://localhost:3000/api/transactions/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: [0, 2],
          patch: { isRecurring: true },
        }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(bulkUpdateTransactions).not.toHaveBeenCalled()
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should accept empty patch object', async () => {
      vi.mocked(bulkUpdateTransactions).mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/transactions/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: [1, 2],
          patch: {},
        }),
      })

      const response = await PATCH(request)

      expect(bulkUpdateTransactions).toHaveBeenCalledWith([1, 2], {})
      expect(response.status).toBe(200)
    })

    it('should return 500 on database error', async () => {
      vi.mocked(bulkUpdateTransactions).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/transactions/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: [1, 2],
          patch: { isRecurring: true },
        }),
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to bulk update' })
    })
  })

  describe('DELETE /api/transactions/bulk', () => {
    it('should delete multiple transactions at once', async () => {
      vi.mocked(bulkDeleteTransactions).mockResolvedValue()

      const request = new Request('http://localhost:3000/api/transactions/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [1, 2, 3] }),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(bulkDeleteTransactions).toHaveBeenCalledWith([1, 2, 3])
      expect(response.status).toBe(200)
      expect(data).toEqual({ ok: true })
    })

    it('should reject bulk delete with empty ids array', async () => {
      const request = new Request('http://localhost:3000/api/transactions/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [] }),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(bulkDeleteTransactions).not.toHaveBeenCalled()
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should reject bulk delete with invalid ids', async () => {
      const request = new Request('http://localhost:3000/api/transactions/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [0, -1] }),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(bulkDeleteTransactions).not.toHaveBeenCalled()
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should return 500 on database error', async () => {
      vi.mocked(bulkDeleteTransactions).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/transactions/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [1, 2] }),
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to bulk delete' })
    })
  })
})
