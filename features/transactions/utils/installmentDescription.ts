/**
 * Parcelamento uses descriptions like "Compra (2/4)" (see buildTransactionPayload).
 */

/** Greedy base so "Item (extra) (2/3)" parses with base "Item (extra)". */
const INSTALLMENT_SUFFIX_RE = /^(.+)\s+\((\d+)\/(\d+)\)$/;

export type ParsedInstallmentSuffix = {
  base: string;
  index: number;
  total: number;
};

export function parseInstallmentSuffix(description: string): ParsedInstallmentSuffix | null {
  const trimmed = description.trimEnd();
  const match = trimmed.match(INSTALLMENT_SUFFIX_RE);
  if (!match) return null;
  const base = match[1].trimEnd();
  const index = Number(match[2]);
  const total = Number(match[3]);
  if (
    !Number.isFinite(index) ||
    !Number.isFinite(total) ||
    index < 1 ||
    total < 2 ||
    index > total
  ) {
    return null;
  }
  return { base, index, total };
}

export function formatInstallmentDescription(base: string, index: number, total: number): string {
  return `${base.trimEnd()} (${index}/${total})`;
}

export function stripInstallmentSuffix(description: string): string {
  const parsed = parseInstallmentSuffix(description);
  return parsed ? parsed.base.trimEnd() : description.trimEnd();
}
