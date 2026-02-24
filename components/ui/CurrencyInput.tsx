"use client";

import { Input } from "@/components/ui/input";

type CurrencyInputProps = {
  id?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  value: number | null;
  onValueChange: (nextValue: number | null) => void;
};

function parseBrazilianCurrencyToNumber(inputValue: string): number | null {
  const digitsOnly = inputValue.replace(/\D/g, "");
  if (digitsOnly.length === 0) return null;

  const centsValue = Number.parseInt(digitsOnly, 10);
  if (!Number.isFinite(centsValue)) return null;

  return centsValue / 100;
}

export function CurrencyInput({
  id,
  name,
  className,
  placeholder,
  required,
  value,
  onValueChange,
}: CurrencyInputProps) {
  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const displayValue = value == null ? "" : currencyFormatter.format(value);

  return (
    <Input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      required={required}
      className={className}
      value={displayValue}
      onChange={(event) => onValueChange(parseBrazilianCurrencyToNumber(event.target.value))}
    />
  );
}
