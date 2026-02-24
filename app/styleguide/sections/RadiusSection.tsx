const RADIUS_TOKENS = [
  { name: "outer", value: "24px", tailwind: "rounded-outer", desc: "Page-level containers" },
  { name: "card", value: "16px", tailwind: "rounded-card", desc: "Cards" },
  { name: "interactive", value: "10px", tailwind: "rounded-interactive", desc: "Buttons, inputs" },
  { name: "pill", value: "100px", tailwind: "rounded-pill", desc: "Tags, badges" },
  {
    name: "lg (shadcn)",
    value: "var(--radius) = 10px",
    tailwind: "rounded-lg",
    desc: "shadcn default",
  },
  { name: "md (shadcn)", value: "8px", tailwind: "rounded-md", desc: "shadcn medium" },
  { name: "sm (shadcn)", value: "6px", tailwind: "rounded-sm", desc: "shadcn small" },
];

export function RadiusSection() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {RADIUS_TOKENS.map(({ name, value, tailwind, desc }) => (
          <div key={name} className="flex flex-col gap-2">
            <div
              className="h-16 w-full bg-noir-active border border-noir-border"
              style={{ borderRadius: value.startsWith("var") ? "10px" : value }}
            />
            <div>
              <p className="text-sm font-medium text-heading">{name}</p>
              <p className="font-mono-nums text-xs text-muted">{tailwind}</p>
              <p className="font-mono-nums text-xs text-muted/60">{value}</p>
              <p className="text-xs text-muted mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
