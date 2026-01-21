import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatPercent,
  formatMonthYear,
  formatDateString,
} from './format'

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers as Brazilian Real currency', () => {
      expect(formatCurrency(1000)).toBe('R$\u00A01.000,00')
    })

    it('should format zero as currency', () => {
      expect(formatCurrency(0)).toBe('R$\u00A00,00')
    })

    it('should format negative numbers as currency', () => {
      expect(formatCurrency(-500.50)).toBe('-R$\u00A0500,50')
    })

    it('should format decimal numbers correctly', () => {
      expect(formatCurrency(123.45)).toBe('R$\u00A0123,45')
    })

    it('should format large numbers with thousand separators', () => {
      expect(formatCurrency(1234567.89)).toBe('R$\u00A01.234.567,89')
    })

    it('should round to two decimal places', () => {
      expect(formatCurrency(10.999)).toBe('R$\u00A011,00')
    })
  })

  describe('formatPercent', () => {
    it('should format whole numbers as percentages', () => {
      expect(formatPercent(25)).toBe('25,0%')
    })

    it('should format zero as percentage', () => {
      expect(formatPercent(0)).toBe('0,0%')
    })

    it('should format decimal percentages with one decimal place', () => {
      expect(formatPercent(33.33)).toBe('33,3%')
    })

    it('should format 100% correctly', () => {
      expect(formatPercent(100)).toBe('100,0%')
    })

    it('should format percentages greater than 100%', () => {
      expect(formatPercent(150)).toBe('150,0%')
    })

    it('should format small percentages', () => {
      expect(formatPercent(0.5)).toBe('0,5%')
    })

    it('should round to one decimal place', () => {
      expect(formatPercent(33.456)).toBe('33,5%')
    })
  })

  describe('formatMonthYear', () => {
    it('should format January as "janeiro de YYYY"', () => {
      const date = new Date(2024, 0, 15) // January 15, 2024
      expect(formatMonthYear(date)).toBe('janeiro de 2024')
    })

    it('should format December as "dezembro de YYYY"', () => {
      const date = new Date(2024, 11, 15) // December 15, 2024
      expect(formatMonthYear(date)).toBe('dezembro de 2024')
    })

    it('should format February correctly', () => {
      const date = new Date(2024, 1, 15) // February 15, 2024
      expect(formatMonthYear(date)).toBe('fevereiro de 2024')
    })

    it('should format March correctly', () => {
      const date = new Date(2024, 2, 15) // March 15, 2024
      expect(formatMonthYear(date)).toBe('março de 2024')
    })

    it('should format April correctly', () => {
      const date = new Date(2024, 3, 15) // April 15, 2024
      expect(formatMonthYear(date)).toBe('abril de 2024')
    })

    it('should format May correctly', () => {
      const date = new Date(2024, 4, 15) // May 15, 2024
      expect(formatMonthYear(date)).toBe('maio de 2024')
    })

    it('should format June correctly', () => {
      const date = new Date(2024, 5, 15) // June 15, 2024
      expect(formatMonthYear(date)).toBe('junho de 2024')
    })

    it('should format July correctly', () => {
      const date = new Date(2024, 6, 15) // July 15, 2024
      expect(formatMonthYear(date)).toBe('julho de 2024')
    })

    it('should format August correctly', () => {
      const date = new Date(2024, 7, 15) // August 15, 2024
      expect(formatMonthYear(date)).toBe('agosto de 2024')
    })

    it('should format September correctly', () => {
      const date = new Date(2024, 8, 15) // September 15, 2024
      expect(formatMonthYear(date)).toBe('setembro de 2024')
    })

    it('should format October correctly', () => {
      const date = new Date(2024, 9, 15) // October 15, 2024
      expect(formatMonthYear(date)).toBe('outubro de 2024')
    })

    it('should format November correctly', () => {
      const date = new Date(2024, 10, 15) // November 15, 2024
      expect(formatMonthYear(date)).toBe('novembro de 2024')
    })
  })

  describe('formatDateString', () => {
    it('should format date string with pt-BR locale by default', () => {
      const result = formatDateString('2024-03-15')
      expect(result).toBe('15/03/2024')
    })

    it('should format date string with custom locale', () => {
      const result = formatDateString('2024-03-15', 'en-US')
      expect(result).toBe('3/15/2024')
    })

    it('should format date string at beginning of year', () => {
      const result = formatDateString('2024-01-01')
      expect(result).toBe('01/01/2024')
    })

    it('should format date string at end of year', () => {
      const result = formatDateString('2024-12-31')
      expect(result).toBe('31/12/2024')
    })

    it('should format leap day correctly', () => {
      const result = formatDateString('2024-02-29')
      expect(result).toBe('29/02/2024')
    })
  })
})
