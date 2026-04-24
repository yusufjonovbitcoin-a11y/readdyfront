import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "doc-layout-dark-mode";

function getSystemPreference(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function readStoredTheme(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "true" || raw === "dark") return true;
    if (raw === "false" || raw === "light") return false;
  } catch {
    /* ignore storage errors */
  }

  return false;
}

function persistTheme(next: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "true" : "false");
  } catch {
    /* ignore storage errors */
  }
}

export function usePersistedDoctorTheme(): [boolean, () => void, (next: boolean) => void] {
  const [darkMode, setDarkMode] = useState<boolean>(() => readStoredTheme());

  const setDarkModeExplicit = useCallback((next: boolean) => {
    setDarkMode((prev) => {
      if (prev === next) return prev;
      persistTheme(next);
      return next;
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      persistTheme(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setDarkMode(readStoredTheme());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return [darkMode, toggleDarkMode, setDarkModeExplicit];
}
