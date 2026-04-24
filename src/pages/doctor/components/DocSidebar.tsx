import { useTranslation } from "react-i18next";
import type { RefObject } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  path: string;
  to?: string;
  icon: string;
  label: string;
  exact?: boolean;
}

interface DocSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  drawerRef?: RefObject<HTMLElement | null>;
}

export default function DocSidebar({ collapsed, onToggle, mobileOpen, onCloseMobile, drawerRef }: DocSidebarProps) {
  const { t } = useTranslation("doctor");
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { darkMode } = useDoctorTheme();
  const showExpanded = mobileOpen || !collapsed;
  const handleLogout = async () => {
    await logout();
    onCloseMobile();
    navigate("/login", { replace: true });
  };
  const navItems: NavItem[] = [
    { path: "/doctor/patients", icon: "ri-user-add-line", label: t("sidebar.newPatients") },
    { path: "/doctor/history", icon: "ri-history-line", label: t("sidebar.history") },
    { path: "/doctor/questions", icon: "ri-questionnaire-line", label: t("sidebar.questions") },
    { path: "/doctor/analytics", icon: "ri-bar-chart-2-line", label: t("sidebar.analytics") },
    { path: "/doctor/notifications", icon: "ri-notification-3-line", label: t("sidebar.notifications") },
    { path: "/doctor/support", icon: "ri-customer-service-2-line", label: t("sidebar.support") },
    { path: "/doctor/settings", icon: "ri-settings-3-line", label: t("sidebar.settings") },
  ];

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
        darkMode ? "bg-[#0D1117] border-r border-[#30363D]" : "bg-white border-r border-gray-100"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <i className="ri-stethoscope-line text-white text-sm"></i>
          </div>
        </div>
        {showExpanded && (
          <div className="ml-3 flex-1 min-w-0">
            <span className={`text-sm font-bold tracking-wide block truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
              {t("sidebar.doctorName")}
            </span>
            <span className="text-xs text-violet-500 font-medium">{t("sidebar.specialty")}</span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          className={`ml-auto w-6 h-6 flex items-center justify-center rounded-md transition-colors cursor-pointer flex-shrink-0 ${
            darkMode ? "text-gray-400 hover:text-white hover:bg-[#21262D]" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <i className={`${collapsed ? "ri-menu-unfold-line" : "ri-menu-fold-line"} text-sm`}></i>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const itemClass =
              `no-underline flex items-center h-11 rounded-lg transition-colors duration-150 cursor-pointer [-webkit-tap-highlight-color:transparent] outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 ${
                showExpanded ? "px-3" : "justify-center px-2"
              } ${
                isActive
                  ? darkMode
                    ? "bg-violet-900/40 text-violet-300 active:bg-violet-900/60"
                    : "bg-violet-50 text-violet-600 active:bg-violet-100"
                  : darkMode
                  ? "text-gray-300 hover:bg-[#21262D] hover:text-white active:bg-[#30363D]/80"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
              }`;

            return (
              <Link
                key={item.to ?? item.path}
                to={item.to ?? item.path}
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
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick Stats */}
      {showExpanded && (
        <div className={`mx-3 mb-3 p-3 rounded-lg ${darkMode ? "bg-[#21262D] border border-[#30363D]" : "bg-violet-50"}`}>
          <p className={`text-xs font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t("sidebar.today")}</p>
          <div className="flex justify-between gap-2">
            <div className="text-center flex-1">
              <p className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>3</p>
              <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("sidebar.queue")}</p>
            </div>
            <div className="text-center flex-1">
              <p className={`text-lg font-bold text-green-500`}>2</p>
              <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("sidebar.completed")}</p>
            </div>
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className={`p-3 border-t ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className={`no-underline flex items-center rounded-lg p-2 [-webkit-tap-highlight-color:transparent] outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 ${showExpanded ? "" : "justify-center"} ${
            darkMode ? "hover:bg-[#21262D] active:bg-[#30363D]/80" : "hover:bg-gray-50 active:bg-gray-100"
          } cursor-pointer transition-colors`}
        >
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">AK</span>
          </div>
          {showExpanded && (
            <div className="ml-2 flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{t("sidebar.doctorName")}</p>
              <p className="text-xs text-violet-500 truncate">DOCTOR</p>
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
