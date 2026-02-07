/**
 * Checks if query characters appear in sequence within text (fuzzy search).
 */
export function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let queryIndex = 0;
  for (let index = 0; index < lowerText.length && queryIndex < lowerQuery.length; index++) {
    if (lowerText[index] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === lowerQuery.length;
}
