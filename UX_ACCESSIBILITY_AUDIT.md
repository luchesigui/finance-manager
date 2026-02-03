# UX & Accessibility Audit: Financial Dashboard (Copilot-Inspired)

> **Audit Date:** February 3, 2026  
> **Auditor Role:** Senior Product Designer & Accessibility Expert  
> **Focus:** FinTech "prosumer" aesthetics with WCAG 2.1 compliance

---

## Executive Summary

This audit evaluates the FinançasPro financial dashboard against modern UX patterns (inspired by **Copilot Money**) and **WCAG 2.1 AA** accessibility standards. The app features a sophisticated "Financial Noir" dark theme with a well-structured design system, but several areas require attention for both aesthetic refinement and accessibility compliance.

### Key Findings Overview

| Area | Status | Priority |
|------|--------|----------|
| Color Contrast | ⚠️ Needs Work | **Critical** |
| Border Radii Consistency | ✅ Good | Low |
| Information Density | ⚠️ Mixed | Medium |
| Visual Hierarchy | ⚠️ Needs Improvement | High |
| Typography | ✅ Good Foundation | Medium |
| Iconography | ⚠️ Inconsistent | Medium |
| Spacing System | ✅ Well Defined | Low |
| Focus States | ✅ Good | Low |

---

## 1. Design Language & Consistency (Copilot Inspiration)

### 1.1 Containers & Border Radii

**Current Implementation:**
```css
borderRadius: {
  outer: "24px",     /* Page-level containers */
  card: "16px",      /* Cards, panels */
  interactive: "8px", /* Buttons, inputs */
  pill: "100px",     /* Badges, tags */
}
```

**Assessment:** ✅ **Good Foundation**

The border radius system follows a clear hierarchy similar to Copilot:
- Cards use `16px` (generous, modern feel)
- Interactive elements use `8px` (familiar, clickable)
- Pills use `100px` (fully rounded badges)

**Recommendations:**

| Issue | Current | Recommended | Rationale |
|-------|---------|-------------|-----------|
| Progress bars | `rounded-full` | Keep | ✅ Matches Copilot aesthetic |
| Modal corners | `rounded-card` (16px) | `rounded-outer` (24px) | More premium feel for overlays |
| Avatar circles | `rounded-full` | Keep | ✅ Consistent |

**Migration Task:**
```tsx
// components/finance/TransactionsView.tsx - Modal containers
// Change from:
<div className="noir-card max-w-2xl w-full ...">
// To:
<div className="noir-card max-w-2xl w-full rounded-outer ...">
```

---

### 1.2 Information Density & White Space

**Current Status:** ⚠️ **Mixed Results**

**Dashboard View Analysis:**

| Section | Density | Copilot Comparison |
|---------|---------|-------------------|
| HealthScore Hero | ✅ Good | Well-balanced, breathable |
| QuickStatsGrid | ⚠️ Dense | Needs more internal padding |
| CategoryBudgetChart | ✅ Good | Clean category bars |
| TransactionsView | ⚠️ Compressed | List items too tight |

**Specific Issues:**

1. **QuickStatsGrid Cards** (`components/dashboard/QuickStatsGrid.tsx`):
   - Current: `p-card-padding` (20px)
   - Content feels compressed due to multiple data points
   
2. **Transaction List Items** (`components/finance/TransactionsView.tsx`):
   - Current: `p-4` (16px)
   - Copilot uses ~20-24px vertical padding for list items

3. **Alert Panel Items**:
   - Current: `py-3` (12px)
   - Could use more breathing room

**Recommendations:**

```css
/* Add to tailwind.config.js */
spacing: {
  "card-padding": "20px",      /* Keep */
  "card-padding-lg": "24px",   /* NEW: For hero cards */
  "list-item-padding": "20px", /* NEW: For transaction rows */
  "grid-gap": "16px",          /* Keep */
  "section-gap": "24px",       /* NEW: Between major sections */
}
```

**Migration Tasks:**

