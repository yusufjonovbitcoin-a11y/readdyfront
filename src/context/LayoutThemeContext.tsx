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

// eslint-disable-next-line react-refresh/only-export-components
export function useOptionalMainLayoutTheme(): LayoutThemeValue | null {
  return useContext(LayoutThemeContext);
}

/** MainLayout ichidagi kontentda — header/sidebar bilan bir xil tema */
// eslint-disable-next-line react-refresh/only-export-components
export function useMainLayoutDarkMode(): boolean {
  const v = useContext(LayoutThemeContext);
  if (!v) throw new Error("useMainLayoutDarkMode requires LayoutThemeProvider");
  return v.darkMode;
}

/** Tema o‘zgartirish (masalan Sozlamalar → Ko‘rinish) */
// eslint-disable-next-line react-refresh/only-export-components
export function useMainLayoutTheme(): LayoutThemeValue {
  const v = useContext(LayoutThemeContext);
  if (!v) throw new Error("useMainLayoutTheme requires LayoutThemeProvider");
  return v;
}
