import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

interface HAHeaderProps {
  title: string;
  darkMode: boolean;
  onToggleDark: () => void;
  sidebarCollapsed: boolean;
}

export default function HAHeader({ title, darkMode, onToggleDark, sidebarCollapsed }: HAHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showNotifications, setShowNotifications] = useState(false);
  const [headerQuery, setHeaderQuery] = useState(() => searchParams.get("q") ?? "");

  useEffect(() => {
    setHeaderQuery(searchParams.get("q") ?? "");
  }, [location.pathname, searchParams]);

  const notifications = [
    { id: 1, text: "Yangi bemor ro'yxatdan o'tdi", time: "5 daqiqa oldin", type: "info" },
    { id: 2, text: "Dr. Karimov bugungi qabulni yakunladi", time: "30 daqiqa oldin", type: "success" },
    { id: 3, text: "Navbat tizimida xatolik", time: "2 soat oldin", type: "warning" },
  ];

  const runGlobalSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = headerQuery.trim();
    const path = location.pathname.startsWith("/hospital-admin/doctors")
      ? "/hospital-admin/doctors"
      : "/hospital-admin/patients";
    navigate(q ? { pathname: path, search: `?${new URLSearchParams({ q }).toString()}` } : { pathname: path });
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 z-20 flex items-center px-6 transition-[left] duration-300 ease-out ${
        sidebarCollapsed ? "left-16" : "left-64"
      } ${darkMode ? "bg-[#0F1117] border-b border-[#1E2130]" : "bg-white border-b border-gray-100"}`}
    >
      <div className="flex-1">
        <h1 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h1>
        <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          Toshkent Klinikasi &bull; {new Date().toLocaleDateString("uz-UZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <form
          onSubmit={runGlobalSearch}
          className={`hidden md:flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm min-w-[140px] max-w-[220px] ${darkMode ? "bg-[#1A2235]" : "bg-gray-50"}`}
        >
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-gray-400">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input
            type="search"
            name="q"
            value={headerQuery}
            onChange={(e) => setHeaderQuery(e.target.value)}
            placeholder="Qidirish..."
            autoComplete="off"
            aria-label="Global qidiruv"
            className={`min-w-0 flex-1 bg-transparent text-xs outline-none border-0 p-0 ${
              darkMode ? "text-gray-200 placeholder:text-gray-500" : "text-gray-800 placeholder:text-gray-400"
            }`}
          />
        </form>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
            darkMode ? "bg-[#1A2235] text-yellow-400 hover:bg-[#1E2A3A]" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <i className={`${darkMode ? "ri-sun-line" : "ri-moon-line"} text-base`}></i>
          </div>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer relative ${
              darkMode ? "bg-[#1A2235] text-gray-400 hover:bg-[#1E2A3A]" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-notification-3-line text-base"></i>
            </div>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className={`absolute right-0 top-11 w-80 rounded-xl border z-50 ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`} style={{boxShadow: '0 4px 24px rgba(0,0,0,0.18)'}}>
              <div className={`px-4 py-3 border-b flex items-center justify-between ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
                <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Xabarnomalar</p>
                <button onClick={() => setShowNotifications(false)} className="w-5 h-5 flex items-center justify-center cursor-pointer">
                  <i className={`ri-close-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
                </button>
              </div>
              <div className="py-2">
                {notifications.map((n) => (
                  <div key={n.id} className={`px-4 py-3 cursor-pointer transition-colors ${darkMode ? "hover:bg-[#1A2235]" : "hover:bg-gray-50"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "warning" ? "bg-yellow-400" : n.type === "success" ? "bg-teal-400" : "bg-blue-400"}`}></div>
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{n.text}</p>
                        <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