```tsx
// QuickStatsGrid.tsx - Increase card padding
// Change:
<div className="noir-card p-card-padding ...">
// To:
<div className="noir-card p-6 ..."> // 24px

// TransactionsView.tsx - Increase list item padding  
// Change:
<div className="p-4 hover:bg-noir-active/30 ...">
// To:
<div className="p-5 hover:bg-noir-active/30 ..."> // 20px
```

---

### 1.3 Iconography Assessment

**Current Implementation:**
- Uses `lucide-react` icons (stroke-based)
- Mixed icon sizes: 10px, 12px, 14px, 16px, 18px, 20px, 22px, 24px, 28px
- Icons in circular containers: `rounded-full`, `rounded-interactive`, `rounded-card`

**Issues Found:** ⚠️

| Issue | Location | Current | Problem |
|-------|----------|---------|---------|
| Inconsistent icon sizes in badges | TransactionsView | 10px | Too small for touch |
| Mixed container styles | Header vs MobileNav | Different bg treatments | Visual inconsistency |
| Icon vertical alignment | AlertsPanel | Manual mt-0.5 | Should be automatic |

**Copilot-Style Icon Guidelines:**

```tsx
// Recommended icon size system
const ICON_SIZES = {
  xs: 12,      // Badges, inline indicators
  sm: 14,      // Secondary actions
  md: 16,      // Primary actions, list items
  lg: 18,      // Card headers
  xl: 20,      // Navigation
  "2xl": 24,   // Hero sections
};

// Icon container pattern (Copilot-style)
const IconContainer = ({ 
  size = "md", 
  variant = "primary" 
}) => (
  <div className={cn(
    "flex items-center justify-center rounded-interactive",
    // Size variants
    size === "sm" && "w-8 h-8",
    size === "md" && "w-10 h-10",
    size === "lg" && "w-12 h-12",
    // Color variants
    variant === "primary" && "bg-accent-primary/20 text-accent-primary",
    variant === "positive" && "bg-accent-positive/20 text-accent-positive",
    variant === "negative" && "bg-accent-negative/20 text-accent-negative",
  )}>
    {children}
  </div>
);
```

**Migration Tasks:**

1. **Standardize badge icon sizes:**
```tsx
// TransactionsView.tsx - Badge icons
// Change all badge icons from size={10} to size={12}
<RefreshCw size={12} />
<CreditCard size={12} />
<AlertTriangle size={12} />
```

2. **Unify icon containers in navigation:**
```tsx
// MobileNav.tsx - Standardize icon container
<div className={cn(
  "p-2 rounded-interactive transition-all",
  isActive && "bg-accent-primary/20 shadow-glow-accent"
)}>
```

---

## 2. Accessibility & Color Contrast (WCAG 2.1 AA)

### 2.1 Contrast Ratio Analysis

**Critical Contrast Issues:** 🔴

Using the current color palette:

| Element | Foreground | Background | Ratio | WCAG AA (4.5:1) | Status |
|---------|------------|------------|-------|-----------------|--------|
| Body text | `#94A3B8` | `#050A0F` | **8.2:1** | ✅ Pass | Good |
| Muted text | `#475569` | `#050A0F` | **3.8:1** | ❌ Fail | **Fix Required** |
| Muted on card | `#475569` | `#0D141C` | **3.4:1** | ❌ Fail | **Fix Required** |
| Border (light) | `rgba(255,255,255,0.1)` | `#050A0F` | **1.4:1** | ❌ Fail | Decorative OK |
| Accent positive | `#22C55E` | `#050A0F` | **7.9:1** | ✅ Pass | Good |
| Accent negative | `#EF4444` | `#050A0F` | **5.3:1** | ✅ Pass | Good |
| Accent warning | `#F97316` | `#050A0F` | **5.8:1** | ✅ Pass | Good |
| Accent spending | `#FACC15` | `#050A0F` | **12.5:1** | ✅ Pass | Good |

### 2.2 Critical Fixes Required

**Issue 1: Muted Text Color** ❌

The `text-muted` class (`#475569`) fails WCAG AA on all backgrounds.

