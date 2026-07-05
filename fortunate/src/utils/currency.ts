/**
 * Converte uma string de valor monetário no formato brasileiro (ex: "R$ 1.250,75" ou "1250,75")
 * em um número de ponto flutuante.
 */
export function parseBrazilianCurrencyToNumber(inputValue: string): number | null {
  const digitsOnly = inputValue.replace(/\D/g, "");
  if (digitsOnly.length === 0) return null;

  const centsValue = Number.parseInt(digitsOnly, 10);
  if (!Number.isFinite(centsValue)) return null;

  return centsValue / 100;
}

/**
 * Formata um número para string monetária BRL (ex: 1250.75 -> "R$ 1.250,75").
 */
export function formatBrlCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
