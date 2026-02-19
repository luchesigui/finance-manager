# Noir Design System + shadcn/ui — Styleguide Reference

## Overview

This project uses a two-layer component system:

1. **Noir CSS Layer** — Custom CSS classes (`.noir-*`) defined in `app/globals.css` using Tailwind's `@layer components`. These are the original design system primitives.
2. **shadcn/ui Layer** — Headless Radix UI components styled with Tailwind, living in `components/ui/`. These are wired to the same CSS variable tokens as Noir via a compatibility shim.

Both layers share the same underlying CSS custom properties (HSL for shadcn, RGB triplets for Noir). They are **visually consistent** and can coexist during a gradual migration.

The `/styleguide` dev route (only available in development) is the living reference for both layers.

---

## Design Tokens

### Background Colors

| CSS Variable | RGB Value | Tailwind Class | Description |
|---|---|---|---|
| `--noir-primary` | dark: `6 9 13` / light: `248 250 252` | `bg-noir-primary` | Page background |
| `--noir-surface` | dark: `12 17 23` / light: `255 255 255` | `bg-noir-surface` | Card surface |
| `--noir-sidebar` | dark: `8 11 16` / light: `241 245 249` | `bg-noir-sidebar` | Sidebar/panel |
| `--noir-active` | dark: `21 28 38` / light: `232 237 244` | `bg-noir-active` | Active/hover state |
| `--noir-elevated` | dark: `26 35 47` / light: `220 227 237` | `bg-noir-elevated` | Elevated surfaces |

### Border Colors

| CSS Variable | Value | Tailwind Class | Note |
|---|---|---|---|
| `--noir-border` | dark: `rgba(255,255,255,0.06)` / light: `#d4dbe6` | `border-noir-border` | ⚠ Uses rgba/hex — opacity modifiers silently fail |
| `--noir-border-light` | dark: `rgba(255,255,255,0.12)` / light: `#b8c4d4` | `border-noir-border-light` | Same caveat |

### Text Colors

| CSS Variable | RGB Triplet | Tailwind Class |
|---|---|---|
| `--text-heading` | dark: `240 236 228` / light: `15 23 42` | `text-heading` |
| `--text-body` | dark: `139 154 181` / light: `71 85 105` | `text-body` |
| `--text-muted` | dark: `148 163 184` / light: `100 116 139` | `text-muted` |

### Accent Colors

| CSS Variable | RGB Triplet | Tailwind Class |
|---|---|---|
| `--accent-primary` | dark: `91 141 239` / light: `37 99 235` | `text-accent-primary`, `bg-accent-primary` |
| `--accent-primary-light` | dark: `122 165 245` / light: `59 130 246` | `text-accent-primary-light` |
| `--accent-positive` | dark: `54 179 126` / light: `22 163 74` | `text-accent-positive` |
| `--accent-negative` | dark: `229 87 79` / light: `220 38 38` | `text-accent-negative` |
| `--accent-warning` | dark: `232 145 58` / light: `217 119 6` | `text-accent-warning` |
| `--accent-spending` | dark: `232 185 49` / light: `180 83 9` | `text-accent-spending` |

### Typography

| Font | Variable | CSS Class | Config Key |
|---|---|---|---|
| Plus Jakarta Sans | — | (default body font) | `font-sans` |
| Instrument Serif | — | `.font-display` | `font-display` |
| JetBrains Mono | — | `.font-mono-nums` | `font-mono-nums` |

Custom font sizes: `text-dashboard-title`, `text-dashboard-subtitle`, `text-transaction-label`, `text-hero-number`, `text-section-title`, `text-caption`, `text-section-label`

### Border Radius

| Token | Value | Tailwind Class | Use Case |
|---|---|---|---|
| `outer` | 24px | `rounded-outer` | Page-level containers |
| `card` | 16px | `rounded-card` | Cards |
| `interactive` | 10px | `rounded-interactive` | Buttons, inputs |
| `pill` | 100px | `rounded-pill` | Tags, badges |
| `lg` (shadcn) | `var(--radius)` = 10px | `rounded-lg` | shadcn components |
| `md` (shadcn) | 8px | `rounded-md` | shadcn components |
| `sm` (shadcn) | 6px | `rounded-sm` | shadcn components |

### Spacing

| Token | Value | Tailwind Class |
|---|---|---|
| `card-padding` | 24px | `p-card-padding` |
| `card-padding-sm` | 16px | `p-card-padding-sm` |
| `grid-gap` | 16px | `gap-grid-gap` |
| `section-gap` | 32px | `gap-section-gap` |
| `list-item-padding` | 20px | `p-list-item-padding` |

### Shadows

| Token | Value | Tailwind Class |
|---|---|---|
| `card` | CSS var `--shadow-card` | `shadow-card` |
| `card-hover` | CSS var `--shadow-card-hover` | `shadow-card-hover` |
| `glow-accent` | 0 4px 30px accent-primary/20 | `shadow-glow-accent` |
| `glow-positive` | 0 4px 30px accent-positive/20 | `shadow-glow-positive` |
| `glow-negative` | 0 4px 30px accent-negative/20 | `shadow-glow-negative` |
| `glow-warning` | 0 4px 30px accent-warning/20 | `shadow-glow-warning` |

---

## Known Audit Issues

| Issue | Severity | Details |
|---|---|---|
| `--noir-border` uses `rgba()` (dark) / hex (light) instead of RGB triplets | Medium | Tailwind opacity modifiers like `border-noir-border/50` silently fail |
| `accent.info` aliases `--accent-primary` with no dedicated `--accent-info` CSS var | Low | `bg-accent-info` works but resolves to primary blue |
| `animate-glow-pulse` keyframe exists in `tailwind.config.js` but not `globals.css` | Low | Use `animation-glow-pulse` via Tailwind class only |
| `font-display` / `font-mono-nums` defined in both `@layer utilities` and `fontFamily` config | Info | Both approaches work; the config version takes precedence |

