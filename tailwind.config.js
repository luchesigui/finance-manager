/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        noir: {
          primary: "rgb(var(--noir-primary) / <alpha-value>)",
          surface: "rgb(var(--noir-surface) / <alpha-value>)",
          sidebar: "rgb(var(--noir-sidebar) / <alpha-value>)",
          active: "rgb(var(--noir-active) / <alpha-value>)",
          elevated: "rgb(var(--noir-elevated) / <alpha-value>)",
          border: "var(--noir-border)",
          "border-light": "var(--noir-border-light)",
        },
        heading: "rgb(var(--text-heading) / <alpha-value>)",
        body: "rgb(var(--text-body) / <alpha-value>)",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          primary: "rgb(var(--accent-primary) / <alpha-value>)",
          "primary-light": "rgb(var(--accent-primary-light) / <alpha-value>)",
          spending: "rgb(var(--accent-spending) / <alpha-value>)",
          positive: "rgb(var(--accent-positive) / <alpha-value>)",
          negative: "rgb(var(--accent-negative) / <alpha-value>)",
          warning: "rgb(var(--accent-warning) / <alpha-value>)",
          info: "rgb(var(--accent-primary) / <alpha-value>)",
          // shadcn additions (merged into accent object)
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // ── shadcn color keys ────────────────────────────────────────────────
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        positive: {
          DEFAULT: "hsl(var(--positive))",
          foreground: "hsl(var(--positive-foreground))",
        },
        negative: {
          DEFAULT: "hsl(var(--negative))",
          foreground: "hsl(var(--negative-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        display: ["Instrument Serif", "Georgia", "Times New Roman", "serif"],
        "mono-nums": ["JetBrains Mono", "SF Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "dashboard-title": [
          "22px",
          {
            lineHeight: "1.3",
            fontWeight: "700",
          },
        ],
        "dashboard-subtitle": [
          "18px",
          {
            lineHeight: "1.4",
            fontWeight: "600",
          },
        ],
        "transaction-label": [
          "14px",
          {
            lineHeight: "1.5",
            fontWeight: "400",
          },
        ],
        "hero-number": [
          "36px",
          {
            lineHeight: "1.1",
            fontWeight: "400",
          },
        ],
        "section-title": [
          "16px",
          {
            lineHeight: "1.4",
            fontWeight: "600",
          },
        ],
        caption: [
          "11px",
          {
            lineHeight: "1.4",
            fontWeight: "500",
          },
        ],
        "section-label": [
          "10px",
          {
            lineHeight: "1.4",
            fontWeight: "600",
            letterSpacing: "0.1em",
          },
        ],
      },
      borderRadius: {
        outer: "24px",
        card: "16px",
        interactive: "10px",
        pill: "100px",
        // shadcn additions
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        "card-padding": "24px",
        "card-padding-sm": "16px",
        "grid-gap": "16px",
        "section-gap": "32px",
        "list-item-padding": "20px",
      },
      boxShadow: {
        "glow-accent": "0 4px 30px rgb(var(--accent-primary) / 0.2)",
        "glow-positive": "0 4px 30px rgb(var(--accent-positive) / 0.2)",
        "glow-negative": "0 4px 30px rgb(var(--accent-negative) / 0.2)",
        "glow-warning": "0 4px 30px rgb(var(--accent-warning) / 0.2)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },
      backgroundImage: {
        glass:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)",
        "glass-hover":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 100%)",
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "slide-up": "slide-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.5s ease-out both",
        "scale-in": "scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.7",
          },
        },
        "slide-up": {
          from: {
            opacity: "0",
            transform: "translateY(16px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
          },
          to: {
            opacity: "1",
          },
        },
        "scale-in": {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
