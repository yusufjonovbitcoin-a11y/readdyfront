import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  getHaAdminStoredAvatar,
  haAdminInitialsFromName,
  HA_ADMIN_AVATAR_UPDATED_EVENT,
} from "@/lib/haAdminProfile";

const HA_ADMIN_DISPLAY_NAME = "Aziz Rahimov";

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: "/hospital-admin", icon: "ri-dashboard-line", label: "Boshqaruv paneli" },
  { path: "/hospital-admin/doctors", icon: "ri-stethoscope-line", label: "Shifokorlar" },
  { path: "/hospital-admin/patients", icon: "ri-user-heart-line", label: "Bemorlar" },
  { path: "/hospital-admin/questions", icon: "ri-questionnaire-line", label: "Savollar" },
  { path: "/hospital-admin/analytics", icon: "ri-bar-chart-2-line", label: "Tahlil" },
  { path: "/hospital-admin/settings", icon: "ri-settings-3-line", label: "Sozlamalar" },
];

interface HASidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  darkMode: boolean;
}

export default function HASidebar({ collapsed, onToggle, darkMode }: HASidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(getHaAdminStoredAvatar);

  useEffect(() => {
    setAvatarUrl(getHaAdminStoredAvatar());
  }, [location.pathname]);

  useEffect(() => {
    const sync = () => setAvatarUrl(getHaAdminStoredAvatar());
    window.addEventListener(HA_ADMIN_AVATAR_UPDATED_EVENT, sync);
    return () => window.removeEventListener(HA_ADMIN_AVATAR_UPDATED_EVENT, sync);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-[width] duration-300 ease-out isolate ${
        collapsed ? "w-16" : "w-64"
      } ${darkMode ? "bg-[#141824] border-r border-[#1E2130]" : "bg-white border-r border-gray-100"}`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <i className="ri-hospital-line text-white text-sm"></i>
          </div>
        </div>
        {!collapsed && (
          <div className="ml-3 flex-1 min-w-0">
            <span className={`text-sm font-bold tracking-wide block truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
              Toshkent Klinikasi
            </span>
            <span className="text-xs text-teal-500 font-medium">Hospital Admin</span>
          </div>
        )}
        <button
          onClick={onToggle}
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
                collapsed ? "justify-center px-2" : "px-3"
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
                key={item.path}
                to={item.path}
                prefetch="none"
                className={itemClass}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <i className={`${item.icon} text-base`}></i>
                </div>
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
                {isActive && !collapsed && (
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
          aria-label="Chiqish"
          className={`w-full flex items-center rounded-lg p-2 text-left transition-colors [-webkit-tap-highlight-color:transparent] outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 ${
            collapsed ? "justify-center" : ""
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
          {!collapsed && (
            <div className="ml-2 flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{HA_ADMIN_DISPLAY_NAME}</p>
              <p className="text-xs text-teal-500 truncate">HOSPITAL_ADMIN</p>
            </div>
          )}
          {!collapsed && (
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <i className={`ri-logout-box-r-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
