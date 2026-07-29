import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "paisawise.theme";

export type Theme = "light" | "dark";

/**
 * Reads the theme the blocking script in __root.tsx already applied, so the
 * button starts in the correct state instead of flipping after hydration.
 */
function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode — the choice just will not persist.
  }
}

export function ThemeToggle() {
  // Start as null so the server render and first client render agree; the
  // real value is read in an effect. Prevents a hydration mismatch.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
    >
      {/* Render a stable placeholder until the effect resolves the theme. */}
      {theme === null ? (
        <span className="size-3.5" aria-hidden />
      ) : isDark ? (
        <Sun className="size-3.5 text-brand" />
      ) : (
        <Moon className="size-3.5" />
      )}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
