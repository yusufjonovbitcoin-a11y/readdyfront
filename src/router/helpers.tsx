import { Suspense, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth, type UserRole } from "@/hooks/useAuth";

export function RouteFallback() {
  const { t } = useTranslation("common");
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
      {t("loading")}
    </div>
  );
}

export function AuthBootstrapFallback() {
  const { t } = useTranslation("auth");
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
        <i className="ri-loader-4-line always-spin text-base text-emerald-600" aria-hidden="true" />
        <span>{t("redirecting")}</span>
      </div>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function getHomePathByRole(role: UserRole): string {
  if (role === "SUPER_ADMIN") return "/dashboard";
  if (role === "HOSPITAL_ADMIN") return "/hospital-admin";
  return "/doctor/patients";
}

export function RootIndexRedirect() {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <AuthBootstrapFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getHomePathByRole(user.role)} replace />;
}

export function WithSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}
