"use client";

import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useState } from "react";

export function UiComponentsSection() {
  const [currencyValue, setCurrencyValue] = useState<number | null>(null);

  return (
    <div className="space-y-10">
      {/* CurrencyInput */}
      <div>
        <h3 className="text-section-title text-heading mb-2">CurrencyInput</h3>
        <p className="text-sm text-muted mb-4">
          Brazilian currency input (BRL). Formats value on the fly using{" "}
          <code className="font-mono-nums text-accent-primary text-xs">Intl.NumberFormat</code>.
        </p>
        <div className="flex flex-col gap-3 max-w-xs">
          <CurrencyInput
            id="styleguide-currency"
            placeholder="R$ 0,00"
            value={currencyValue}
            onValueChange={setCurrencyValue}
            className="noir-input w-full"
          />
          <p className="font-mono-nums text-xs text-muted">
            Raw value: <span className="text-accent-primary">{currencyValue ?? "null"}</span>
          </p>
        </div>
        <div className="mt-4 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          {'<CurrencyInput value={n} onValueChange={fn} className="noir-input" />'}
        </div>
        <div className="mt-2 text-xs text-muted space-y-1">
          <p>
            <span className="text-heading">Props:</span> id, name, className, placeholder, required,
            value (number|null), onValueChange
          </p>
          <p>
            <span className="text-heading">File:</span> components/ui/CurrencyInput.tsx
          </p>
        </div>
      </div>

      {/* FieldError */}
      <div>
        <h3 className="text-section-title text-heading mb-2">FieldError</h3>
        <p className="text-sm text-muted mb-4">
          Displays a form validation error. Renders nothing when there are no errors. Used with
          TanStack Form.
        </p>
        <div className="max-w-xs">
          <input
            className="noir-input w-full"
            placeholder="Email address"
            defaultValue="not-an-email"
          />
          <p className="mt-1 text-xs text-accent-negative animate-fade-in">
            Please enter a valid email address.
          </p>
        </div>
        <div className="mt-4 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          {"<FieldError errors={field.state.meta.errors} />"}
        </div>
        <div className="mt-2 text-xs text-muted space-y-1">
          <p>
            <span className="text-heading">Props:</span> errors (unknown[])
          </p>
          <p>
            <span className="text-heading">File:</span> components/ui/FieldError.tsx
          </p>
          <p>
            <span className="text-heading">Note:</span> Returns null when no errors. Uses animate-in
            slide-in-from-top-1.
          </p>
        </div>
      </div>
    </div>
  );
}
