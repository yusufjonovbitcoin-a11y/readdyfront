import { useTranslation } from "react-i18next";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { HospitalAdminThemeProvider } from "@/context/HospitalAdminThemeContext";
import { HAQuestionsPageContent } from "@/pages/hospital-admin/questions/page";

export function SuperAdminQuestionsPageContent() {
  const darkMode = useMainLayoutDarkMode();

  return (
    <HospitalAdminThemeProvider darkMode={darkMode}>
      <HAQuestionsPageContent />
    </HospitalAdminThemeProvider>
  );
}

export default function SuperAdminQuestionsPage() {
  const { t } = useTranslation("admin");

  return (
    <MainLayout title={t("titles.questions", { defaultValue: "Savollar" })}>
      <SuperAdminQuestionsPageContent />
    </MainLayout>
  );
}
