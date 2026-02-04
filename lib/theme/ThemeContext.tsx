"use client";

import { createContext, useContext, useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

type ThemeOption = "system" | "dark" | "light";
type ResolvedTheme = "dark" | "light";

type ThemeContextType = {
  theme: ThemeOption;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeOption) => void;
};

// ============================================================================
// Context
// ============================================================================

const ThemeContext = createContext<ThemeContextType | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeOption>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage or default to "system"
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as ThemeOption | null;
    if (stored && ["system", "dark", "light"].includes(stored)) {
      setThemeState(stored);
    }
  }, []);

  // Resolve the actual theme based on selection and system preference
  useEffect(() => {
    if (!mounted) return;

    const resolveTheme = (): ResolvedTheme => {
      if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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
  }, [theme, mounted]);

  const setTheme = (newTheme: ThemeOption) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
