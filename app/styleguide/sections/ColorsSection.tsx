import { ColorSwatch } from "./ColorSwatch";

export function ColorsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-section-title text-heading mb-4">Background Surfaces</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <ColorSwatch label="Primary" cssVar="--noir-primary" tailwindClass="bg-noir-primary" />
          <ColorSwatch label="Surface" cssVar="--noir-surface" tailwindClass="bg-noir-surface" />
          <ColorSwatch label="Sidebar" cssVar="--noir-sidebar" tailwindClass="bg-noir-sidebar" />
          <ColorSwatch label="Active" cssVar="--noir-active" tailwindClass="bg-noir-active" />
          <ColorSwatch label="Elevated" cssVar="--noir-elevated" tailwindClass="bg-noir-elevated" />
        </div>
      </div>

      <div>
        <h3 className="text-section-title text-heading mb-4">Borders</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <ColorSwatch
            label="Border"
            cssVar="--noir-border"
            tailwindClass="border-noir-border"
            format="rgba"
            warnOpacityModifier
          />
          <ColorSwatch
            label="Border Light"
            cssVar="--noir-border-light"
            tailwindClass="border-noir-border-light"
            format="rgba"
            warnOpacityModifier
          />
        </div>
      </div>

      <div>
        <h3 className="text-section-title text-heading mb-4">Text</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <ColorSwatch label="Heading" cssVar="--text-heading" tailwindClass="text-heading" />
          <ColorSwatch label="Body" cssVar="--text-body" tailwindClass="text-body" />
          <ColorSwatch label="Muted" cssVar="--text-muted" tailwindClass="text-muted" />
        </div>
      </div>

      <div>
        <h3 className="text-section-title text-heading mb-4">Accents</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <ColorSwatch
            label="Primary"
            cssVar="--accent-primary"
            tailwindClass="bg-accent-primary"
          />
          <ColorSwatch
            label="Primary Light"
            cssVar="--accent-primary-light"
            tailwindClass="bg-accent-primary-light"
          />
          <ColorSwatch
            label="Positive"
            cssVar="--accent-positive"
            tailwindClass="bg-accent-positive"
          />
          <ColorSwatch
            label="Negative"
            cssVar="--accent-negative"
            tailwindClass="bg-accent-negative"
          />
          <ColorSwatch
            label="Warning"
            cssVar="--accent-warning"
            tailwindClass="bg-accent-warning"
          />
          <ColorSwatch
            label="Spending"
            cssVar="--accent-spending"
            tailwindClass="bg-accent-spending"
          />
        </div>
      </div>

      <div>
        <h3 className="text-section-title text-heading mb-4">shadcn/ui Semantic Colors</h3>
        <p className="text-sm text-muted mb-4">
          These are HSL-formatted equivalents of Noir tokens, consumed by shadcn components.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <ColorSwatch
            label="background"
            cssVar="--background"
            tailwindClass="bg-background"
            format="hsl"
          />
          <ColorSwatch
            label="foreground"
            cssVar="--foreground"
            tailwindClass="text-foreground"
            format="hsl"
          />
          <ColorSwatch label="card" cssVar="--card" tailwindClass="bg-card" format="hsl" />
          <ColorSwatch label="primary" cssVar="--primary" tailwindClass="bg-primary" format="hsl" />
          <ColorSwatch
            label="secondary"
            cssVar="--secondary"
            tailwindClass="bg-secondary"
            format="hsl"
          />
          <ColorSwatch
            label="destructive"
            cssVar="--destructive"
            tailwindClass="bg-destructive"
            format="hsl"
          />
          <ColorSwatch
            label="border (shadcn)"
            cssVar="--border"
            tailwindClass="border-border"
            format="hsl"
          />
          <ColorSwatch label="ring" cssVar="--ring" tailwindClass="ring-ring" format="hsl" />
        </div>
      </div>
    </div>
  );
}