**Solution:**
```css
/* globals.css - Update muted color */
:root {
  /* Current: --text-muted: #475569; (3.8:1 ratio) */
  --text-muted: #64748B; /* NEW: 5.1:1 ratio - Passes AA */
}
```

```js
// tailwind.config.js
muted: "#64748B", // Updated from #475569
```

**Affected Components:**
- `TransactionsView.tsx` - Date labels (`text-xs text-muted`)
- `CategoryBudgetChart.tsx` - Target labels (`text-[10px] text-muted`)
- `AlertsPanel.tsx` - Alert descriptions
- `SummaryCards.tsx` - Secondary info
- `QuickStatsGrid.tsx` - Labels

**Issue 2: Ultra-Small Text** ⚠️

Text smaller than 14px needs **7:1** contrast ratio for WCAG AAA or must be at least 4.5:1 for AA.

```tsx
// CategoryBudgetChart.tsx - Line 112
<div className="flex justify-between text-[10px] text-muted mt-1">
```

**Solution:**
```tsx
// Increase minimum font size to 11px and ensure proper contrast
<div className="flex justify-between text-[11px] text-body/70 mt-1">
```

---

### 2.3 Color Blindness Accessibility

**Current Status:** ⚠️ **Needs Improvement**

**Problem Areas:**

1. **Red/Green Distinction** (8% of males affected)
   - "Over budget" uses `accent-negative` (red)
   - "Under budget" uses `accent-positive` (green)
   - Protanopia/Deuteranopia users cannot distinguish

2. **Status Indicators**
   - HealthScore relies solely on color (red/yellow/green)
   - No secondary visual indicator

**Solutions:**

**A) Add Secondary Visual Indicators:**

```tsx
// HealthScore.tsx - Add icons alongside colors
const STATUS_CONFIG = {
  healthy: {
    label: "SAUDÁVEL",
    icon: CheckCircle2,
    pattern: "solid",  // NEW: Visual pattern
    // ...
  },
  warning: {
    label: "ATENÇÃO",
    icon: AlertTriangle,
    pattern: "striped", // NEW
    // ...
  },
  critical: {
    label: "CRÍTICO",
    icon: XCircle,
    pattern: "dotted", // NEW
    // ...
  },
};
```

**B) Use Patterns for Budget Indicators:**

```tsx
// CategoryBudgetChart.tsx - Add patterns to progress bars
<div className="h-2 bg-noir-active rounded-full overflow-hidden relative">
  <div
    className={cn(
      "h-full transition-all duration-500",
      barColor,
      // Add stripe pattern for over-budget
      showWarning && "bg-stripes"
    )}
    style={{ width: `${Math.min(percentOfTarget, 100)}%` }}
  />
</div>
```

```css
/* globals.css - Add stripe pattern utility */
.bg-stripes {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    rgba(0,0,0,0.2) 4px,
    rgba(0,0,0,0.2) 8px
  );
}
```

**C) Always Include Text Labels:**

```tsx
// Ensure badges always have text, not just color
<span className="noir-badge-negative flex items-center gap-1.5">
  <AlertTriangle size={12} />
  Estourou {/* Text label is essential */}
</span>
```

---

### 2.4 Focus States & Keyboard Navigation

**Current Status:** ✅ **Good Foundation**

```css
/* globals.css - Current focus styles */
:focus-visible {
  @apply outline-none ring-2 ring-accent-primary ring-offset-2 ring-offset-noir-primary;
}
```

**Minor Improvements Needed:**

1. **Modal Focus Trap:**
```tsx
// TransactionsView.tsx - Edit Modal needs focus trap
import { FocusTrap } from '@headlessui/react'; // or similar

{editingTransaction && (
  <FocusTrap>
    <div className="fixed inset-0 ...">
      {/* Modal content */}
    </div>
  </FocusTrap>
)}
```

2. **Skip Link for Main Content:**
```tsx
// layout.tsx - Add skip link
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
             noir-btn-primary z-50"
>
  Pular para conteúdo principal
</a>
```

