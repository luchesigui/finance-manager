import { parseDateString } from "@/lib/dateUtils";

// Re-export parseDateString for backwards compatibility
export { parseDateString } from "@/lib/dateUtils";

// ============================================================================
// Currency Formatting
// ============================================================================

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/**
 * Formats a number as Brazilian Real currency (R$).
 */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

// ============================================================================
// Percent Formatting
// ============================================================================

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * Formats a number as a percentage (e.g., 25 -> "25,0%").
 * @param value - Percentage value (not decimal, e.g., 25 for 25%)
 */
export function formatPercent(value: number): string {
  return percentFormatter.format(value / 100);
}

// ============================================================================
// Date Formatting
// ============================================================================

const monthYearFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

/**
 * Formats a Date as month and year (e.g., "janeiro de 2024").
 */
export function formatMonthYear(date: Date): string {
  return monthYearFormatter.format(date);
}

/**
 * Formats a YYYY-MM-DD date string to a localized date string.
 * @param dateString - Date string in YYYY-MM-DD format
 * @param locale - Locale string (default: "pt-BR")
 */
export function formatDateString(dateString: string, locale = "pt-BR"): string {
  return parseDateString(dateString).toLocaleDateString(locale);
}
