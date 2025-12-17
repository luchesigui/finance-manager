/**
 * Person color mappings.
 * Colors are defined in code, not stored in the database.
 * Colors are assigned deterministically based on person ID to ensure consistency.
 */
const PERSON_COLORS = [
  "bg-blue-500",
  "bg-pink-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-cyan-500",
  "bg-violet-500",
  "bg-rose-500",
];

/**
 * Get a deterministic color for a person based on their ID.
 * This ensures the same person always gets the same color.
 */
export function getPersonColor(personId: string): string {
  // Convert UUID to a number by taking the first 8 characters and converting to integer
  // This gives us a deterministic way to assign colors
  const hash = personId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % PERSON_COLORS.length;
  return PERSON_COLORS[Math.abs(index)];
}