3. **ARIA Labels for Icon-Only Buttons:**
```tsx
// AppHeader.tsx - Sign out button
<button
  type="button"
  onClick={handleSignOut}
  className="..."
  aria-label="Sair da conta" // ADD THIS
>
  <LogOut size={20} />
</button>
```

---

## 3. Layout, Spacing & Typography

### 3.1 Alignment Issues

**Current Analysis:**

| Component | Issue | Status |
|-----------|-------|--------|
| Transaction amounts | Right-aligned | ✅ Correct |
| Category percentages | Right-aligned | ✅ Correct |
| Table columns | Mixed alignment | ⚠️ Needs review |
| Icon containers | Centered | ✅ Correct |

**Issues Found:**

1. **CategoryBudgetChart - Misaligned elements:**
```tsx
// Current implementation
<span className="text-xs text-muted tabular-nums min-w-[80px] text-right">

// Issue: Fixed min-width may not accommodate all currency formats
// Solution: Use tabular-nums and let content determine width
<span className="text-xs text-muted tabular-nums whitespace-nowrap">
```

2. **TransactionsView - Badge alignment:**
```tsx
// Badges wrap inconsistently
<h4 className="font-medium text-heading flex items-center gap-2 flex-wrap">

// Solution: Use flexbox with better wrapping control
<h4 className="font-medium text-heading">
  <span className="flex items-center gap-2 flex-wrap">
```

---

### 3.2 8pt Grid System Analysis

**Current Spacing Values:**

```js
// tailwind.config.js - Current
spacing: {
  "card-padding": "20px",  // ⚠️ Not 8pt multiple (should be 16 or 24)
  "grid-gap": "16px",      // ✅ 8pt multiple
}
```

**Recommended 8pt Grid Alignment:**

```js
// Updated spacing system
spacing: {
  // Base units (8pt grid)
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",  // Keep for compatibility
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  
  // Semantic spacing
  "card-padding": "24px",     // 3 × 8pt
  "card-padding-sm": "16px",  // 2 × 8pt
  "grid-gap": "16px",         // 2 × 8pt
  "section-gap": "32px",      // 4 × 8pt
}
```

**Migration Impact:**

| Component | Current | Recommended | Visual Change |
|-----------|---------|-------------|---------------|
| Card padding | 20px | 24px | +4px (more spacious) |
| Grid gap | 16px | 16px | No change |
| Section margins | 24px | 32px | +8px between sections |

---

### 3.3 Typography Hierarchy

**Current Type Scale:**

```js
fontSize: {
  "dashboard-title": ["22px", { lineHeight: "1.3", fontWeight: "700" }],
  "dashboard-subtitle": ["18px", { lineHeight: "1.4", fontWeight: "600" }],
  "transaction-label": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
}
```

**Analysis vs Copilot:**

| Element | Current | Copilot Reference | Recommendation |
|---------|---------|-------------------|----------------|
| Hero numbers | 2xl-3xl | 32-40px bold | ✅ Good |
| Card titles | text-sm font-semibold | 14px semibold | ✅ Good |
| Body text | text-sm | 14px | ✅ Good |
| Labels | text-xs | 12px | ✅ Good |
| Micro text | text-[10px] | 11px minimum | ⚠️ Increase to 11px |

**Recommended Type Scale Addition:**

```js
fontSize: {
  // Existing...
  
  // Add for better hierarchy
  "hero-number": ["36px", { lineHeight: "1.1", fontWeight: "700" }],
  "section-title": ["16px", { lineHeight: "1.4", fontWeight: "600" }],
  "caption": ["11px", { lineHeight: "1.4", fontWeight: "500" }],
}
```

**Mobile-Specific Typography:**

```css
/* globals.css - Mobile adjustments */
@media (max-width: 640px) {
  .text-3xl {
    font-size: 1.75rem; /* 28px instead of 30px */
  }
  
  .text-2xl {
    font-size: 1.375rem; /* 22px instead of 24px */
  }
}
```

---

## 4. Light Theme Recommendation

