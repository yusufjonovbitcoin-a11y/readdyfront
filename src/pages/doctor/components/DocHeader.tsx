import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { getCurrentDoctorSession } from "@/api/services/doctorSession.service";
import { useModalA11y } from "@/hooks/useModalA11y";

interface DocHeaderProps {
  title: string;
  sidebarCollapsed: boolean;
  onToggleMobile: () => void;
  notificationCount?: number;
}

export default function DocHeader({ title, sidebarCollapsed, onToggleMobile, notificationCount }: DocHeaderProps) {
  const { t, i18n } = useTranslation("doctor");
  const [showNotif, setShowNotif] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const notifTriggerRef = useRef<HTMLButtonElement>(null);
  const previousNotificationsOpenRef = useRef(false);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDoctorTheme();
  const notifPopoverRef = useModalA11y({
    isOpen: showNotif,
    onClose: () => setShowNotif(false),
    triggerRef: notifTriggerRef,
    isolateBackground: false,
    trapFocus: false,
    lockScroll: false,
  });
  const currentDoctorSession = getCurrentDoctorSession();
  const profileName = currentDoctorSession?.name ?? "Doctor";
  const profileAvatar = currentDoctorSession?.avatar ?? "";
  const profileInitials = profileName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const notifications = [
    { id: 1, text: t("header.notifications.newPatient"), time: t("header.notifications.twoMin"), type: "info", to: "/doctor/patients?tab=in_progress" },
    { id: 2, text: t("header.notifications.critical"), time: t("header.notifications.fifteenMin"), type: "critical", to: "/doctor/patients?tab=in_progress" },
    { id: 3, text: t("header.notifications.todayQueue"), time: t("header.notifications.oneHour"), type: "info", to: "/doctor/patients?tab=completed" },
  ];
  const unreadCount = notificationCount ?? notifications.length;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showNotif) {
        setShowNotif(false);
        notifTriggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showNotif]);

  useEffect(() => {
    if (previousNotificationsOpenRef.current && !showNotif) {
      notifTriggerRef.current?.focus();
    }
    previousNotificationsOpenRef.current = showNotif;
  }, [showNotif]);

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 flex min-w-0 items-center px-6 transition-[left] duration-300 ease-out ${
        sidebarCollapsed ? "left-0 md:left-16" : "left-0 md:left-64"
      } ${darkMode ? "bg-[#0D1117] border-b border-[#1C2333]" : "bg-white border-b border-gray-100"}`}
    >
      <button
        type="button"
        onClick={onToggleMobile}
        className={`mr-2 md:hidden w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${
          darkMode ? "bg-[#1C2333] text-gray-300 hover:bg-[#252D3D]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
        aria-label={t("header.actions.openSidebar")}
      >
        <i className="ri-menu-line text-base" />
      </button>
      <div className="min-w-0 flex flex-1 items-center gap-2 pr-2">
        <h1 className={`truncate text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {/* Date */}
        <span className={`text-sm hidden lg:block max-w-[240px] truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {new Date().toLocaleDateString(i18n.language === "ru" ? "ru-RU" : "uz-UZ", { day: "2-digit", month: "long", year: "numeric", weekday: "long" })}
        </span>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          aria-label={darkMode ? t("header.actions.switchToLight") : t("header.actions.switchToDark")}
          className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
            darkMode ? "bg-[#1C2333] text-yellow-400 hover:bg-[#252D3D]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <i className={`${darkMode ? "ri-sun-line" : "ri-moon-line"} text-base`}></i>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            ref={notifTriggerRef}
            onClick={() => setShowNotif(!showNotif)}
            aria-label={showNotif ? t("header.actions.hideNotifications") : t("header.actions.showNotifications")}
            aria-expanded={showNotif}
            aria-controls="doctor-notification-popover"
            aria-haspopup="true"
            className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors cursor-pointer relative ${
              darkMode ? "bg-[#1C2333] text-gray-300 hover:bg-[#252D3D]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <i className="ri-notification-3-line text-base" aria-hidden="true"></i>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="sr-only">{unreadCount} new notifications</span>
          </button>

          {showNotif && (
            <div
              ref={notifPopoverRef}
              id="doctor-notification-popover"
              role="region"
              aria-label="Bildirishnomalar"
              tabIndex={-1}
              className={`absolute right-0 top-12 w-80 rounded-xl shadow-lg border z-50 ${
                darkMode ? "bg-[#161B27] border-[#1C2333]" : "bg-white border-gray-100"
              }`}
            >
              <div className={`px-4 py-3 border-b flex items-center justify-between ${darkMode ? "border-[#1C2333]" : "border-gray-100"}`}>
                <span id="doctor-notifications-title" className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{t("header.notifications.title")}</span>
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
              </div>
              <div className="py-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      setShowNotif(false);
                      navigate(n.to);
                    }}
                    className={`w-full px-4 py-3 flex gap-3 text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 ${
                      darkMode ? "hover:bg-[#1C2333]" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${
                      n.type === 'critical' ? 'bg-red-100' : 'bg-violet-100'
                    }`}>
                      <i className={`text-sm ${n.type === 'critical' ? 'ri-alarm-warning-line text-red-500' : 'ri-information-line text-violet-500'}`} aria-hidden="true"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{n.text}</p>
                      <span className="sr-only">
                        {n.type === "critical" ? "Kritik ogohlantirish" : "Ma'lumot"}
                      </span>
                      <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{n.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <button
          type="button"
          onClick={() => navigate("/doctor/profile")}
          title={profileName}
          aria-label={t("header.actions.openProfile")}
          className="w-11 h-11 shrink-0 overflow-hidden rounded-full bg-violet-600 flex items-center justify-center cursor-pointer ring-2 ring-transparent hover:ring-violet-400/50 transition-[box-shadow,transform] hover:scale-[1.02]"
        >
          {!avatarFailed && profileAvatar ? (
            <img
              src={profileAvatar}
              alt={profileName}
              width={36}
              height={36}
              className="h-full w-full object-cover"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <span className="text-white text-xs font-bold">{profileInitials || "DR"}</span>
          )}
        </button>
      </div>
    </header>
  );
}
