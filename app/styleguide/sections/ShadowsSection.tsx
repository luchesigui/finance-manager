const SHADOW_TOKENS = [
  { name: "shadow-card", tailwind: "shadow-card", desc: "Default card elevation" },
  { name: "shadow-card-hover", tailwind: "shadow-card-hover", desc: "Hovered card elevation" },
  { name: "shadow-glow-accent", tailwind: "shadow-glow-accent", desc: "Primary CTA glow" },
  { name: "shadow-glow-positive", tailwind: "shadow-glow-positive", desc: "Income / success glow" },
  { name: "shadow-glow-negative", tailwind: "shadow-glow-negative", desc: "Expense / error glow" },
  { name: "shadow-glow-warning", tailwind: "shadow-glow-warning", desc: "Warning glow" },
];

export function ShadowsSection() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
      {SHADOW_TOKENS.map(({ name, tailwind, desc }) => (
        <div key={name} className="flex flex-col gap-3">
          <div
            className={`h-20 w-full rounded-card bg-noir-surface border border-noir-border ${tailwind}`}
          />
          <div>
            <p className="text-sm font-medium text-heading">{name}</p>
            <p className="font-mono-nums text-xs text-muted">{tailwind}</p>
            <p className="text-xs text-muted mt-0.5">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
