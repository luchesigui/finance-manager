export function CssComponentsSection() {
  return (
    <div className="space-y-10">
      {/* Buttons */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Buttons</h3>
        <div className="flex flex-wrap gap-3 items-center">
          <button type="button" className="noir-btn-primary">
            Primary Button
          </button>
          <button type="button" className="noir-btn-secondary">
            Secondary Button
          </button>
          <button type="button" className="noir-btn-danger">
            Danger Button
          </button>
          <button type="button" className="noir-btn-primary" disabled>
            Disabled
          </button>
        </div>
        <div className="mt-3 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          .noir-btn-primary · .noir-btn-secondary · .noir-btn-danger
        </div>
      </div>

      {/* Cards */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Cards</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="noir-card p-4">
            <p className="text-sm font-medium text-heading mb-1">noir-card</p>
            <p className="text-xs text-muted">Standard surface card</p>
          </div>
          <div className="noir-card-interactive p-4">
            <p className="text-sm font-medium text-heading mb-1">noir-card-interactive</p>
            <p className="text-xs text-muted">Hover to see lift effect</p>
          </div>
          <div className="noir-card card-accent-top p-4">
            <p className="text-sm font-medium text-heading mb-1">card-accent-top</p>
            <p className="text-xs text-muted">Gradient top accent line</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Badges</h3>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="noir-badge-positive">Positive</span>
          <span className="noir-badge-negative">Negative</span>
          <span className="noir-badge-warning">Warning</span>
          <span className="noir-badge-accent">Accent</span>
          <span className="noir-badge-muted">Muted</span>
        </div>
        <div className="mt-3 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          .noir-badge-positive · .noir-badge-negative · .noir-badge-warning · .noir-badge-accent ·
          .noir-badge-muted
        </div>
      </div>

      {/* Inputs */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Inputs</h3>
        <div className="flex flex-col gap-3 max-w-sm">
          <input className="noir-input w-full" placeholder="Text input (.noir-input)" type="text" />
          <select className="noir-select w-full">
            <option>Select option (.noir-select)</option>
            <option>Option A</option>
            <option>Option B</option>
          </select>
        </div>
      </div>

      {/* Divider */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Divider</h3>
        <hr className="noir-divider" />
        <div className="mt-3 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          .noir-divider
        </div>
      </div>

      {/* Progress */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Progress Track</h3>
        <div className="noir-progress-track h-2 max-w-xs">
          <div className="h-full w-2/3 bg-accent-primary rounded-full" />
        </div>
        <div className="mt-3 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          .noir-progress-track
        </div>
      </div>

      {/* Table */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Table</h3>
        <div className="noir-card overflow-hidden">
          <table className="noir-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-heading">Grocery Store</td>
                <td>
                  <span className="noir-badge-muted">Food</span>
                </td>
                <td className="text-right text-accent-negative font-mono-nums">-R$ 120,00</td>
              </tr>
              <tr>
                <td className="text-heading">Salary</td>
                <td>
                  <span className="noir-badge-muted">Income</span>
                </td>
                <td className="text-right text-accent-positive font-mono-nums">+R$ 5.000,00</td>
              </tr>
              <tr>
                <td className="text-heading">Electricity</td>
                <td>
                  <span className="noir-badge-muted">Utilities</span>
                </td>
                <td className="text-right text-accent-negative font-mono-nums">-R$ 89,50</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Glass */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Glass Panel</h3>
        <div className="relative h-24 rounded-card overflow-hidden bg-gradient-to-br from-accent-primary/20 to-accent-positive/20">
          <div className="absolute inset-4 noir-glass rounded-interactive flex items-center justify-center">
            <p className="text-sm text-heading">.noir-glass</p>
          </div>
        </div>
      </div>

      {/* Pill */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Pill (base class)</h3>
        <div className="flex gap-3 flex-wrap">
          <span className="noir-pill bg-noir-active text-heading border border-noir-border">
            Housing
          </span>
          <span className="noir-pill bg-accent-primary/10 text-accent-primary">Transport</span>
          <span className="noir-pill bg-accent-positive/10 text-accent-positive">Health</span>
        </div>
        <div className="mt-3 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          .noir-pill (base) — combine with custom bg/text classes
        </div>
      </div>
    </div>
  );
}
