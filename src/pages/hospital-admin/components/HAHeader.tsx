import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useModalA11y } from "@/hooks/useModalA11y";

interface HAHeaderProps {
  title: string;
  darkMode: boolean;
  onToggleDark: () => void;
  sidebarCollapsed: boolean;
  onToggleMobile: () => void;
  notificationCount?: number;
}

export default function HAHeader({ title, darkMode, onToggleDark, sidebarCollapsed, onToggleMobile, notificationCount }: HAHeaderProps) {
  const { t, i18n } = useTranslation("hospital");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifTriggerRef = useRef<HTMLButtonElement>(null);
  const previousNotificationsOpenRef = useRef(false);
  const [headerQuery, setHeaderQuery] = useState(() => searchParams.get("q") ?? "");
  const notifPopoverRef = useModalA11y({
    isOpen: showNotifications,
    onClose: () => setShowNotifications(false),
    triggerRef: notifTriggerRef,
    isolateBackground: false,
    trapFocus: false,
    lockScroll: false,
  });

  useEffect(() => {
    setHeaderQuery(searchParams.get("q") ?? "");
  }, [location.pathname, searchParams]);

  const notifications = [
    { id: 1, text: t("header.notifications.newPatient"), time: t("header.notifications.fiveMin"), type: "info", to: "/hospital-admin/patients" },
    { id: 2, text: t("header.notifications.doctorDone"), time: t("header.notifications.thirtyMin"), type: "success", to: "/hospital-admin/doctors" },
    { id: 3, text: t("header.notifications.queueError"), time: t("header.notifications.twoHours"), type: "warning", to: "/hospital-admin/patients?tab=queue" },
  ];
  const unreadCount = notificationCount ?? notifications.length;

  const navigateWithHeaderQuery = () => {
    const q = headerQuery.trim();
    const path = location.pathname.startsWith("/hospital-admin/doctors")
      ? "/hospital-admin/doctors"
      : "/hospital-admin/patients";
    navigate(q ? { pathname: path, search: `?${new URLSearchParams({ q }).toString()}` } : { pathname: path });
  };
  const runGlobalSearch = (e: FormEvent) => {
    e.preventDefault();
    navigateWithHeaderQuery();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showNotifications) {
        setShowNotifications(false);
        notifTriggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showNotifications]);

  useEffect(() => {
    if (previousNotificationsOpenRef.current && !showNotifications) {
      notifTriggerRef.current?.focus();
    }
    previousNotificationsOpenRef.current = showNotifications;
  }, [showNotifications]);

  return (
    <header
      className={`fixed top-0 right-0 h-16 z-20 flex items-center px-4 md:px-6 transition-[left] duration-300 ease-out ${
        sidebarCollapsed ? "left-0 md:left-16" : "left-0 md:left-64"
      } ${darkMode ? "bg-[#0F1117] border-b border-[#1E2130]" : "bg-white border-b border-gray-100"}`}
    >
      <button
        type="button"
        onClick={onToggleMobile}
        className={`mr-2 md:hidden w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${
          darkMode ? "bg-[#1A2235] text-gray-300 hover:bg-[#1E2A3A]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
        aria-label={t("header.actions.openSidebar")}
      >
        <i className="ri-menu-line text-base" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className={`truncate text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h1>
        <p className={`truncate text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          {new Date().toLocaleDateString(i18n.language === "ru" ? "ru-RU" : "uz-UZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {/* Search */}
        <form
          onSubmit={runGlobalSearch}
          className={`hidden lg:flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm min-w-[140px] max-w-[220px] ${darkMode ? "bg-[#1A2235]" : "bg-gray-50"}`}
        >
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-gray-400">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input
            type="search"
            name="q"
            value={headerQuery}
            onChange={(e) => setHeaderQuery(e.target.value)}
            placeholder={t("header.searchPlaceholder")}
            autoComplete="off"
            aria-label={t("header.globalSearch")}
            className={`min-w-0 flex-1 bg-transparent text-xs outline-none border-0 p-0 ${
              darkMode ? "text-gray-200 placeholder:text-gray-500" : "text-gray-800 placeholder:text-gray-400"
            }`}
          />
        </form>
        <button
          type="button"
          onClick={navigateWithHeaderQuery}
          className={`hidden md:flex lg:hidden w-11 h-11 items-center justify-center rounded-lg transition-colors ${
            darkMode ? "bg-[#1A2235] text-gray-400 hover:bg-[#1E2A3A]" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
          aria-label={t("header.globalSearch")}
        >
          <i className="ri-search-line text-base" />
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          aria-label={darkMode ? t("header.actions.switchToLight") : t("header.actions.switchToDark")}
          className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
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
            ref={notifTriggerRef}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={showNotifications ? t("header.actions.hideNotifications") : t("header.actions.showNotifications")}
            aria-expanded={showNotifications}
            aria-controls="ha-notification-popover"
            aria-haspopup="true"
            className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors cursor-pointer relative ${
              darkMode ? "bg-[#1A2235] text-gray-400 hover:bg-[#1E2A3A]" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-notification-3-line text-base" aria-hidden="true"></i>
            </div>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="sr-only">{unreadCount} new notifications</span>
          </button>

          {showNotifications && (
            <div
              ref={notifPopoverRef}
              id="ha-notification-popover"
              role="region"
              aria-label="Bildirishnomalar"
              tabIndex={-1}
              className={`absolute right-0 top-11 w-80 rounded-xl border z-50 ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}
              style={{boxShadow: '0 4px 24px rgba(0,0,0,0.18)'}}
            >
              <div className={`px-4 py-3 border-b flex items-center justify-between ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
                <p id="ha-notifications-title" className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{t("header.notifications.title")}</p>
                <button aria-label={t("header.actions.closeNotifications")} onClick={() => setShowNotifications(false)} className="min-w-[44px] min-h-[44px] -mr-1 flex items-center justify-center rounded-md cursor-pointer">
                  <i className={`ri-close-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`} aria-hidden="true"></i>
                </button>
              </div>
              <div className="py-2">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate(n.to);
                    }}
                    className={`w-full px-4 py-3 text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${darkMode ? "hover:bg-[#1A2235]" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "warning" ? "bg-yellow-400" : n.type === "success" ? "bg-teal-400" : "bg-blue-400"}`}></div>
                      <div>
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{n.text}</p>
                        <span className="sr-only">
                          {n.type === "warning" ? "Ogohlantirish" : n.type === "success" ? "Muvaffaqiyat" : "Ma'lumot"}
                        </span>
                        <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{n.time}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