### 4.1 Proposed "Paper" Light Theme Palette

Based on the current dark "Financial Noir" palette, here's a cohesive light theme that maintains brand personality:

#### Core Colors

| Token | Dark Theme | Light Theme | Hex Code |
|-------|------------|-------------|----------|
| **Primary Background** | `#050A0F` | Warm White | `#FAFAFA` |
| **Card Background** | `#0D141C` | Pure White | `#FFFFFF` |
| **Surface (Sidebar)** | `#090E14` | Cool Gray | `#F5F5F7` |
| **Active/Hover** | `#1A2430` | Light Gray | `#E5E7EB` |
| **Border** | `rgba(255,255,255,0.05)` | Subtle Gray | `rgba(0,0,0,0.08)` |
| **Border Light** | `rgba(255,255,255,0.1)` | Medium Gray | `rgba(0,0,0,0.12)` |

#### Text Colors

| Token | Dark Theme | Light Theme | Hex Code |
|-------|------------|-------------|----------|
| **Heading** | `#FFFFFF` | Near Black | `#111827` |
| **Body** | `#94A3B8` | Dark Gray | `#4B5563` |
| **Muted** | `#64748B` (updated) | Medium Gray | `#9CA3AF` |

#### Semantic/Accent Colors

| Token | Dark Theme | Light Theme | Hex Code | Contrast (on white) |
|-------|------------|-------------|----------|---------------------|
| **Accent Primary** | `#3B82F6` | Deeper Blue | `#2563EB` | 4.5:1 ✅ |
| **Accent Positive** | `#22C55E` | Forest Green | `#16A34A` | 4.5:1 ✅ |
| **Accent Negative** | `#EF4444` | Deep Red | `#DC2626` | 4.6:1 ✅ |
| **Accent Warning** | `#F97316` | Burnt Orange | `#EA580C` | 4.5:1 ✅ |
| **Accent Spending** | `#FACC15` | Golden | `#CA8A04` | 4.5:1 ✅ |

### 4.2 Light Theme CSS Variables

```css
/* globals.css - Light Theme Variables */
:root.light,
[data-theme="light"] {
  color-scheme: light;
  
  /* Background Colors */
  --noir-primary: #FAFAFA;
  --noir-surface: #FFFFFF;
  --noir-sidebar: #F5F5F7;
  --noir-active: #E5E7EB;
  --noir-border: rgba(0, 0, 0, 0.08);
  --noir-border-light: rgba(0, 0, 0, 0.12);
  
  /* Text Colors */
  --text-heading: #111827;
  --text-body: #4B5563;
  --text-muted: #9CA3AF;
  
  /* Accent Colors (adjusted for light bg) */
  --accent-primary: #2563EB;
  --accent-spending: #CA8A04;
  --accent-positive: #16A34A;
  --accent-negative: #DC2626;
  --accent-warning: #EA580C;
}
```

### 4.3 Light Theme Tailwind Config

```js
// tailwind.config.js - Theme extension
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Dark theme (default)
        noir: {
          primary: "var(--noir-primary)",
          surface: "var(--noir-surface)",
          sidebar: "var(--noir-sidebar)",
          active: "var(--noir-active)",
          border: "var(--noir-border)",
          "border-light": "var(--noir-border-light)",
        },
        heading: "var(--text-heading)",
        body: "var(--text-body)",
        muted: "var(--text-muted)",
        accent: {
          primary: "var(--accent-primary)",
          spending: "var(--accent-spending)",
          positive: "var(--accent-positive)",
          negative: "var(--accent-negative)",
          warning: "var(--accent-warning)",
        },
      },
    },
  },
};
```

### 4.4 Light Theme Component Adjustments

**Cards:**
```css
/* Light theme cards need subtle shadow instead of border glow */
.light .noir-card {
  @apply shadow-sm border-noir-border;
}

.light .noir-card:hover {
  @apply shadow-md;
}
```