---

## Component Inventory

### Noir CSS Classes (`.noir-*`)

| Class | Description |
|---|---|
| `.noir-card` | Surface card with border and shadow |
| `.noir-card-interactive` | Card with hover lift effect |
| `.noir-glass` | Frosted glass overlay |
| `.noir-btn-primary` | Primary CTA button |
| `.noir-btn-secondary` | Secondary/outline button |
| `.noir-btn-danger` | Destructive action button |
| `.noir-input` | Text input field |
| `.noir-select` | Select dropdown |
| `.noir-pill` | Base pill/tag styles |
| `.noir-badge-positive` | Green badge (income, positive) |
| `.noir-badge-negative` | Red badge (expense, negative) |
| `.noir-badge-warning` | Orange badge (warning) |
| `.noir-badge-accent` | Blue badge (highlight) |
| `.noir-badge-muted` | Muted/neutral badge |
| `.noir-divider` | Horizontal rule |
| `.noir-progress-track` | Progress bar background |
| `.noir-table` | Styled table |
| `.card-accent-top` | Gradient accent line at card top |
| `.noir-glass` | Backdrop blur glass panel |

### shadcn/ui Components (`components/ui/`)

| Component | File | Variants |
|---|---|---|
| `<Button>` | `button.tsx` | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` |
| `<Card>` | `card.tsx` | CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `<Badge>` | `badge.tsx` | `default`, `secondary`, `destructive`, `outline` |
| `<Input>` | `input.tsx` | — |
| `<Alert>` | `alert.tsx` | `default`, `destructive` |
| `<Separator>` | `separator.tsx` | horizontal / vertical |
| `<Select>` | `select.tsx` | SelectTrigger, SelectContent, SelectItem, SelectValue |
| `<Progress>` | `progress.tsx` | — |
| `<Table>` | `table.tsx` | TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption |

### Custom UI Components (`components/ui/`)

| Component | File | Notes |
|---|---|---|
| `<CurrencyInput>` | `CurrencyInput.tsx` | Formatted currency field with BRL support |
| `<FieldError>` | `FieldError.tsx` | Form validation error display |
| `<LazyToaster>` | `LazyToaster.tsx` | Lazy-loaded toast container |
| `<CrystalBallLine>` | `CrystalBallLine.tsx` | Forecast chart component |

---

## Where to Find Things

- **Living styleguide**: `http://localhost:3000/styleguide` (dev only)
- **CSS tokens**: `app/globals.css` — `:root, [data-theme="dark"]` and `[data-theme="light"]` selectors
- **Tailwind config**: `tailwind.config.js`
- **Noir CSS classes**: `app/globals.css` — `@layer components`
- **shadcn components**: `components/ui/button.tsx`, `card.tsx`, etc.
- **Custom UI components**: `components/ui/CurrencyInput.tsx`, `FieldError.tsx`
- **Theme switching**: `lib/theme/ThemeContext.tsx` — sets `data-theme` attribute

---

## Migration Roadmap: Noir → shadcn

This project is in a **parallel-coexistence phase**. Existing pages still use `.noir-*` CSS classes. Migrate them to shadcn components gradually, page by page.

### Mapping Table

| Current Noir class / pattern | Replace with shadcn | Notes |
|---|---|---|
| `<button class="noir-btn-primary">` | `<Button>` | variant="default" |
| `<button class="noir-btn-secondary">` | `<Button variant="outline">` | or variant="secondary" |
| `<button class="noir-btn-danger">` | `<Button variant="destructive">` | |
| `<div class="noir-card">` | `<Card>` | Use CardHeader/CardContent |
| `<div class="noir-card-interactive">` | `<Card>` + onClick | Add className="cursor-pointer" |
| `<span class="noir-badge-positive">` | `<Badge variant="outline">` | Style with accent-positive |
| `<span class="noir-badge-negative">` | `<Badge variant="destructive">` | |
| `<span class="noir-badge-accent">` | `<Badge>` | variant="default" |
| `<span class="noir-badge-muted">` | `<Badge variant="secondary">` | |
| `<input class="noir-input">` | `<Input>` | |
| `<select class="noir-select">` | `<Select>` | Radix popover — JSX differs significantly from native `<select>` |
| `<hr class="noir-divider">` | `<Separator>` | |
| `<div class="noir-progress-track"><div …/></div>` | `<Progress value={n} />` | Self-contained, no inner div needed |
| `<table class="noir-table">` | `<Table>` + `<TableHeader>` / `<TableBody>` / `<TableRow>` / `<TableHead>` / `<TableCell>` | Must wrap each cell explicitly |

### Migration Rules

1. Migrate one page/feature at a time — never mix Noir and shadcn on the **same component**
2. Delete the `.noir-*` class from `globals.css` **only when NO usages remain** (use `grep` to verify)
3. The styleguide Sections 07 (CSS Components) and 08 (shadcn Components) serve as the before/after reference during migration
4. Keep `.noir-pill`, `.noir-glass`, `.card-accent-top` as custom CSS — no shadcn equivalent exists for these
5. After migration, run `npm run typecheck && npm run lint` to catch issues early

### What to Keep as Noir-only (no shadcn equivalent)

- `.noir-glass` — backdrop blur panel
- `.noir-pill` — base pill/tag (used by badge variants)
- `.card-accent-top` — gradient line decoration
- `.stagger-*` animation delay utilities
- Text glow utilities (`.text-glow-accent`, etc.)
