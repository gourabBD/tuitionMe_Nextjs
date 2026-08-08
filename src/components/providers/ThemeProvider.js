"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "tuition-me-theme";

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

/**
 * Inlined into <head> so `data-theme` is on <html> before the first paint —
 * otherwise a dark-mode visitor gets a white flash on every reload. It runs
 * before React hydrates, which is why the provider below treats the DOM
 * attribute as the source of truth rather than re-deriving it from
 * localStorage (that would disagree with what the server rendered).
 */
export const themeBootScript = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`.trim();

/*
 * The `data-theme` attribute is an external store as far as React is
 * concerned: something outside the tree (the boot script) writes it first.
 * `useSyncExternalStore` subscribes to it properly instead of mirroring it
 * into state from an effect, which would cause a second render on every load.
 */
let listeners = [];

const subscribe = (onChange) => {
  listeners.push(onChange);
  return () => {
    listeners = listeners.filter((listener) => listener !== onChange);
  };
};

const getSnapshot = () =>
  document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";

// The server has no DOM and no localStorage, so it always renders the default;
// the boot script has already corrected the markup by the time this matters.
const getServerSnapshot = () => "light";

export default function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next) => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing with storage disabled — the theme just won't persist.
    }
    listeners.forEach((listener) => listener());
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(getSnapshot() === "light" ? "dark" : "light");
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