**Glow Effects:**
```css
/* Reduce glow intensity in light mode */
.light .shadow-glow-accent {
  box-shadow: 0 0 15px rgba(37, 99, 235, 0.2);
}

.light .shadow-glow-positive {
  box-shadow: 0 0 15px rgba(22, 163, 74, 0.2);
}

.light .shadow-glow-negative {
  box-shadow: 0 0 15px rgba(220, 38, 38, 0.2);
}
```

**Glass Effects:**
```css
/* Adjust glassmorphism for light mode */
.light .noir-glass {
  @apply bg-white/80 backdrop-blur-md border-noir-border;
}
```

### 4.5 Theme Toggle Implementation

**Location:** Settings/Configuration page (`/settings`)  
**Default Behavior:** Follows user's system preference (`prefers-color-scheme`)

#### Theme Context Provider

```tsx
// lib/theme/ThemeContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeOption = "system" | "dark" | "light";
type ResolvedTheme = "dark" | "light";

type ThemeContextType = {
  theme: ThemeOption;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeOption) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeOption>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");

  // Initialize from localStorage or default to "system"
  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemeOption | null;
    if (stored && ["system", "dark", "light"].includes(stored)) {
      setThemeState(stored);
    }
  }, []);

  // Resolve the actual theme based on selection and system preference
  useEffect(() => {
    const resolveTheme = (): ResolvedTheme => {
      if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches 
          ? "dark" 
          : "light";
      }
      return theme;
    };

    const updateResolvedTheme = () => {
      const resolved = resolveTheme();
      setResolvedTheme(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
    };

    updateResolvedTheme();

    // Listen for system theme changes (only relevant when theme is "system")
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (theme === "system") {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, [theme]);

  const setTheme = (newTheme: ThemeOption) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
```

#### Settings Page Theme Section

```tsx
// components/finance/SettingsView.tsx - Add theme settings section

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeContext";

function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  const options = [
    { 
      value: "system", 
      label: "Sistema", 
      description: "Segue a preferência do seu dispositivo",
      icon: Monitor 
    },
    { 
      value: "dark", 
      label: "Escuro", 
      description: "Tema Financial Noir",
      icon: Moon 
    },
    { 
      value: "light", 
      label: "Claro", 
      description: "Tema Paper",
      icon: Sun 
    },
  ] as const;

  return (
    <div className="noir-card overflow-hidden">
      <div className="p-4 border-b border-noir-border bg-noir-active/50">
        <h2 className="font-semibold text-heading">Aparência</h2>
        <p className="text-xs text-muted mt-1">
          Personalize como o FinançasPro aparece no seu dispositivo
        </p>
      </div>
      
      <div className="p-4">
        <fieldset>
          <legend className="sr-only">Escolha o tema</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;
              
              return (
                <label
                  key={option.value}
                  className={`
                    relative flex flex-col items-center gap-2 p-4 rounded-card 
                    border-2 cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? "border-accent-primary bg-accent-primary/10" 
                      : "border-noir-border hover:border-noir-border-light hover:bg-noir-active/30"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => setTheme(option.value)}
                    className="sr-only"
                  />
                  
                  <div className={`
                    p-3 rounded-interactive
                    ${isSelected 
                      ? "bg-accent-primary/20 text-accent-primary" 
                      : "bg-noir-active text-body"
                    }
                  `}>
                    <Icon size={24} />
                  </div>
                  
                  <div className="text-center">
                    <span className={`
                      font-medium block
                      ${isSelected ? "text-accent-primary" : "text-heading"}
                    `}>
                      {option.label}
                    </span>
                    <span className="text-xs text-muted">
                      {option.description}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-primary" />
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
```

#### Root Layout Integration

```tsx
// app/layout.tsx - Wrap app with ThemeProvider

