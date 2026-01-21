import { describe, it, expect } from 'vitest';
import {
  parseDateString,
  parseDateStringUtc,
  toDateString,
  toYearMonthString,
  addMonthsClamped,
  addMonthsClampedUtc,
  getAccountingYearMonth,
  getAccountingYearMonthUtc,
} from './dateUtils';

describe('dateUtils', () => {
  describe('parseDateString', () => {
    it('should parse YYYY-MM-DD to Date in local time', () => {
      const date = parseDateString('2024-01-15');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(15);
    });
  });

  describe('parseDateStringUtc', () => {
    it('should parse YYYY-MM-DD to Date in UTC', () => {
      const date = parseDateStringUtc('2024-01-15');
      expect(date.getUTCFullYear()).toBe(2024);
      expect(date.getUTCMonth()).toBe(0);
      expect(date.getUTCDate()).toBe(15);
    });
  });

  describe('toDateString', () => {
    it('should format Date to YYYY-MM-DD', () => {
      const date = new Date(2024, 0, 15);
      expect(toDateString(date)).toBe('2024-01-15');
    });

    it('should pad single digits', () => {
      const date = new Date(2024, 0, 5);
      expect(toDateString(date)).toBe('2024-01-05');
    });
  });

  describe('toYearMonthString', () => {
    it('should format Date to YYYY-MM', () => {
      const date = new Date(2024, 0, 15);
      expect(toYearMonthString(date)).toBe('2024-01');
    });
  });

  describe('addMonthsClamped', () => {
    it('should add months correctly', () => {
      const date = new Date(2024, 0, 15); // Jan 15
      const result = addMonthsClamped(date, 1);
      expect(result.getMonth()).toBe(1); // Feb
      expect(result.getDate()).toBe(15);
    });

    it('should clamp to end of month if target month has fewer days', () => {
      const date = new Date(2024, 0, 31); // Jan 31
      const result = addMonthsClamped(date, 1);
      // 2024 is leap year, so Feb 29
      expect(result.getMonth()).toBe(1); // Feb
      expect(result.getDate()).toBe(29);
    });

    it('should handle negative months', () => {
      const date = new Date(2024, 2, 31); // Mar 31
      const result = addMonthsClamped(date, -1);
      // Feb 29 (leap year)
      expect(result.getMonth()).toBe(1);
      expect(result.getDate()).toBe(29);
    });
  });

  describe('addMonthsClampedUtc', () => {
    it('should add months correctly in UTC', () => {
      const date = new Date(Date.UTC(2024, 0, 15));
      const result = addMonthsClampedUtc(date, 1);
      expect(result.getUTCMonth()).toBe(1);
      expect(result.getUTCDate()).toBe(15);
    });

    it('should clamp to end of month in UTC', () => {
      const date = new Date(Date.UTC(2024, 0, 31));
      const result = addMonthsClampedUtc(date, 1);
      expect(result.getUTCMonth()).toBe(1);
      expect(result.getUTCDate()).toBe(29);
    });
  });

  describe('getAccountingYearMonth', () => {
    it('should return same month for non-credit card', () => {
      const result = getAccountingYearMonth('2024-01-15', false);
      expect(result).toEqual({ year: 2024, month: 1 });
    });

    it('should return next month for credit card', () => {
      const result = getAccountingYearMonth('2024-01-15', true);
      expect(result).toEqual({ year: 2024, month: 2 });
    });

    it('should handle year rollover for credit card', () => {
      const result = getAccountingYearMonth('2024-12-15', true);
      expect(result).toEqual({ year: 2025, month: 1 });
    });
  });

  describe('getAccountingYearMonthUtc', () => {
    it('should return same month for non-credit card (UTC)', () => {
      const result = getAccountingYearMonthUtc('2024-01-15', false);
      expect(result).toEqual({ year: 2024, month: 1 });
    });

    it('should return next month for credit card (UTC)', () => {
      const result = getAccountingYearMonthUtc('2024-01-15', true);
      expect(result).toEqual({ year: 2024, month: 2 });
    });
  });
});
