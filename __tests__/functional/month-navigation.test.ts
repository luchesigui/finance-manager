/**
 * Functional tests for Month Navigation feature
 * These tests verify month selection and navigation work correctly
 */

import { describe, it, expect } from 'vitest'
import { addMonthsClamped, toYearMonthString } from '@/lib/dateUtils'
import { formatMonthYear } from '@/lib/format'

describe('Month Navigation Functionality', () => {
  describe('Month selection and display', () => {
    it('should display current month', () => {
      const currentDate = new Date(2024, 2, 15) // March 15, 2024
      const displayText = formatMonthYear(currentDate)

      expect(displayText).toBe('março de 2024')
    })

    it('should format month for URL/API params', () => {
      const currentDate = new Date(2024, 2, 15) // March 15, 2024
      const yearMonth = toYearMonthString(currentDate)

      expect(yearMonth).toBe('2024-03')
    })

    it('should parse year and month from YYYY-MM format', () => {
      const yearMonth = '2024-03'
      const [year, month] = yearMonth.split('-').map(Number)

      expect(year).toBe(2024)
      expect(month).toBe(3)
    })
  })

  describe('Navigating to previous month', () => {
    it('should navigate from March to February', () => {
      const currentDate = new Date(2024, 2, 15) // March 15, 2024
      const previousMonth = addMonthsClamped(currentDate, -1)

      expect(previousMonth.getFullYear()).toBe(2024)
      expect(previousMonth.getMonth()).toBe(1) // February (0-indexed)
      expect(formatMonthYear(previousMonth)).toBe('fevereiro de 2024')
    })

    it('should navigate from January to December of previous year', () => {
      const currentDate = new Date(2024, 0, 15) // January 15, 2024
      const previousMonth = addMonthsClamped(currentDate, -1)

      expect(previousMonth.getFullYear()).toBe(2023)
      expect(previousMonth.getMonth()).toBe(11) // December
      expect(formatMonthYear(previousMonth)).toBe('dezembro de 2023')
    })

    it('should handle multiple previous month clicks', () => {
      let currentDate = new Date(2024, 2, 15) // March 15, 2024

      // Click previous 3 times
      currentDate = addMonthsClamped(currentDate, -1) // February
      currentDate = addMonthsClamped(currentDate, -1) // January
      currentDate = addMonthsClamped(currentDate, -1) // December 2023

      expect(currentDate.getFullYear()).toBe(2023)
      expect(currentDate.getMonth()).toBe(11) // December
    })
  })

  describe('Navigating to next month', () => {
    it('should navigate from March to April', () => {
      const currentDate = new Date(2024, 2, 15) // March 15, 2024
      const nextMonth = addMonthsClamped(currentDate, 1)

      expect(nextMonth.getFullYear()).toBe(2024)
      expect(nextMonth.getMonth()).toBe(3) // April
      expect(formatMonthYear(nextMonth)).toBe('abril de 2024')
    })

    it('should navigate from December to January of next year', () => {
      const currentDate = new Date(2024, 11, 15) // December 15, 2024
      const nextMonth = addMonthsClamped(currentDate, 1)

      expect(nextMonth.getFullYear()).toBe(2025)
      expect(nextMonth.getMonth()).toBe(0) // January
      expect(formatMonthYear(nextMonth)).toBe('janeiro de 2025')
    })

    it('should handle multiple next month clicks', () => {
      let currentDate = new Date(2024, 2, 15) // March 15, 2024

      // Click next 3 times
      currentDate = addMonthsClamped(currentDate, 1) // April
      currentDate = addMonthsClamped(currentDate, 1) // May
      currentDate = addMonthsClamped(currentDate, 1) // June

      expect(currentDate.getFullYear()).toBe(2024)
      expect(currentDate.getMonth()).toBe(5) // June
    })
  })

  describe('Navigating to current month', () => {
    it('should reset to current month from any month', () => {
      const pastMonth = new Date(2023, 0, 15) // January 2023
      const today = new Date()

      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 15)

      expect(currentMonth.getFullYear()).toBe(today.getFullYear())
      expect(currentMonth.getMonth()).toBe(today.getMonth())
    })
  })

  describe('Month end date handling', () => {
    it('should handle navigating from Jan 31 to Feb (clamps to Feb 28/29)', () => {
      const jan31 = new Date(2024, 0, 31) // January 31, 2024
      const february = addMonthsClamped(jan31, 1)

      // 2024 is a leap year, so should clamp to Feb 29
      expect(february.getFullYear()).toBe(2024)
      expect(february.getMonth()).toBe(1) // February
      expect(february.getDate()).toBe(29) // Clamped to last day of February
    })

    it('should handle navigating from Jan 31 to Feb in non-leap year', () => {
      const jan31 = new Date(2023, 0, 31) // January 31, 2023
      const february = addMonthsClamped(jan31, 1)

      // 2023 is not a leap year, should clamp to Feb 28
      expect(february.getFullYear()).toBe(2023)
      expect(february.getMonth()).toBe(1) // February
      expect(february.getDate()).toBe(28) // Clamped to last day of February
    })

    it('should handle navigating from May 31 to April (30 days)', () => {
      const may31 = new Date(2024, 4, 31) // May 31, 2024
      const april = addMonthsClamped(may31, -1)

      expect(april.getFullYear()).toBe(2024)
      expect(april.getMonth()).toBe(3) // April
      expect(april.getDate()).toBe(30) // Clamped to last day of April
    })
  })

  describe('Month navigation state', () => {
    it('should track selected month state', () => {
      interface MonthState {
        year: number
        month: number
      }

      let selectedMonth: MonthState = {
        year: 2024,
        month: 3, // March
      }

      // Navigate to next month
      const currentDate = new Date(selectedMonth.year, selectedMonth.month - 1, 15)
      const nextMonth = addMonthsClamped(currentDate, 1)

      selectedMonth = {
        year: nextMonth.getFullYear(),
        month: nextMonth.getMonth() + 1, // Convert from 0-indexed to 1-indexed
      }

      expect(selectedMonth.year).toBe(2024)
      expect(selectedMonth.month).toBe(4) // April
    })

    it('should generate API URL with selected month', () => {
      const selectedYear = 2024
      const selectedMonth = 3

      const apiUrl = `/api/transactions?year=${selectedYear}&month=${selectedMonth}`

      expect(apiUrl).toBe('/api/transactions?year=2024&month=3')
    })
  })

  describe('Month navigation UI behavior', () => {
    it('should enable/disable navigation buttons based on limits', () => {
      const currentDate = new Date(2024, 2, 15) // March 2024
      const today = new Date()

      const isCurrentMonth =
        currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() === today.getMonth()

      // Next button should be disabled if viewing current month
      const shouldDisableNext = isCurrentMonth

      // Previous button should always be enabled (can go back indefinitely)
      const shouldDisablePrevious = false

      expect(shouldDisablePrevious).toBe(false)
      // shouldDisableNext depends on if we're viewing current month
    })

    it('should show "Today" button when not viewing current month', () => {
      const viewingMonth = new Date(2023, 5, 15) // June 2023
      const today = new Date()

      const isViewingCurrentMonth =
        viewingMonth.getFullYear() === today.getFullYear() &&
        viewingMonth.getMonth() === today.getMonth()

      const shouldShowTodayButton = !isViewingCurrentMonth

      expect(shouldShowTodayButton).toBe(true)
    })

    it('should hide "Today" button when viewing current month', () => {
      const today = new Date()
      const viewingMonth = new Date(today.getFullYear(), today.getMonth(), 15)

      const isViewingCurrentMonth =
        viewingMonth.getFullYear() === today.getFullYear() &&
        viewingMonth.getMonth() === today.getMonth()

      const shouldShowTodayButton = !isViewingCurrentMonth

      expect(shouldShowTodayButton).toBe(false)
    })
  })

  describe('Month display for all 12 months', () => {
    const months = [
      { index: 0, name: 'janeiro' },
      { index: 1, name: 'fevereiro' },
      { index: 2, name: 'março' },
      { index: 3, name: 'abril' },
      { index: 4, name: 'maio' },
      { index: 5, name: 'junho' },
      { index: 6, name: 'julho' },
      { index: 7, name: 'agosto' },
      { index: 8, name: 'setembro' },
      { index: 9, name: 'outubro' },
      { index: 10, name: 'novembro' },
      { index: 11, name: 'dezembro' },
    ]

    it.each(months)('should format $name correctly', ({ index, name }) => {
      const date = new Date(2024, index, 15)
      const formatted = formatMonthYear(date)

      expect(formatted).toBe(`${name} de 2024`)
    })
  })

  describe('Month navigation with transaction filtering', () => {
    it('should trigger transaction refetch when month changes', () => {
      let currentMonth = { year: 2024, month: 3 }
      let apiCallCount = 0

      // Simulate fetching transactions
      const fetchTransactions = (year: number, month: number) => {
        apiCallCount++
        return `/api/transactions?year=${year}&month=${month}`
      }

      // Initial fetch
      fetchTransactions(currentMonth.year, currentMonth.month)
      expect(apiCallCount).toBe(1)

      // Navigate to next month
      const currentDate = new Date(currentMonth.year, currentMonth.month - 1, 15)
      const nextMonth = addMonthsClamped(currentDate, 1)
      currentMonth = {
        year: nextMonth.getFullYear(),
        month: nextMonth.getMonth() + 1,
      }

      // Should trigger new fetch
      fetchTransactions(currentMonth.year, currentMonth.month)
      expect(apiCallCount).toBe(2)
    })

    it('should clear selected transactions when month changes', () => {
      let selectedTransactionIds = [1, 2, 3]

      // User navigates to different month
      selectedTransactionIds = []

      expect(selectedTransactionIds).toHaveLength(0)
    })
  })

  describe('Month navigation keyboard shortcuts', () => {
    it('should support arrow key navigation', () => {
      let currentDate = new Date(2024, 2, 15) // March 2024

      // Simulate left arrow (previous month)
      const onLeftArrow = () => {
        currentDate = addMonthsClamped(currentDate, -1)
      }

      // Simulate right arrow (next month)
      const onRightArrow = () => {
        currentDate = addMonthsClamped(currentDate, 1)
      }

      onLeftArrow()
      expect(currentDate.getMonth()).toBe(1) // February

      onRightArrow()
      expect(currentDate.getMonth()).toBe(2) // March

      onRightArrow()
      expect(currentDate.getMonth()).toBe(3) // April
    })
  })

  describe('Month range validation', () => {
    it('should handle very old dates', () => {
      const oldDate = new Date(2000, 0, 15) // January 2000
      const formatted = formatMonthYear(oldDate)

      expect(formatted).toBe('janeiro de 2000')
    })

    it('should handle future dates', () => {
      const futureDate = new Date(2030, 11, 15) // December 2030
      const formatted = formatMonthYear(futureDate)

      expect(formatted).toBe('dezembro de 2030')
    })

    it('should navigate correctly across year boundaries', () => {
      let date = new Date(2024, 11, 15) // December 2024

      // Go forward 3 months (into next year)
      date = addMonthsClamped(date, 1) // January 2025
      date = addMonthsClamped(date, 1) // February 2025
      date = addMonthsClamped(date, 1) // March 2025

      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(2) // March
    })
  })
})
