import { useOptionalMainLayoutTheme } from "@/context/LayoutThemeContext";
import { useOptionalHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import { useOptionalDoctorTheme } from "@/context/DoctorThemeContext";

export function useAnyDarkMode(): boolean {
  const mainLayoutTheme = useOptionalMainLayoutTheme();
  const hospitalAdminTheme = useOptionalHospitalAdminDarkMode();
  const doctorTheme = useOptionalDoctorTheme();

  if (mainLayoutTheme) return mainLayoutTheme.darkMode;
  if (typeof hospitalAdminTheme === "boolean") return hospitalAdminTheme;
  if (doctorTheme) return doctorTheme.darkMode;

  return false;
}

