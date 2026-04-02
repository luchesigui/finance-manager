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
  ["Liberdade Financeira"].map(normalizeCategoryName),
);

/**
 * Categories where the % of income target is a goal to reach (e.g. savings), not a spending cap.
 * Used for charts, status labels, and "on budget" scoring.
 */
export const GOAL_TARGET_CATEGORY_NAMES = new Set(
  ["Liberdade Financeira", "Meta"].map(normalizeCategoryName),
);

/**
 * Check if a category name should auto-exclude from fair split.
 */
export function shouldCategoryAutoExcludeFromSplit(categoryName: string): boolean {
  return AUTO_EXCLUDE_FROM_SPLIT_CATEGORIES.has(normalizeCategoryName(categoryName));
}

export function isGoalTargetCategory(categoryName: string): boolean {
  return GOAL_TARGET_CATEGORY_NAMES.has(normalizeCategoryName(categoryName));
}
