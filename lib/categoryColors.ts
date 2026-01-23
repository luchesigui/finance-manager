/**
 * Category color mappings based on the Financial Noir theme.
 * Colors are defined in code, not stored in the database.
 * Using high-contrast, vibrant colors optimized for dark backgrounds.
 */
export const CATEGORY_COLORS: Record<string, string> = {
  "Liberdade Financeira": "#8B5CF6", // vibrant purple (enhanced for dark mode)
  "Custos Fixos": "#3B82F6", // accent primary blue
  Conforto: "#EC4899", // vibrant pink (enhanced for dark mode)
  Metas: "#A855F7", // bright purple
  Prazeres: "#F97316", // warning orange
  Conhecimento: "#FACC15", // spending yellow
};

/**
 * Get the color for a category by name.
 * Returns a default gray color if the category name is not found.
 */
export function getCategoryColor(categoryName: string): string {
  return CATEGORY_COLORS[categoryName] || "#94A3B8"; // default body text color
}

/**
 * Get the Tailwind CSS text color class for a category.
 * Since we're using hex colors, we'll need to use inline styles or create custom classes.
 * This function returns the hex color for use with inline styles.
 */
export function getCategoryColorStyle(categoryName: string): { color: string } {
  return { color: getCategoryColor(categoryName) };
}
