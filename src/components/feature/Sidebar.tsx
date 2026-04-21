import { useTranslation } from "react-i18next";
import type { RefObject } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import medcoreLogoImage from "@/assets/medcore-logo.png";

interface NavItem {
  path: string;
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

export default function Sidebar({ collapsed, onToggle, darkMode, mobileOpen, onCloseMobile, drawerRef }: SidebarProps) {
  const { t } = useTranslation("admin");
  const location = useLocation();
  const showExpanded = mobileOpen || !collapsed;
  const navItems: NavItem[] = [
    { path: "/dashboard", icon: "ri-dashboard-line", label: t("admin:sidebar.dashboard") },
    { path: "/hospitals", icon: "ri-hospital-line", label: t("admin:sidebar.hospitals") },
    { path: "/analytics", icon: "ri-bar-chart-2-line", label: t("admin:sidebar.analytics") },
    { path: "/users", icon: "ri-team-line", label: t("admin:sidebar.users") },
    { path: "/audit-logs", icon: "ri-shield-check-line", label: t("admin:sidebar.auditLogs") },
    { path: "/settings", icon: "ri-settings-3-line", label: t("admin:sidebar.settings") },
  ];

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleProfileClick = async () => {
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
              `no-underline flex items-center h-11 rounded-lg transition-colors duration-150 cursor-pointer [-webkit-tap-highlight-color:transparent] outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
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
                key={item.path}
                to={item.path}
                prefetch="none"
                onClick={onCloseMobile}
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
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className={`p-3 border-t ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
        <button
          type="button"
          onClick={handleProfileClick}
          aria-label={t("admin:sidebar.logout")}
          className={`w-full flex items-center rounded-lg p-2 text-left ${showExpanded ? "" : "justify-center"} ${darkMode ? "hover:bg-[#1E2A3A]" : "hover:bg-gray-50"} cursor-pointer transition-colors`}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">SA</span>
          </div>
          {showExpanded && (
            <div className="ml-2 flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{t("admin:sidebar.superAdmin")}</p>
              <p className="text-xs text-emerald-500 truncate">SUPER_ADMIN</p>
            </div>
          )}
          {showExpanded && (
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <i className={`ri-logout-box-r-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
