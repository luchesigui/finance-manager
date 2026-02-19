/**
 * Centralized date utilities for consistent date handling across the application.
 * Uses dayjs internally for reliable date manipulation.
 */

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

/**
 * Parses a YYYY-MM-DD date string to a Date object in local timezone.
 * Avoids timezone issues when converting date-only strings.
 * @param dateString - Date string in YYYY-MM-DD format
 */
export function parseDateString(dateString: string): Date {
  return dayjs(dateString).toDate();
}

/**
 * Converts a Date object to YYYY-MM-DD format string.
 * @param date - Date object to convert
 */
export function toDateString(date: Date): string {
  return dayjs(date).format("YYYY-MM-DD");
}

/**
 * Converts a Date object to YYYY-MM format string.
 * @param date - Date object to convert
 */
export function toYearMonthString(date: Date): string {
  return dayjs(date).format("YYYY-MM");
}

/**
 * Adds months to a date, clamping the day to the last day of the target month when needed.
 * Example: Jan 31 + 1 month -> Feb 28/29.
 * @param date - Base date
 * @param monthsToAdd - Number of months to add (can be negative)
 */
export function addMonthsClamped(date: Date, monthsToAdd: number): Date {
  return dayjs(date).add(monthsToAdd, "month").toDate();
}

/**
 * Calculates the accounting year and month for a transaction.
 * Transactions with isNextBilling are accounted for in the following month.
 * @param dateString - Transaction date in YYYY-MM-DD format
 * @param isNextBilling - Whether the transaction counts in the next month's accounting
 */
export function getAccountingYearMonth(
  dateString: string,
  isNextBilling: boolean,
): { year: number; month: number } {
  const base = dayjs(dateString);
  const accountingDate = isNextBilling ? base.add(1, "month") : base;
  return {
    year: accountingDate.year(),
    month: accountingDate.month() + 1,
  };
}

/**
 * Server-side version using UTC dates.
 */
export function getAccountingYearMonthUtc(
  dateString: string,
  isNextBilling: boolean,
): { year: number; month: number } {
  const base = dayjs.utc(dateString);
  const accountingDate = isNextBilling ? base.add(1, "month") : base;
  return {
    year: accountingDate.year(),
    month: accountingDate.month() + 1,
  };
}

/**
 * Exports the configured dayjs instance for direct usage when needed.
 * Prefer using the specific utility functions above when possible.
 */
export { dayjs };
