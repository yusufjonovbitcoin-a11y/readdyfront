import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { DocPatientsProvider } from "@/context/DocPatientsContext";

function getDoctorTitle(pathname: string, t: (key: string) => string): string {
  if (pathname.startsWith("/doctor/patients")) return t("sidebar.newPatients");
  if (pathname.startsWith("/doctor/history")) return t("sidebar.history");
  if (pathname.startsWith("/doctor/questions")) return t("sidebar.questions");
  if (pathname.startsWith("/doctor/analytics")) return t("sidebar.analytics");
  if (pathname.startsWith("/doctor/notifications")) return t("sidebar.notifications");
  if (pathname.startsWith("/doctor/settings")) return t("sidebar.settings");
  if (pathname.startsWith("/doctor/support")) return t("sidebar.support");
  if (pathname.startsWith("/doctor/profile")) return t("profile.title");
  return t("sidebar.newPatients");
}

export default function DoctorSectionLayout() {
  const { t } = useTranslation("doctor");
  const { pathname } = useLocation();
  const title = getDoctorTitle(pathname, t);

  return (
    <DocPatientsProvider>
      <DocLayout title={title}>
        <Outlet />
      </DocLayout>
    </DocPatientsProvider>
  );
}
