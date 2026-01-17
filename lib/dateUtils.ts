/**
 * Centralized date utilities for consistent date handling across the application.
 * Eliminates duplication of date parsing and manipulation logic.
 */

/**
 * Parses a YYYY-MM-DD date string to a Date object in local timezone.
 * Avoids timezone issues when converting date-only strings.
 * @param dateString - Date string in YYYY-MM-DD format
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Parses a YYYY-MM-DD date string to a Date object in UTC timezone.
 * @param dateString - Date string in YYYY-MM-DD format
 */
export function parseDateStringUtc(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Converts a Date object to YYYY-MM-DD format string.
 * @param date - Date object to convert
 */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Converts a Date object to YYYY-MM format string.
 * @param date - Date object to convert
 */
export function toYearMonthString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Adds months to a date, clamping the day to the last day of the target month when needed.
 * Example: Jan 31 + 1 month -> Feb 28/29.
 * @param date - Base date
 * @param monthsToAdd - Number of months to add (can be negative)
 */
export function addMonthsClamped(date: Date, monthsToAdd: number): Date {
  const originalDay = date.getDate();
  const targetMonthIndex = date.getMonth() + monthsToAdd;
  const candidate = new Date(date.getFullYear(), targetMonthIndex, originalDay);

  // Calculate expected month index (handling negative values)
  const expectedMonthIndex = ((targetMonthIndex % 12) + 12) % 12;

  // If month rolled over, clamp to last day of the target month
  if (candidate.getMonth() !== expectedMonthIndex) {
    return new Date(date.getFullYear(), targetMonthIndex + 1, 0);
  }

  return candidate;
}

/**
 * Adds months to a UTC date, clamping the day to the last day of the target month when needed.
 * @param date - Base UTC date
 * @param monthsToAdd - Number of months to add (can be negative)
 */
export function addMonthsClampedUtc(date: Date, monthsToAdd: number): Date {
  const year = date.getUTCFullYear();
  const monthIndex = date.getUTCMonth();
  const day = date.getUTCDate();

  const targetMonthIndex = monthIndex + monthsToAdd;
  const candidate = new Date(Date.UTC(year, targetMonthIndex, day));

  const expectedMonthIndex = ((targetMonthIndex % 12) + 12) % 12;

  // Day overflowed; clamp to last day of target month
  if (candidate.getUTCMonth() !== expectedMonthIndex) {
    return new Date(Date.UTC(year, targetMonthIndex + 1, 0));
  }

  return candidate;
}

/**
 * Calculates the accounting year and month for a transaction.
 * Credit card transactions are accounted for in the following month.
 * @param dateString - Transaction date in YYYY-MM-DD format
 * @param isCreditCard - Whether the transaction is a credit card expense
 */
export function getAccountingYearMonth(
  dateString: string,
  isCreditCard: boolean,
): { year: number; month: number } {
  const base = parseDateString(dateString);
  const accountingDate = isCreditCard ? addMonthsClamped(base, 1) : base;
  return {
    year: accountingDate.getFullYear(),
    month: accountingDate.getMonth() + 1,
  };
}

/**
 * Server-side version using UTC dates.
 */
export function getAccountingYearMonthUtc(
  dateString: string,
  isCreditCard: boolean,
): { year: number; month: number } {
  const base = parseDateStringUtc(dateString);
  const accountingDate = isCreditCard ? addMonthsClampedUtc(base, 1) : base;
  return {
    year: accountingDate.getUTCFullYear(),
    month: accountingDate.getUTCMonth() + 1,
  };
}
