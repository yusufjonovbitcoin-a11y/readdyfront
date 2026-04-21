import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth, type UserRole } from "@/hooks/useAuth";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

function AuthBootstrapFallback() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
        <i className="ri-loader-4-line animate-spin text-base text-emerald-600" aria-hidden="true" />
        <span>{t("auth.redirecting")}</span>
      </div>
    </div>
  );
}

function getHomePathByRole(role: UserRole): string {
  if (role === "SUPER_ADMIN") return "/dashboard";
  if (role === "HOSPITAL_ADMIN") return "/hospital-admin";
  return "/doctor/patients";
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const { user, isBootstrapping } = useAuth();

  /**
   * Guard 1: while auth state is hydrating from storage,
   * render lightweight loader to avoid blank screen and redirect flicker.
   */
  if (isBootstrapping) return <AuthBootstrapFallback />;

  /**
   * Guard 2: unauthenticated users are redirected to login.
   * We preserve the intended URL in navigation state so login can return users back.
   */
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  /**
   * Guard 3: authenticated but unauthorized role.
   * Redirect to the role's own section home instead of showing forbidden content.
   */
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePathByRole(user.role)} replace state={{ deniedReason: t("common.forbidden") }} />;
  }

  return <>{children}</>;
}
