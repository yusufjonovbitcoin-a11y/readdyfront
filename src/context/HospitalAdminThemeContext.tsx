import { createContext, useContext, type ReactNode } from "react";

const HospitalAdminThemeContext = createContext<boolean | null>(null);

export function HospitalAdminThemeProvider({
  darkMode,
  children,
}: {
  darkMode: boolean;
  children: ReactNode;
}) {
  return (
    <HospitalAdminThemeContext.Provider value={darkMode}>{children}</HospitalAdminThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOptionalHospitalAdminDarkMode(): boolean | null {
  return useContext(HospitalAdminThemeContext);
}

/** HALayout ichidagi sahifalar — header/sidebar bilan bir xil qorong‘u/yorug‘ */
// eslint-disable-next-line react-refresh/only-export-components
export function useHospitalAdminDarkMode(): boolean {
  const v = useContext(HospitalAdminThemeContext);
  if (v === null) throw new Error("useHospitalAdminDarkMode requires HospitalAdminThemeProvider");
  return v;
}
