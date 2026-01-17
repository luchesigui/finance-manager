/**
 * Shared constants used across the application.
 */

/**
 * Month names in Portuguese
 */
export const MONTH_NAMES_PT_BR = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

/**
 * Normalize a category name for comparison (remove accents, trim, lowercase).
 */
export function normalizeCategoryName(name: string): string {
  return name.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase();
}

/**
 * Category names that should automatically exclude from split calculations.
 * Normalized for comparison.
 */
export const AUTO_EXCLUDE_FROM_SPLIT_CATEGORIES = new Set(
  ["Liberdade Financeira", "Metas"].map(normalizeCategoryName),
);

/**
 * Check if a category name should auto-exclude from fair split.
 */
export function shouldCategoryAutoExcludeFromSplit(categoryName: string): boolean {
  return AUTO_EXCLUDE_FROM_SPLIT_CATEGORIES.has(normalizeCategoryName(categoryName));
}