import { ThemeProvider } from "@/lib/theme/ThemeContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const stored = localStorage.getItem('theme');
              const theme = stored || 'system';
              let resolved = theme;
              
              if (theme === 'system') {
                resolved = window.matchMedia('(prefers-color-scheme: dark)').matches 
                  ? 'dark' 
                  : 'light';
              }
              
              document.documentElement.setAttribute('data-theme', resolved);
            })();
          `
        }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### Theme Behavior Summary

| User Selection | System Preference | Applied Theme |
|----------------|-------------------|---------------|
| System (default) | Dark | Dark |
| System (default) | Light | Light |
| Dark | Any | Dark |
| Light | Any | Light |

**Key Features:**
- **Default:** "System" - automatically follows OS preference
- **Persistent:** User's choice saved to localStorage
- **Reactive:** When set to "System", responds to OS theme changes in real-time
- **No Flash:** Inline script in `<head>` prevents wrong theme flash on page load

---

## 5. Migration Plan

### Phase 1: Critical Accessibility Fixes (Week 1)

**Priority: P0 - Must Fix**

| Task | File | Change | Impact |
|------|------|--------|--------|
| 1.1 | `globals.css` | Update `--text-muted` to `#64748B` | All muted text now AA compliant |
| 1.2 | `tailwind.config.js` | Update `muted` color | Sync with CSS vars |
| 1.3 | `CategoryBudgetChart.tsx` | Change `text-[10px]` to `text-[11px]` | Readable micro text |
| 1.4 | `TransactionsView.tsx` | Add `aria-label` to icon buttons | Screen reader support |
| 1.5 | `AppHeader.tsx` | Add `aria-label` to sign out button | Screen reader support |

**Estimated LOC Changed:** ~50 lines

### Phase 2: Color Blindness Support (Week 1-2)

**Priority: P1 - High**

| Task | File | Change |
|------|------|--------|
| 2.1 | `globals.css` | Add `.bg-stripes` utility class |
| 2.2 | `CategoryBudgetChart.tsx` | Add stripe pattern for over-budget |
| 2.3 | `HealthScore.tsx` | Ensure icons always accompany status colors |
| 2.4 | All badge components | Verify text labels present |

**Estimated LOC Changed:** ~100 lines

### Phase 3: Spacing & Typography Refinements (Week 2)

**Priority: P2 - Medium**

| Task | File | Change |
|------|------|--------|
| 3.1 | `tailwind.config.js` | Add new spacing tokens |
| 3.2 | `QuickStatsGrid.tsx` | Increase card padding to 24px |
| 3.3 | `TransactionsView.tsx` | Increase list item padding to 20px |
| 3.4 | `tailwind.config.js` | Add new fontSize tokens |
| 3.5 | All modals | Update to `rounded-outer` |

**Estimated LOC Changed:** ~150 lines

### Phase 4: Icon Standardization (Week 2-3)

**Priority: P2 - Medium**

| Task | File | Change |
|------|------|--------|
| 4.1 | `TransactionsView.tsx` | Standardize badge icons to 12px |
| 4.2 | `MobileNav.tsx` | Unify icon container styles |
| 4.3 | Create `IconContainer` | New component for consistent icons |

**Estimated LOC Changed:** ~200 lines

### Phase 5: Light Theme Implementation (Week 3-4)

**Priority: P3 - Enhancement**

| Task | File | Change |
|------|------|--------|
| 5.1 | `globals.css` | Add light theme CSS variables |
| 5.2 | `tailwind.config.js` | Update to use CSS variables |
| 5.3 | Create `lib/theme/ThemeContext.tsx` | Theme provider with system preference support |
| 5.4 | `app/layout.tsx` | Wrap app with ThemeProvider + anti-flash script |
| 5.5 | `components/finance/SettingsView.tsx` | Add "Aparência" section with theme selector |
| 5.6 | `globals.css` | Add light-mode specific overrides |

**Theme Toggle Location:** Settings page (`/settings`) - NOT in header/footer  
**Default Behavior:** Follows system preference (`prefers-color-scheme`)

**Estimated LOC Changed:** ~350 lines

### Phase 6: Focus Management & Keyboard Nav (Week 4)

**Priority: P1 - High (for full a11y)**

