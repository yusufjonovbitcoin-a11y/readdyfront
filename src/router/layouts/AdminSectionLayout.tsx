import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MainLayout from "@/components/feature/MainLayout";

function getAdminTitle(pathname: string, t: (key: string) => string): string {
  if (pathname === "/home" || pathname === "/dashboard") return t("titles.dashboard");
  if (pathname.startsWith("/hospitals")) return t("titles.hospitals");
  if (pathname.startsWith("/analytics")) return t("titles.analytics");
  if (pathname.startsWith("/users/detail")) return t("titles.usersMemberDetail");
  if (pathname.startsWith("/users/doctor")) return t("titles.usersDoctorDetail");
  if (pathname.startsWith("/users")) return t("titles.users");
  if (pathname.startsWith("/notifications")) return t("sidebar.notifications");
  if (pathname.startsWith("/news")) return t("sidebar.news");
  if (pathname.startsWith("/admin-chat")) return t("sidebar.chatGuruhi");
  if (pathname.startsWith("/audit-logs")) return t("titles.auditLogs");
  if (pathname.startsWith("/settings")) return t("titles.settings");
  return t("titles.dashboard");
}

export default function AdminSectionLayout() {
  const { t } = useTranslation("admin");
  const { pathname } = useLocation();
  const title = getAdminTitle(pathname, t);

  return (
    <MainLayout title={title}>
      <Outlet />
    </MainLayout>
  );
}
