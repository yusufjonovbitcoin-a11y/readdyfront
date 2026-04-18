import { Link, useLocation } from "react-router-dom";
import { useDoctorTheme } from "@/context/DoctorThemeContext";

interface NavItem {
  path: string;
  icon: string;
  label: string;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { path: "/doctor/patients", icon: "ri-user-add-line", label: "Yangi Bemorlar" },
  { path: "/doctor/history", icon: "ri-history-line", label: "Tarix" },
  { path: "/doctor/questions", icon: "ri-questionnaire-line", label: "Savollar" },
  { path: "/doctor/analytics", icon: "ri-bar-chart-2-line", label: "Tahlil" },
  { path: "/doctor/settings", icon: "ri-settings-3-line", label: "Sozlamalar" },
];

interface DocSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function DocSidebar({ collapsed, onToggle }: DocSidebarProps) {
  const location = useLocation();
  const { darkMode } = useDoctorTheme();

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-[width] duration-300 ease-out isolate ${
        collapsed ? "w-16" : "w-64"
      } ${darkMode ? "bg-[#0D1117] border-r border-[#30363D]" : "bg-white border-r border-gray-100"}`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <i className="ri-stethoscope-line text-white text-sm"></i>
          </div>
        </div>
        {!collapsed && (
          <div className="ml-3 flex-1 min-w-0">
            <span className={`text-sm font-bold tracking-wide block truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
              Dr. Alisher Karimov
            </span>
            <span className="text-xs text-violet-500 font-medium">Kardiologiya</span>
          </div>
        )}
        <button
          onClick={onToggle}
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
                collapsed ? "justify-center px-2" : "px-3"
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
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick Stats */}
      {!collapsed && (
        <div className={`mx-3 mb-3 p-3 rounded-lg ${darkMode ? "bg-[#21262D] border border-[#30363D]" : "bg-violet-50"}`}>
          <p className={`text-xs font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Bugun</p>
          <div className="flex justify-between">
            <div className="text-center">
              <p className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>3</p>
              <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Navbat</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold text-amber-500`}>2</p>
              <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Jarayonda</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold text-green-500`}>2</p>
              <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Tugallandi</p>
            </div>
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className={`p-3 border-t ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
        <Link
          to="/doctor/profile"
          prefetch="none"
          className={`no-underline flex items-center rounded-lg p-2 [-webkit-tap-highlight-color:transparent] outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 ${collapsed ? "justify-center" : ""} ${
            darkMode ? "hover:bg-[#21262D] active:bg-[#30363D]/80" : "hover:bg-gray-50 active:bg-gray-100"
          } cursor-pointer transition-colors`}
        >
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">AK</span>
          </div>
          {!collapsed && (
            <div className="ml-2 flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${darkMode ? "text-white" : "text-gray-900"}`}>Dr. Alisher Karimov</p>
              <p className="text-xs text-violet-500 truncate">DOCTOR</p>
            </div>
          )}
          {!collapsed && (
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <i className={`ri-logout-box-r-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
