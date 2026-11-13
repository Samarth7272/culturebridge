"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

const THEME_KEY = "culturebridge-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      const oldAdminTheme = localStorage.getItem("cb-admin-theme");

      const initialTheme: Theme =
        savedTheme === "light" || savedTheme === "dark"
          ? savedTheme
          : oldAdminTheme === "false"
            ? "light"
            : "dark";

      setThemeState(initialTheme);
      document.documentElement.dataset.theme = initialTheme;
      setMounted(true);
    } catch {
      setMounted(true);
    }
  }, []);

  function setTheme(nextTheme: Theme) {
    setThemeState(nextTheme);

    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = nextTheme;
    }

    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // Theme still works for the current session.
    }
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}