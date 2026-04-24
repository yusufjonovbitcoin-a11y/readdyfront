import { useContext } from "react";
import { LayoutThemeContext } from "@/context/LayoutThemeContext";
import { HospitalAdminThemeContext } from "@/context/HospitalAdminThemeContext";
import { DoctorThemeContext } from "@/context/DoctorThemeContext";

export function useAnyDarkMode(): boolean {
  const mainLayoutTheme = useContext(LayoutThemeContext);
  const hospitalAdminTheme = useContext(HospitalAdminThemeContext);
  const doctorTheme = useContext(DoctorThemeContext);

  if (mainLayoutTheme) return mainLayoutTheme.darkMode;
  if (typeof hospitalAdminTheme === "boolean") return hospitalAdminTheme;
  if (doctorTheme) return doctorTheme.darkMode;

  return false;
}

