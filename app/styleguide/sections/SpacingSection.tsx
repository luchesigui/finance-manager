const SPACING_TOKENS = [
  { name: "card-padding", value: "24px", tailwind: "p-card-padding" },
  { name: "card-padding-sm", value: "16px", tailwind: "p-card-padding-sm" },
  { name: "grid-gap", value: "16px", tailwind: "gap-grid-gap" },
  { name: "section-gap", value: "32px", tailwind: "gap-section-gap" },
  { name: "list-item-padding", value: "20px", tailwind: "p-list-item-padding" },
];

const STD_SPACING = [
  { name: "1", value: "4px" },
  { name: "2", value: "8px" },
  { name: "3", value: "12px" },
  { name: "4", value: "16px" },
  { name: "5", value: "20px" },
  { name: "6", value: "24px" },
  { name: "8", value: "32px" },
  { name: "10", value: "40px" },
  { name: "12", value: "48px" },
  { name: "16", value: "64px" },
];

export function SpacingSection() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-section-title text-heading mb-4">Custom Spacing Tokens</h3>
        <div className="space-y-3">
          {SPACING_TOKENS.map(({ name, value, tailwind }) => (
            <div key={name} className="flex items-center gap-4">
              <div className="w-48 shrink-0">
                <p className="font-mono-nums text-xs text-muted">{tailwind}</p>
                <p className="font-mono-nums text-xs text-muted/60">{value}</p>
              </div>
              <div
                className="h-6 rounded-sm bg-accent-primary/30 border border-accent-primary/40"
                style={{ width: value }}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-section-title text-heading mb-4">
          Standard Tailwind Scale (reference)
        </h3>
        <div className="space-y-2">
          {STD_SPACING.map(({ name, value }) => (
            <div key={name} className="flex items-center gap-4">
              <div className="w-48 shrink-0">
                <p className="font-mono-nums text-xs text-muted">
                  space-{name} / {value}
                </p>
              </div>
              <div
                className="h-4 rounded-sm bg-noir-active border border-noir-border"
                style={{ width: value }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
