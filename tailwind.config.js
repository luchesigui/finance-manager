/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Financial Noir color palette
        noir: {
          bg: {
            primary: "#050A0F",
            surface: "#0D141C",
            sidebar: "#090E14",
            active: "#1A2430",
          },
          text: {
            heading: "#FFFFFF",
            body: "#94A3B8",
            muted: "#475569",
            accent: "#3B82F6",
          },
          accent: {
            spending: "#FACC15",
            positive: "#22C55E",
            negative: "#EF4444",
            warning: "#F97316",
          },
          border: "rgba(255, 255, 255, 0.05)",
        },
      },
      fontFamily: {
        sans: ["Inter", "Montserrat", "system-ui", "sans-serif"],
      },
      fontWeight: {
        heading: "700",
        subheading: "600",
        body: "400",
      },
      borderRadius: {
        outer: "24px",
        card: "16px",
        interactive: "8px",
        pill: "100px",
      },
      spacing: {
        card: "20px",
        grid: "16px",
      },
      fontSize: {
        "dashboard-title": ["18px", { lineHeight: "1.4", fontWeight: "700" }],
        "dashboard-title-lg": ["22px", { lineHeight: "1.4", fontWeight: "700" }],
        transaction: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};
