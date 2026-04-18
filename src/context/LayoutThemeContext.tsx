import { createContext, useContext, type ReactNode } from "react";

export type LayoutThemeValue = {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
};

const LayoutThemeContext = createContext<LayoutThemeValue | null>(null);

export function LayoutThemeProvider({
  darkMode,
  setDarkMode,
  children,
}: {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  children: ReactNode;
}) {
  return (
    <LayoutThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </LayoutThemeContext.Provider>
  );
}

/** MainLayout ichidagi kontentda — header/sidebar bilan bir xil tema */
export function useMainLayoutDarkMode(): boolean {
  const v = useContext(LayoutThemeContext);
  if (!v) throw new Error("useMainLayoutDarkMode requires LayoutThemeProvider");
  return v.darkMode;
}

/** Tema o‘zgartirish (masalan Sozlamalar → Ko‘rinish) */
export function useMainLayoutTheme(): LayoutThemeValue {
  const v = useContext(LayoutThemeContext);
  if (!v) throw new Error("useMainLayoutTheme requires LayoutThemeProvider");
  return v;
}
