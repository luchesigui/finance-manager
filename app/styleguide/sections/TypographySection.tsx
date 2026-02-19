export function TypographySection() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-section-title text-heading mb-4">Font Families</h3>
        <div className="space-y-4">
          <div className="noir-card p-4">
            <p className="text-xs text-muted mb-1 font-mono-nums">font-sans · Plus Jakarta Sans</p>
            <p className="font-sans text-2xl text-heading">
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
          <div className="noir-card p-4">
            <p className="text-xs text-muted mb-1 font-mono-nums">
              font-display · Instrument Serif
            </p>
            <p className="font-display text-2xl text-heading">
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
          <div className="noir-card p-4">
            <p className="text-xs text-muted mb-1 font-mono-nums">
              font-mono-nums · JetBrains Mono
            </p>
            <p className="font-mono-nums text-2xl text-heading">1234567890 $1,234.56</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-section-title text-heading mb-4">Heading Scale (h1 – h6)</h3>
        <p className="text-sm text-muted mb-6">
          Defined in <code className="font-mono-nums text-accent-primary text-xs">@layer base</code>{" "}
          — bare HTML elements inherit these styles automatically. No utility class needed.
        </p>
        <div className="space-y-6 border-l-2 border-noir-border pl-6">
          <div>
            <p className="font-mono-nums text-xs text-muted mb-2">
              h1 · 36px · Instrument Serif · leading-tight
            </p>
            <h1>Page Heading</h1>
          </div>
          <div>
            <p className="font-mono-nums text-xs text-muted mb-2">
              h2 · 22px · bold · leading-snug
            </p>
            <h2>Section Heading</h2>
          </div>
          <div>
            <p className="font-mono-nums text-xs text-muted mb-2">
              h3 · 18px · semibold · leading-snug
            </p>
            <h3>Subsection Heading</h3>
          </div>
          <div>
            <p className="font-mono-nums text-xs text-muted mb-2">
              h4 · 16px · semibold · leading-normal
            </p>
            <h4>Card Title</h4>
          </div>
          <div>
            <p className="font-mono-nums text-xs text-muted mb-2">
              h5 · 14px · semibold · leading-normal
            </p>
            <h5>Label Heading</h5>
          </div>
          <div>
            <p className="font-mono-nums text-xs text-muted mb-2">
              h6 · 10px · semibold · uppercase · tracking-widest
            </p>
            <h6>Section Label</h6>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-section-title text-heading mb-4">Body &amp; Small</h3>
        <div className="space-y-4 border-l-2 border-noir-border pl-6">
          <div>
            <p className="font-mono-nums text-xs text-muted mb-2">
              p · 14px · text-body · leading-relaxed
            </p>
            <p>
              This is a standard paragraph. The quick brown fox jumps over the lazy dog. Body text
              should be easy to read at length.
            </p>
          </div>
          <div>
            <p className="font-mono-nums text-xs text-muted mb-2">
              small · 11px · text-muted · leading-snug
            </p>
            <small>Caption text, metadata, timestamps, and secondary annotations.</small>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-section-title text-heading mb-4">Legacy Custom Classes</h3>
        <p className="text-sm text-muted mb-4">
          Still available for backward compat with existing pages. Prefer semantic HTML elements for
          new code.
        </p>
        <div className="space-y-3">
          {[
            {
              className: "text-hero-number font-display",
              label: "text-hero-number",
              sample: "$12,345.67",
              desc: "36px / lh 1.1 / fw 400",
            },
            {
              className: "text-dashboard-title",
              label: "text-dashboard-title",
              sample: "Dashboard Overview",
              desc: "22px / lh 1.3 / fw 700",
            },
            {
              className: "text-dashboard-subtitle",
              label: "text-dashboard-subtitle",
              sample: "Monthly Summary",
              desc: "18px / lh 1.4 / fw 600",
            },
            {
              className: "text-section-title",
              label: "text-section-title",
              sample: "Recent Transactions",
              desc: "16px / lh 1.4 / fw 600",
            },
            {
              className: "text-transaction-label",
              label: "text-transaction-label",
              sample: "Grocery Store — Food & Drink",
              desc: "14px / lh 1.5 / fw 400",
            },
            {
              className: "text-caption",
              label: "text-caption",
              sample: "3 days ago · Approved",
              desc: "11px / lh 1.4 / fw 500",
            },
            {
              className: "text-section-label uppercase tracking-widest",
              label: "text-section-label",
              sample: "EXPENSES BY CATEGORY",
              desc: "10px / lh 1.4 / fw 600 / ls 0.1em",
            },
          ].map(({ className, label, sample, desc }) => (
            <div
              key={label}
              className="flex items-baseline gap-4 py-2 border-b border-noir-border last:border-0"
            >
              <div className="w-56 shrink-0">
                <p className="font-mono-nums text-xs text-muted">{label}</p>
                <p className="text-xs text-muted/60">{desc}</p>
              </div>
              <p className={`text-heading ${className}`}>{sample}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
