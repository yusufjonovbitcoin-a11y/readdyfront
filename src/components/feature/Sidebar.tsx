import { useTranslation } from "react-i18next";
import { useEffect, useState, type RefObject } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { formatAppRoleLabel, getUserInitials } from "@/lib/userDisplay";
import { getNotifications as fetchNotifications, type Notification as AppNotification } from "@/api/services/notifications.service";
import medcoreLogoImage from "@/assets/medcore-logo.png";
import { prefetchCoreQueriesForPath, prefetchSidebarWarmup } from "@/lib/coreQueryCache";

interface NavItem {
  path: string;
  to?: string;
  icon: string;
  label: string;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  darkMode: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  drawerRef?: RefObject<HTMLElement | null>;
}

const NOTIFICATIONS_STORAGE_KEY = "medcore_notifications_v1";

export default function Sidebar({ collapsed, onToggle, darkMode, mobileOpen, onCloseMobile, drawerRef }: SidebarProps) {
  const { t } = useTranslation("admin");
  const location = useLocation();
  const showExpanded = mobileOpen || !collapsed;
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const navItems: NavItem[] = [
    { path: "/dashboard", icon: "ri-dashboard-line", label: t("admin:sidebar.dashboard") },
    { path: "/hospitals", icon: "ri-hospital-line", label: t("admin:sidebar.hospitals") },
    { path: "/analytics", icon: "ri-bar-chart-2-line", label: t("admin:sidebar.analytics") },
    { path: "/users", icon: "ri-team-line", label: t("admin:sidebar.users") },
    { path: "/audit-logs", icon: "ri-shield-check-line", label: t("admin:sidebar.auditLogs") },
    { path: "/questions", icon: "ri-questionnaire-line", label: t("admin:sidebar.questions") },
    { path: "/notifications", icon: "ri-notification-3-line", label: t("admin:sidebar.notifications") },
    { path: "/settings", icon: "ri-settings-3-line", label: t("admin:sidebar.settings") },
  ];

  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const sidebarDisplayName = user?.name?.trim() || t("admin:sidebar.superAdmin");
  const sidebarRoleLabel = formatAppRoleLabel(user?.role ?? "SUPER_ADMIN");
  const sidebarInitials = getUserInitials(user?.name ?? sidebarDisplayName);
  const queryClient = useQueryClient();
  const prefetchPath = (path: string) => {
    prefetchCoreQueriesForPath(queryClient, path);
  };

  useEffect(() => {
    prefetchSidebarWarmup(queryClient, location.pathname);
  }, [location.pathname, queryClient]);

  useEffect(() => {
    let cancelled = false;

    const syncUnreadNotificationState = async () => {
      let remote: AppNotification[] = [];
      try {
        remote = await fetchNotifications();
      } catch {
        // Ignore transient request issues, we still can fall back to local cache.
      }

      let local: AppNotification[] = [];
      try {
        const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as AppNotification[];
          if (Array.isArray(parsed)) local = parsed;
        }
      } catch {
        // Ignore malformed local notification cache.
      }

      if (cancelled) return;
      const merged = [...remote, ...local];
      const dedupedById = Array.from(new Map(merged.map((item) => [item.id, item])).values());
      setHasUnreadNotifications(dedupedById.some((item) => !item.read));
    };

    void syncUnreadNotificationState();
    window.addEventListener("storage", syncUnreadNotificationState);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", syncUnreadNotificationState);
    };
  }, []);

  const handleLogout = async () => {
    onCloseMobile();
    await logout();
    navigate("/login");
  };

  return (
    <aside
      ref={drawerRef}
      role={mobileOpen ? "dialog" : undefined}
      aria-modal={mobileOpen ? "true" : undefined}
      aria-label={mobileOpen ? "Navigation menu" : undefined}
      tabIndex={mobileOpen ? -1 : undefined}
      className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-[width,transform] duration-300 ease-out isolate ${
        collapsed ? "w-64 md:w-16" : "w-64"
      } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} ${
        darkMode ? "bg-[#141824] border-r border-[#1E2130]" : "bg-white border-r border-gray-100"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <img
            src={medcoreLogoImage}
            alt="MedCore Logo"
            className="w-8 h-8 object-contain rounded-lg"
          />
        </div>
        {showExpanded && (
          <span className={`ml-3 text-lg font-bold tracking-wide ${darkMode ? "text-white" : "text-gray-900"}`}>
            MedCore
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          className={`ml-auto w-6 h-6 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
            darkMode ? "text-gray-400 hover:text-white hover:bg-[#1E2A3A]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <i className={`${collapsed ? "ri-menu-unfold-line" : "ri-menu-fold-line"} text-sm`} aria-hidden="true"></i>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = item.path === "/dashboard"
              ? location.pathname === "/dashboard" || location.pathname === "/home"
              : location.pathname.startsWith(item.path);
            const itemClass =
              `no-underline relative flex items-center h-11 rounded-lg transition-colors duration-150 cursor-pointer [-webkit-tap-highlight-color:transparent] outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                showExpanded ? "px-3" : "justify-center px-2"
              } ${
                isActive
                  ? darkMode
                    ? "bg-[#1E2A3A] text-emerald-400 active:bg-[#243044]"
                    : "bg-emerald-50 text-emerald-600 active:bg-emerald-100"
                  : darkMode
                  ? "text-gray-400 hover:bg-[#1A2235] hover:text-white active:bg-[#243044]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
              }`;

            return (
              <Link
                key={item.to ?? item.path}
                to={item.to ?? item.path}
                prefetch="none"
                onClick={onCloseMobile}
                onMouseEnter={() => prefetchPath(item.to ?? item.path)}
                onFocus={() => prefetchPath(item.to ?? item.path)}
                className={itemClass}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                title={item.label}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <i className={`${item.icon} text-base`}></i>
                </div>
                {showExpanded && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
                {item.path === "/notifications" && hasUnreadNotifications && (
                  <span
                    className={`${showExpanded ? "ml-auto" : "absolute top-2.5 right-2.5"} w-2 h-2 rounded-full bg-red-500 flex-shrink-0`}
                    aria-hidden="true"
                  />
                )}
                {isActive && showExpanded && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Profil (sozlamalar) + chiqish — boshqa rollar sidebar bilan bir xil */}
      <div className={`p-3 border-t ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
        <div
          className={`flex [-webkit-tap-highlight-color:transparent] ${
            showExpanded ? "items-stretch justify-between gap-2" : "flex-col items-center gap-2"
          }`}
        >
          <Link
            to="/settings"
            prefetch="none"
            onClick={onCloseMobile}
            className={`no-underline flex min-w-0 items-center rounded-lg py-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
              showExpanded ? "min-h-11 flex-1 gap-2 px-3" : "justify-center px-2"
            } ${darkMode ? "text-white hover:bg-[#1E2A3A] active:bg-[#243044]/80" : "hover:bg-gray-50 active:bg-gray-100"}`}
            aria-label={`${sidebarDisplayName} — ${t("admin:sidebar.settings")}`}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-500">
              <span className="text-xs font-bold text-white">{sidebarInitials}</span>
            </div>
            {showExpanded && (
              <div className="min-w-0 flex-1 text-left">
                <p className={`truncate text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {sidebarDisplayName}
                </p>
                <p className="truncate text-xs text-emerald-500">{sidebarRoleLabel}</p>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            aria-label={t("admin:sidebar.logout")}
            title={t("admin:sidebar.logout")}
            className={`flex w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
              darkMode
                ? "text-gray-400 hover:bg-[#1E2A3A] hover:text-white active:bg-[#243044]/80"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
            }`}
          >
            <i className="ri-logout-box-r-line text-lg" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
