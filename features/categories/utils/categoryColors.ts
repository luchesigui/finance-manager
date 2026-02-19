/**
 * Category color mappings based on the design pattern.
 * Colors are defined in code, not stored in the database.
 */
export const CATEGORY_COLORS: Record<string, string> = {
  "Liberdade Financeira": "#664FDB", // vibrant medium purple/violet
  "Gastos Essenciais": "#007AFF", // bright electric blue
  Conforto: "#FF3C96", // vivid hot pink/magenta
  Planejamento: "#990099", // deep, rich purple
  Prazeres: "#FF8000", // bright, saturated orange
  Conhecimento: "#FFE600", // bright, clear yellow
};

/**
 * Get the color for a category by name.
 * Returns a default gray color if the category name is not found.
 */
export function getCategoryColor(categoryName: string): string {
  return CATEGORY_COLORS[categoryName] || "#9CA3AF"; // default gray
}

/**
 * Get the Tailwind CSS text color class for a category.
 * Since we're using hex colors, we'll need to use inline styles or create custom classes.
 * This function returns the hex color for use with inline styles.
 */
export function getCategoryColorStyle(categoryName: string): { color: string } {
  return { color: getCategoryColor(categoryName) };
}
