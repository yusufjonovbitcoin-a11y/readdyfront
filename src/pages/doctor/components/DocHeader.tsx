import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDoctorTheme } from "@/context/DoctorThemeContext";

interface DocHeaderProps {
  title: string;
  sidebarCollapsed: boolean;
}

export default function DocHeader({ title, sidebarCollapsed }: DocHeaderProps) {
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDoctorTheme();

  const notifications = [
    { id: 1, text: "Yangi bemor navbatga qo'shildi: Sardor Umarov", time: "2 daqiqa oldin", type: "info" },
    { id: 2, text: "Firdavs Normatov — KRITIK holat aniqlandi", time: "15 daqiqa oldin", type: "critical" },
    { id: 3, text: "Bugungi navbat: 7 bemor", time: "1 soat oldin", type: "info" },
  ];

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 flex items-center px-6 transition-[left] duration-300 ease-out ${
        sidebarCollapsed ? "left-16" : "left-64"
      } ${darkMode ? "bg-[#0D1117] border-b border-[#1C2333]" : "bg-white border-b border-gray-100"}`}
    >
      <div className="flex items-center gap-2">
        <h1 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Date */}
        <span className={`text-sm hidden md:block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          18 Aprel 2026, Juma
        </span>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
            darkMode ? "bg-[#1C2333] text-yellow-400 hover:bg-[#252D3D]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <i className={`${darkMode ? "ri-sun-line" : "ri-moon-line"} text-base`}></i>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer relative ${
              darkMode ? "bg-[#1C2333] text-gray-300 hover:bg-[#252D3D]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <i className="ri-notification-3-line text-base"></i>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotif && (
            <div className={`absolute right-0 top-12 w-80 rounded-xl shadow-lg border z-50 ${
              darkMode ? "bg-[#161B27] border-[#1C2333]" : "bg-white border-gray-100"
            }`}>
              <div className={`px-4 py-3 border-b flex items-center justify-between ${darkMode ? "border-[#1C2333]" : "border-gray-100"}`}>
                <span className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Bildirishnomalar</span>
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">3</span>
              </div>
              <div className="py-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 flex gap-3 cursor-pointer transition-colors ${
                      darkMode ? "hover:bg-[#1C2333]" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${
                      n.type === 'critical' ? 'bg-red-100' : 'bg-violet-100'
                    }`}>
                      <i className={`text-sm ${n.type === 'critical' ? 'ri-alarm-warning-line text-red-500' : 'ri-information-line text-violet-500'}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{n.text}</p>
                      <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <button
          onClick={() => navigate("/doctor/profile")}
          className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer hover:bg-violet-700 transition-colors"
        >
          <span className="text-white text-xs font-bold">AK</span>
        </button>
      </div>
    </header>
  );
}
