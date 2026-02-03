/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Financial Noir Color Palette
        // Note: Using hardcoded values for Tailwind utilities (required for @apply with opacity modifiers)
        // Theme switching is handled via CSS variables in globals.css
        noir: {
          // Backgrounds
          primary: "#050A0F",
          surface: "#0D141C",
          sidebar: "#090E14",
          active: "#1A2430",
          // Borders
          border: "rgba(255, 255, 255, 0.05)",
          "border-light": "rgba(255, 255, 255, 0.1)",
        },
        // Text colors
        heading: "#FFFFFF",
        body: "#94A3B8",
        muted: "#64748B",
        // Semantic accents
        accent: {
          primary: "#3B82F6",
          spending: "#FACC15",
          positive: "#22C55E",
          negative: "#EF4444",
          warning: "#F97316",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        // Dashboard typography
        "dashboard-title": ["22px", { lineHeight: "1.3", fontWeight: "700" }],
        "dashboard-subtitle": ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        "transaction-label": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        // Additional hierarchy tokens
        "hero-number": ["36px", { lineHeight: "1.1", fontWeight: "700" }],
        "section-title": ["16px", { lineHeight: "1.4", fontWeight: "600" }],
        "caption": ["11px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      borderRadius: {
        // Geometry from design spec
        outer: "24px",
        card: "16px",
        interactive: "8px",
        pill: "100px",
      },
      spacing: {
        // Card padding and grid gap (8pt grid system)
        "card-padding": "24px", // Updated from 20px (3 × 8pt)
        "card-padding-sm": "16px", // 2 × 8pt
        "grid-gap": "16px", // 2 × 8pt
        "section-gap": "32px", // 4 × 8pt
        "list-item-padding": "20px", // For transaction rows
      },
      boxShadow: {
        // Subtle glow effects
        "glow-accent": "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-positive": "0 0 20px rgba(34, 197, 94, 0.3)",
        "glow-negative": "0 0 20px rgba(239, 68, 68, 0.3)",
        "glow-warning": "0 0 20px rgba(250, 204, 21, 0.3)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)",
      },
      backgroundImage: {
        // Glassmorphism gradient
        glass:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
        "glass-hover":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
