import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH, DELETE } from './route'
import type { Transaction } from '@/lib/types'

// Mock the financeStore module
vi.mock('@/lib/server/financeStore', () => ({
  getTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}))

// Import mocked functions
import { getTransaction, updateTransaction, deleteTransaction } from '@/lib/server/financeStore'

describe('Transaction [id] API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockTransaction: Transaction = {
    id: 1,
    description: 'Original transaction',
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
  }

  describe('PATCH /api/transactions/:id', () => {
    it('should update transaction with valid patch', async () => {
      const patch = {
        description: 'Updated description',
        amount: 150,
      }

      const updatedTransaction = {
        ...mockTransaction,
        ...patch,
      }

      vi.mocked(getTransaction).mockResolvedValue(mockTransaction)
      vi.mocked(updateTransaction).mockResolvedValue(updatedTransaction)

      const request = new Request('http://localhost:3000/api/transactions/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch }),
      })

      const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(getTransaction).toHaveBeenCalledWith(1)
      expect(updateTransaction).toHaveBeenCalledWith(1, patch)
      expect(response.status).toBe(200)
      expect(data).toEqual(updatedTransaction)
    })

    it('should update only specified fields', async () => {
      const patch = { isRecurring: true }

      const updatedTransaction = {
        ...mockTransaction,
        isRecurring: true,
      }

      vi.mocked(getTransaction).mockResolvedValue(mockTransaction)
      vi.mocked(updateTransaction).mockResolvedValue(updatedTransaction)

      const request = new Request('http://localhost:3000/api/transactions/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch }),
      })

      const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(updateTransaction).toHaveBeenCalledWith(1, { isRecurring: true })
      expect(data.isRecurring).toBe(true)
      expect(data.description).toBe('Original transaction')
    })

    it('should return 400 for invalid transaction id', async () => {
      const request = new Request('http://localhost:3000/api/transactions/abc', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch: { description: 'Test' } }),
      })

      const response = await PATCH(request, { params: Promise.resolve({ id: 'abc' }) })
      const data = await response.json()

      expect(getTransaction).not.toHaveBeenCalled()
      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid id' })
    })

    it('should return 404 when transaction not found', async () => {
      vi.mocked(getTransaction).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/transactions/999', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch: { description: 'Test' } }),
      })

      const response = await PATCH(request, { params: Promise.resolve({ id: '999' }) })
      const data = await response.json()

      expect(getTransaction).toHaveBeenCalledWith(999)
      expect(updateTransaction).not.toHaveBeenCalled()
      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Not found' })
    })

    it('should return 400 for invalid patch data', async () => {
      const request = new Request('http://localhost:3000/api/transactions/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' }),
      })

      const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(getTransaction).not.toHaveBeenCalled()
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should return 500 on database error', async () => {
      vi.mocked(getTransaction).mockResolvedValue(mockTransaction)
      vi.mocked(updateTransaction).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/transactions/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch: { description: 'Test' } }),
      })

      const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to update' })
    })
  })

  describe('DELETE /api/transactions/:id', () => {
    it('should delete existing transaction', async () => {
      vi.mocked(getTransaction).mockResolvedValue(mockTransaction)
      vi.mocked(deleteTransaction).mockResolvedValue()

      const request = new Request('http://localhost:3000/api/transactions/1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(getTransaction).toHaveBeenCalledWith(1)
      expect(deleteTransaction).toHaveBeenCalledWith(1)
      expect(response.status).toBe(200)
      expect(data).toEqual({ ok: true })
    })

    it('should return 400 for invalid transaction id', async () => {
      const request = new Request('http://localhost:3000/api/transactions/abc', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve({ id: 'abc' }) })
      const data = await response.json()

      expect(getTransaction).not.toHaveBeenCalled()
      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid id' })
    })

    it('should return 404 when transaction not found', async () => {
      vi.mocked(getTransaction).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/transactions/999', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve({ id: '999' }) })
      const data = await response.json()

      expect(getTransaction).toHaveBeenCalledWith(999)
      expect(deleteTransaction).not.toHaveBeenCalled()
      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Not found' })
    })

    it('should return 500 on database error', async () => {
      vi.mocked(getTransaction).mockResolvedValue(mockTransaction)
      vi.mocked(deleteTransaction).mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/transactions/1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to delete' })
    })
  })
})