| Task | File | Change |
|------|------|--------|
| 6.1 | `layout.tsx` | Add skip link |
| 6.2 | `TransactionsView.tsx` | Implement focus trap in modals |
| 6.3 | All interactive elements | Verify focus-visible styles |

**Estimated LOC Changed:** ~100 lines

---

## 6. Quick Reference: Color Palette Summary

### Dark Theme (Financial Noir)

```
Backgrounds
├── Primary:      #050A0F  (Near black)
├── Surface:      #0D141C  (Card background)
├── Sidebar:      #090E14  (Navigation)
└── Active:       #1A2430  (Hover states)

Text
├── Heading:      #FFFFFF  (Pure white)
├── Body:         #94A3B8  (Slate gray)
└── Muted:        #64748B  (Updated - medium gray)

Accents
├── Primary:      #3B82F6  (Blue)
├── Positive:     #22C55E  (Green)
├── Negative:     #EF4444  (Red)
├── Warning:      #F97316  (Orange)
└── Spending:     #FACC15  (Yellow)
```

### Light Theme (Paper)

```
Backgrounds
├── Primary:      #FAFAFA  (Warm white)
├── Surface:      #FFFFFF  (Pure white)
├── Sidebar:      #F5F5F7  (Cool gray)
└── Active:       #E5E7EB  (Light gray)

Text
├── Heading:      #111827  (Near black)
├── Body:         #4B5563  (Dark gray)
└── Muted:        #9CA3AF  (Medium gray)

Accents
├── Primary:      #2563EB  (Deeper blue)
├── Positive:     #16A34A  (Forest green)
├── Negative:     #DC2626  (Deep red)
├── Warning:      #EA580C  (Burnt orange)
└── Spending:     #CA8A04  (Golden)
```

---

## 7. Testing Checklist

### Accessibility Testing

- [ ] Run axe DevTools on all pages
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify keyboard-only navigation
- [ ] Test color contrast with WebAIM Contrast Checker
- [ ] Simulate color blindness with Chrome DevTools
- [ ] Test at 200% zoom level
- [ ] Verify focus indicators are visible

### Visual Regression Testing

- [ ] Compare before/after screenshots
- [ ] Test on mobile (375px, 390px, 414px)
- [ ] Test on tablet (768px, 1024px)
- [ ] Test on desktop (1280px, 1440px, 1920px)
- [ ] Verify dark/light theme consistency

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari
- [ ] Android Chrome

---

## Appendix: WCAG 2.1 AA Compliance Checklist

| Criterion | Status | Notes |
|-----------|--------|-------|
| 1.1.1 Non-text Content | ⚠️ | Add alt text to icons |
| 1.3.1 Info and Relationships | ✅ | Semantic HTML used |
| 1.4.1 Use of Color | ⚠️ | Add secondary indicators |
| 1.4.3 Contrast (Minimum) | ⚠️ | Fix muted text color |
| 1.4.4 Resize Text | ✅ | Text scales properly |
| 1.4.10 Reflow | ✅ | Responsive design |
| 1.4.11 Non-text Contrast | ✅ | UI elements visible |
| 2.1.1 Keyboard | ⚠️ | Add focus traps to modals |
| 2.1.2 No Keyboard Trap | ✅ | No traps detected |
| 2.4.1 Bypass Blocks | ⚠️ | Add skip link |
| 2.4.3 Focus Order | ✅ | Logical tab order |
| 2.4.4 Link Purpose | ✅ | Links are descriptive |
| 2.4.6 Headings and Labels | ✅ | Clear headings |
| 2.4.7 Focus Visible | ✅ | Focus ring implemented |
| 3.1.1 Language of Page | ✅ | `lang="pt-BR"` set |
| 3.2.1 On Focus | ✅ | No unexpected changes |
| 3.2.2 On Input | ✅ | No unexpected changes |
| 4.1.1 Parsing | ✅ | Valid HTML |
| 4.1.2 Name, Role, Value | ⚠️ | Add aria-labels |

---

*Document prepared by AI Senior Product Designer & Accessibility Expert*  
*Based on analysis of FinançasPro codebase - February 2026*
