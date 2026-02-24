"use client";

import { useEffect, useState } from "react";

interface ColorSwatchProps {
  label: string;
  cssVar: string;
  tailwindClass?: string;
  format?: "triplet" | "rgba" | "hex" | "hsl";
  description?: string;
  warnOpacityModifier?: boolean;
}

export function ColorSwatch({
  label,
  cssVar,
  tailwindClass,
  format = "triplet",
  description,
  warnOpacityModifier = false,
}: ColorSwatchProps) {
  const [rawValue, setRawValue] = useState<string>("");

  useEffect(() => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    setRawValue(value);
  }, [cssVar]);

  const bgStyle =
    format === "triplet"
      ? { backgroundColor: `rgb(var(${cssVar}))` }
      : { backgroundColor: `var(${cssVar})` };

  return (
    <div className="flex flex-col gap-2">
      <div className="h-14 w-full rounded-interactive border border-noir-border" style={bgStyle} />
      <div>
        <p className="text-sm font-medium text-heading">{label}</p>
        <p className="text-xs text-muted font-mono-nums">{cssVar}</p>
        {tailwindClass && (
          <p className="text-xs text-accent-primary font-mono-nums">{tailwindClass}</p>
        )}
        {rawValue && <p className="text-xs text-muted font-mono-nums mt-0.5">{rawValue}</p>}
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
        {warnOpacityModifier && (
          <p className="text-xs text-accent-warning mt-0.5">
            ⚠ Opacity modifiers silently fail (uses rgba/hex, not RGB triplet)
          </p>
        )}
      </div>
    </div>
  );
}
