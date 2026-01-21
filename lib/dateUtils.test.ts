import { describe, it, expect } from 'vitest'
import {
  parseDateString,
  parseDateStringUtc,
  toDateString,
  toYearMonthString,
  addMonthsClamped,
  addMonthsClampedUtc,
  getAccountingYearMonth,
  getAccountingYearMonthUtc,
} from './dateUtils'

describe('dateUtils', () => {
  describe('parseDateString', () => {
    it('should parse a valid date string to Date object in local timezone', () => {
      const result = parseDateString('2024-03-15')
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(2) // 0-indexed, March = 2
      expect(result.getDate()).toBe(15)
    })

    it('should handle single-digit months and days', () => {
      const result = parseDateString('2024-01-05')
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(5)
    })

    it('should handle end of year dates', () => {
      const result = parseDateString('2024-12-31')
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(11)
      expect(result.getDate()).toBe(31)
    })

    it('should handle leap year dates', () => {
      const result = parseDateString('2024-02-29')
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(29)
    })
  })

  describe('parseDateStringUtc', () => {
    it('should parse a valid date string to UTC Date object', () => {
      const result = parseDateStringUtc('2024-03-15')
      expect(result.getUTCFullYear()).toBe(2024)
      expect(result.getUTCMonth()).toBe(2)
      expect(result.getUTCDate()).toBe(15)
    })

    it('should handle leap year dates in UTC', () => {
      const result = parseDateStringUtc('2024-02-29')
      expect(result.getUTCFullYear()).toBe(2024)
      expect(result.getUTCMonth()).toBe(1)
      expect(result.getUTCDate()).toBe(29)
    })
  })

  describe('toDateString', () => {
    it('should convert Date to YYYY-MM-DD format', () => {
      const date = new Date(2024, 2, 15) // March 15, 2024
      expect(toDateString(date)).toBe('2024-03-15')
    })

    it('should pad single-digit months and days with zeros', () => {
      const date = new Date(2024, 0, 5) // January 5, 2024
      expect(toDateString(date)).toBe('2024-01-05')
    })

    it('should handle end of year dates', () => {
      const date = new Date(2024, 11, 31) // December 31, 2024
      expect(toDateString(date)).toBe('2024-12-31')
    })

    it('should handle leap year dates', () => {
      const date = new Date(2024, 1, 29) // February 29, 2024
      expect(toDateString(date)).toBe('2024-02-29')
    })
  })

  describe('toYearMonthString', () => {
    it('should convert Date to YYYY-MM format', () => {
      const date = new Date(2024, 2, 15) // March 15, 2024
      expect(toYearMonthString(date)).toBe('2024-03')
    })

    it('should pad single-digit months with zeros', () => {
      const date = new Date(2024, 0, 15) // January 15, 2024
      expect(toYearMonthString(date)).toBe('2024-01')
    })

    it('should handle December', () => {
      const date = new Date(2024, 11, 15) // December 15, 2024
      expect(toYearMonthString(date)).toBe('2024-12')
    })
  })

  describe('addMonthsClamped', () => {
    it('should add positive months correctly', () => {
      const date = new Date(2024, 0, 15) // January 15, 2024
      const result = addMonthsClamped(date, 2)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(2) // March
      expect(result.getDate()).toBe(15)
    })

    it('should subtract negative months correctly', () => {
      const date = new Date(2024, 2, 15) // March 15, 2024
      const result = addMonthsClamped(date, -2)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(15)
    })

    it('should clamp day when target month has fewer days (Jan 31 -> Feb 28)', () => {
      const date = new Date(2024, 0, 31) // January 31, 2024
      const result = addMonthsClamped(date, 1)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(29) // 2024 is a leap year
    })

    it('should clamp day for non-leap year (Jan 31 -> Feb 28)', () => {
      const date = new Date(2023, 0, 31) // January 31, 2023
      const result = addMonthsClamped(date, 1)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(28) // 2023 is not a leap year
    })

    it('should handle month rollover to next year', () => {
      const date = new Date(2024, 11, 15) // December 15, 2024
      const result = addMonthsClamped(date, 2)
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(15)
    })

    it('should handle month rollback to previous year', () => {
      const date = new Date(2024, 1, 15) // February 15, 2024
      const result = addMonthsClamped(date, -3)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(10) // November
      expect(result.getDate()).toBe(15)
    })

    it('should handle adding zero months', () => {
      const date = new Date(2024, 5, 15) // June 15, 2024
      const result = addMonthsClamped(date, 0)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(5)
      expect(result.getDate()).toBe(15)
    })

    it('should clamp May 31 to April 30', () => {
      const date = new Date(2024, 4, 31) // May 31, 2024
      const result = addMonthsClamped(date, -1)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(3) // April
      expect(result.getDate()).toBe(30) // April has 30 days
    })
  })

  describe('addMonthsClampedUtc', () => {
    it('should add positive months correctly in UTC', () => {
      const date = new Date(Date.UTC(2024, 0, 15))
      const result = addMonthsClampedUtc(date, 2)
      expect(result.getUTCFullYear()).toBe(2024)
      expect(result.getUTCMonth()).toBe(2) // March
      expect(result.getUTCDate()).toBe(15)
    })

    it('should clamp day when target month has fewer days in UTC', () => {
      const date = new Date(Date.UTC(2024, 0, 31))
      const result = addMonthsClampedUtc(date, 1)
      expect(result.getUTCFullYear()).toBe(2024)
      expect(result.getUTCMonth()).toBe(1) // February
      expect(result.getUTCDate()).toBe(29) // 2024 is a leap year
    })

    it('should handle month rollover to next year in UTC', () => {
      const date = new Date(Date.UTC(2024, 11, 15))
      const result = addMonthsClampedUtc(date, 2)
      expect(result.getUTCFullYear()).toBe(2025)
      expect(result.getUTCMonth()).toBe(1) // February
      expect(result.getUTCDate()).toBe(15)
    })
  })

  describe('getAccountingYearMonth', () => {
    it('should return same year and month for non-credit card transactions', () => {
      const result = getAccountingYearMonth('2024-03-15', false)
      expect(result.year).toBe(2024)
      expect(result.month).toBe(3)
    })

    it('should add one month for credit card transactions', () => {
      const result = getAccountingYearMonth('2024-03-15', true)
      expect(result.year).toBe(2024)
      expect(result.month).toBe(4) // April
    })

    it('should handle year rollover for credit card transactions in December', () => {
      const result = getAccountingYearMonth('2024-12-15', true)
      expect(result.year).toBe(2025)
      expect(result.month).toBe(1) // January
    })

    it('should handle credit card transaction on Jan 31 accounting to February', () => {
      const result = getAccountingYearMonth('2024-01-31', true)
      expect(result.year).toBe(2024)
      expect(result.month).toBe(2) // February (day is clamped internally)
    })

    it('should handle non-credit card transaction on leap day', () => {
      const result = getAccountingYearMonth('2024-02-29', false)
      expect(result.year).toBe(2024)
      expect(result.month).toBe(2)
    })
  })

  describe('getAccountingYearMonthUtc', () => {
    it('should return same year and month for non-credit card transactions (UTC)', () => {
      const result = getAccountingYearMonthUtc('2024-03-15', false)
      expect(result.year).toBe(2024)
      expect(result.month).toBe(3)
    })

    it('should add one month for credit card transactions (UTC)', () => {
      const result = getAccountingYearMonthUtc('2024-03-15', true)
      expect(result.year).toBe(2024)
      expect(result.month).toBe(4) // April
    })

    it('should handle year rollover for credit card transactions in December (UTC)', () => {
      const result = getAccountingYearMonthUtc('2024-12-15', true)
      expect(result.year).toBe(2025)
      expect(result.month).toBe(1) // January
    })

    it('should handle credit card transaction on Jan 31 accounting to February (UTC)', () => {
      const result = getAccountingYearMonthUtc('2024-01-31', true)
      expect(result.year).toBe(2024)
      expect(result.month).toBe(2) // February
    })
  })
})
