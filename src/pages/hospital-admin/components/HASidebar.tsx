import { useTranslation } from "react-i18next";
import { useEffect, useState, type RefObject } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  getHaAdminStoredAvatar,
  haAdminInitialsFromName,
  HA_ADMIN_AVATAR_UPDATED_EVENT,
} from "@/lib/haAdminProfile";
import { prefetchCoreQueriesForPath } from "@/lib/coreQueryCache";

const HA_ADMIN_DISPLAY_NAME = "Aziz Rahimov";

interface NavItem {
  path: string;
  to?: string;
  icon: string;
  label: string;
}

interface HASidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  darkMode: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  drawerRef?: RefObject<HTMLElement | null>;
}

export default function HASidebar({ collapsed, onToggle, darkMode, mobileOpen, onCloseMobile, drawerRef }: HASidebarProps) {
  const { t } = useTranslation("hospital");
  const location = useLocation();
  const showExpanded = mobileOpen || !collapsed;
  const navItems: NavItem[] = [
    { path: "/hospital-admin", icon: "ri-dashboard-line", label: t("sidebar.dashboard") },
    { path: "/hospital-admin/doctors", icon: "ri-stethoscope-line", label: t("sidebar.doctors") },
    { path: "/hospital-admin/patients", icon: "ri-user-heart-line", label: t("sidebar.patients") },
    { path: "/hospital-admin/analytics", icon: "ri-bar-chart-2-line", label: t("sidebar.analytics") },
    { path: "/hospital-admin/notifications", icon: "ri-notification-3-line", label: t("sidebar.notifications") },
    { path: "/hospital-admin/settings", icon: "ri-settings-3-line", label: t("sidebar.settings") },
  ];
  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(getHaAdminStoredAvatar);
  const prefetchPath = (path: string) => {
    prefetchCoreQueriesForPath(queryClient, path);
  };

  useEffect(() => {
    setAvatarUrl(getHaAdminStoredAvatar());
  }, [location.pathname]);

  useEffect(() => {
    const sync = () => setAvatarUrl(getHaAdminStoredAvatar());
    window.addEventListener(HA_ADMIN_AVATAR_UPDATED_EVENT, sync);
    return () => window.removeEventListener(HA_ADMIN_AVATAR_UPDATED_EVENT, sync);
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
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <i className="ri-hospital-line text-white text-sm"></i>
          </div>
        </div>
        {showExpanded && (
          <div className="ml-3 flex-1 min-w-0">
            <span className={`text-sm font-bold tracking-wide block truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
              {t("sidebar.hospitalName")}
            </span>
            <span className="text-xs text-teal-500 font-medium">{t("sidebar.hospitalAdmin")}</span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          className={`ml-auto w-6 h-6 flex items-center justify-center rounded-md transition-colors cursor-pointer flex-shrink-0 ${
            darkMode ? "text-gray-400 hover:text-white hover:bg-[#1E2A3A]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <i className={`${collapsed ? "ri-menu-unfold-line" : "ri-menu-fold-line"} text-sm`}></i>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = item.path === "/hospital-admin"
              ? location.pathname === "/hospital-admin"
              : location.pathname.startsWith(item.path);
            const itemClass =
              `no-underline flex items-center h-11 rounded-lg transition-colors duration-150 cursor-pointer [-webkit-tap-highlight-color:transparent] outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 ${
                showExpanded ? "px-3" : "justify-center px-2"
              } ${
                isActive
                  ? darkMode
                    ? "bg-teal-900/40 text-teal-400 active:bg-teal-900/60 active:text-teal-300"
                    : "bg-teal-50 text-teal-600 active:bg-teal-100 active:text-teal-700"
                  : darkMode
                  ? "text-gray-400 hover:bg-[#1A2235] hover:text-white active:bg-[#243044] active:text-white"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 active:text-gray-900"
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
                {isActive && showExpanded && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Chiqish (Super Admin sidebar bilan bir xil: pastki blok → login) */}
      <div className={`p-3 border-t ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
        <button
          type="button"
          onClick={handleLogout}
          aria-label={t("sidebar.logout")}
          className={`w-full flex items-center rounded-lg p-2 text-left transition-colors [-webkit-tap-highlight-color:transparent] outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 ${
            showExpanded ? "" : "justify-center"
          } ${darkMode ? "hover:bg-[#1E2A3A]" : "hover:bg-gray-50"} cursor-pointer`}
        >
          <div
            className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${
              avatarUrl ? (darkMode ? "bg-[#1A2235]" : "bg-gray-100") : "bg-teal-500"
            }`}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">{haAdminInitialsFromName(HA_ADMIN_DISPLAY_NAME)}</span>
            )}
          </div>
          {showExpanded && (
            <div className="ml-2 flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{HA_ADMIN_DISPLAY_NAME}</p>
              <p className="text-xs text-teal-500 truncate">HOSPITAL_ADMIN</p>
            </div>
          )}
          {showExpanded && (
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <i className={`ri-logout-box-r-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
