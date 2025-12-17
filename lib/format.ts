export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Parses a YYYY-MM-DD date string to a Date object in local timezone.
 * This avoids timezone issues when converting date-only strings to Date objects.
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a YYYY-MM-DD date string to a localized date string.
 * @param dateString - Date string in YYYY-MM-DD format
 * @param locale - Locale string (default: "pt-BR")
 * @returns Formatted date string
 */
export function formatDateString(dateString: string, locale = "pt-BR"): string {
  return parseDateString(dateString).toLocaleDateString(locale);
}
