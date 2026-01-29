import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercent,
  formatMonthYear,
  formatDateString,
} from './format';

describe('format', () => {
  describe('formatCurrency', () => {
    it('should format number as BRL currency', () => {
      // Note: The exact output depends on the locale implementation in the environment (Node/JSDOM)
      // We check for key components like "R$" and comma/dot usage.
      const result = formatCurrency(1234.56);
      expect(result).toContain('R$');
      expect(result).toContain('1.234,56');
    });
  });

  describe('formatPercent', () => {
    it('should format number as percentage', () => {
      const result = formatPercent(25.5);
      expect(result).toBe('25,5%');
    });

    it('should handle integer values', () => {
      const result = formatPercent(50);
      expect(result).toBe('50,0%');
    });
  });

  describe('formatMonthYear', () => {
    it('should format date as month and year', () => {
      const date = new Date(2024, 0, 15); // January 2024
      const result = formatMonthYear(date);
      expect(result.toLowerCase()).toBe('janeiro de 2024');
    });
  });

  describe('formatDateString', () => {
    it('should format YYYY-MM-DD string to localized date', () => {
      const result = formatDateString('2024-01-15');
      // "15/01/2024" is standard pt-BR short date format
      expect(result).toBe('15/01/2024');
    });
  });
});
