import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { PatientDetailLayoutMode } from "@/hooks/usePersistedPatientDetailLayout";

interface DoctorThemeContextValue {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (next: boolean) => void;
  patientDetailLayout: PatientDetailLayoutMode;
  setPatientDetailLayout: (next: PatientDetailLayoutMode) => void;
}

export const DoctorThemeContext = createContext<DoctorThemeContextValue | null>(null);

interface DoctorThemeProviderProps extends DoctorThemeContextValue {
  children: ReactNode;
}

export function DoctorThemeProvider({
  darkMode,
  toggleDarkMode,
  setDarkMode,
  patientDetailLayout,
  setPatientDetailLayout,
  children,
}: DoctorThemeProviderProps) {
  const value = useMemo(
    () => ({
      darkMode,
      toggleDarkMode,
      setDarkMode,
      patientDetailLayout,
      setPatientDetailLayout,
    }),
    [darkMode, toggleDarkMode, setDarkMode, patientDetailLayout, setPatientDetailLayout],
  );

  return <DoctorThemeContext.Provider value={value}>{children}</DoctorThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDoctorTheme(): DoctorThemeContextValue {
  const value = useContext(DoctorThemeContext);
  if (!value) {
    throw new Error("useDoctorTheme must be used within DoctorThemeProvider");
  }
  return value;
}
