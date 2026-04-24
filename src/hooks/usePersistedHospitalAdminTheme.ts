import { useCallback, useState } from "react";

const STORAGE_KEY = "medcore_hospital_admin_theme";

function readStoredDark(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light") return false;
    if (v === "dark") return true;
  } catch {
    /* ignore */
  }
  /* Birinchi kirish: yorug‘ (foydalanuvchi keyin o‘zi o‘zgartirishi mumkin) */
  return false;
}

function persistDark(next: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  } catch {
    /* ignore */
  }
}

/** Hospital Admin: marshrut almashganda HALayout qayta mount bo‘lsa ham tema saqlanadi */
export function usePersistedHospitalAdminTheme(): [boolean, () => void, (dark: boolean) => void] {
  const [darkMode, setDarkMode] = useState(() => readStoredDark());

  const toggleDarkMode = useCallback(() => {
    setDarkMode((d) => {
      const next = !d;
      persistDark(next);
      return next;
    });
  }, []);

  const setDarkModeExplicit = useCallback((next: boolean) => {
    setDarkMode((prev) => {
      if (prev === next) return prev;
      persistDark(next);
      return next;
    });
  }, []);

  return [darkMode, toggleDarkMode, setDarkModeExplicit];
}
