import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { path: "/", icon: "ri-dashboard-line", label: "Boshqaruv paneli" },
  { path: "/hospitals", icon: "ri-hospital-line", label: "Kasalxonalar" },
  { path: "/analytics", icon: "ri-bar-chart-2-line", label: "Tahlil" },
  { path: "/users", icon: "ri-team-line", label: "Foydalanuvchilar" },
  { path: "/audit-logs", icon: "ri-shield-check-line", label: "Audit Logs" },
  { path: "/settings", icon: "ri-settings-3-line", label: "Sozlamalar" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  darkMode: boolean;
}

export default function Sidebar({ collapsed, onToggle, darkMode }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleProfileClick = () => {
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
          <img
            src="https://public.readdy.ai/ai/img_res/25edf702-1bdb-4dcb-86c7-fcb2c38b87e9.png"
            alt="MedCore Logo"
            className="w-8 h-8 object-contain rounded-lg"
          />
        </div>
        {!collapsed && (
          <span className={`ml-3 text-lg font-bold tracking-wide ${darkMode ? "text-white" : "text-gray-900"}`}>
            MedCore
          </span>
        )}
        <button
          onClick={onToggle}
          className={`ml-auto w-6 h-6 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
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
            const isActive = item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
            const itemClass =
              `no-underline flex items-center h-11 rounded-lg transition-colors duration-150 cursor-pointer [-webkit-tap-highlight-color:transparent] outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                collapsed ? "justify-center px-2" : "px-3"
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
          aria-label="Chiqish"
          className={`w-full flex items-center rounded-lg p-2 text-left ${collapsed ? "justify-center" : ""} ${darkMode ? "hover:bg-[#1E2A3A]" : "hover:bg-gray-50"} cursor-pointer transition-colors`}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">SA</span>
          </div>
          {!collapsed && (
            <div className="ml-2 flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${darkMode ? "text-white" : "text-gray-900"}`}>Super Admin</p>
              <p className="text-xs text-emerald-500 truncate">SUPER_ADMIN</p>
            </div>
          )}
          {!collapsed && (
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <i className={`ri-logout-box-r-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
