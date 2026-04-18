import { createContext, useContext, useMemo, type ReactNode } from "react";

interface DoctorThemeContextValue {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (next: boolean) => void;
}

const DoctorThemeContext = createContext<DoctorThemeContextValue | null>(null);

interface DoctorThemeProviderProps extends DoctorThemeContextValue {
  children: ReactNode;
}

export function DoctorThemeProvider({
  darkMode,
  toggleDarkMode,
  setDarkMode,
  children,
}: DoctorThemeProviderProps) {
  const value = useMemo(
    () => ({
      darkMode,
      toggleDarkMode,
      setDarkMode,
    }),
    [darkMode, toggleDarkMode, setDarkMode],
  );

  return <DoctorThemeContext.Provider value={value}>{children}</DoctorThemeContext.Provider>;
}

export function useDoctorTheme(): DoctorThemeContextValue {
  const value = useContext(DoctorThemeContext);
  if (!value) {
    throw new Error("useDoctorTheme must be used within DoctorThemeProvider");
  }
  return value;
}
