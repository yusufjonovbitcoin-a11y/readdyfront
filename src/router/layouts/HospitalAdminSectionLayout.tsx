import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HALayout from "@/pages/hospital-admin/components/HALayout";

function getHospitalTitle(pathname: string, t: (key: string) => string): string {
  if (pathname === "/hospital-admin") return t("titles.dashboard");
  if (pathname.startsWith("/hospital-admin/doctors")) return t("sidebar.doctors");
  if (pathname.startsWith("/hospital-admin/patients")) return t("sidebar.patients");
  if (pathname.startsWith("/hospital-admin/analytics")) return t("sidebar.analytics");
  if (pathname.startsWith("/hospital-admin/notifications")) return t("sidebar.notifications");
  if (pathname.startsWith("/hospital-admin/settings")) return t("sidebar.settings");
  return t("titles.dashboard");
}

export default function HospitalAdminSectionLayout() {
  const { t } = useTranslation("hospital");
  const { pathname } = useLocation();
  const title = getHospitalTitle(pathname, t);

  return (
    <HALayout title={title}>
      <Outlet />
    </HALayout>
  );
}
