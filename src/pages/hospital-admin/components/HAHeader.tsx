import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useModalA11y } from "@/hooks/useModalA11y";
import { getModShortcut } from "@/utils/modShortcut";

interface HAHeaderProps {
  title: string;
  darkMode: boolean;
  onToggleDark: () => void;
  sidebarCollapsed: boolean;
  onToggleMobile: () => void;
  notificationCount?: number;
}

type SearchHit = {
  id: string;
  label: string;
  hint?: string;
  to: string;
  icon: string;
};

const MODAL_INERT_SELECTORS = ["header", "main", "aside"];

function normalize(s: string) {
  return s.toLowerCase().trim();
}

export default function HAHeader({ title, darkMode, onToggleDark, sidebarCollapsed, onToggleMobile, notificationCount }: HAHeaderProps) {
  const { t, i18n } = useTranslation("hospital");
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const notifTriggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const previousNotificationsOpenRef = useRef(false);
  const modShortcut = useMemo(() => getModShortcut(), []);

  const notifPopoverRef = useModalA11y({
    isOpen: showNotifications,
    onClose: () => setShowNotifications(false),
    triggerRef: notifTriggerRef,
    isolateBackground: false,
    trapFocus: false,
    lockScroll: false,
  });

  const notifications = [
    { id: 1, text: t("header.notifications.newPatient"), time: t("header.notifications.fiveMin"), type: "info", to: "/hospital-admin/patients" },
    { id: 2, text: t("header.notifications.doctorDone"), time: t("header.notifications.thirtyMin"), type: "success", to: "/hospital-admin/doctors" },
    { id: 3, text: t("header.notifications.queueError"), time: t("header.notifications.twoHours"), type: "warning", to: "/hospital-admin/patients?tab=queue" },
  ];
  const unreadCount = notificationCount ?? notifications.length;

  const allHits = useMemo((): SearchHit[] => {
    return [
      { id: "dashboard", label: t("sidebar.dashboard"), hint: "/hospital-admin", to: "/hospital-admin", icon: "ri-dashboard-line" },
      { id: "doctors", label: t("sidebar.doctors"), hint: "/hospital-admin/doctors", to: "/hospital-admin/doctors", icon: "ri-stethoscope-line" },
      { id: "patients", label: t("sidebar.patients"), hint: "/hospital-admin/patients", to: "/hospital-admin/patients", icon: "ri-user-heart-line" },
      { id: "analytics", label: t("sidebar.analytics"), hint: "/hospital-admin/analytics", to: "/hospital-admin/analytics", icon: "ri-bar-chart-2-line" },
      { id: "notifications", label: t("sidebar.notifications"), hint: "/hospital-admin/notifications", to: "/hospital-admin/notifications", icon: "ri-notification-3-line" },
      { id: "settings", label: t("sidebar.settings"), hint: "/hospital-admin/settings", to: "/hospital-admin/settings", icon: "ri-settings-3-line" },
    ];
  }, [t]);

  const filteredHits = useMemo(() => {
    const q = normalize(searchQuery);
    if (!q) return allHits;
    return allHits.filter((h) => {
      const pool = [h.label, h.hint, h.to].filter(Boolean).join(" ");
      return normalize(pool).includes(q);
    });
  }, [allHits, searchQuery]);

  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery, searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const tid = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(tid);
  }, [searchOpen]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  const searchDialogRef = useModalA11y({
    isOpen: searchOpen,
    onClose: closeSearch,
    returnFocusRef: searchTriggerRef,
    initialFocusRef: searchInputRef,
    inertSelectors: MODAL_INERT_SELECTORS,
  });

  const goHit = useCallback(
    (hit: SearchHit) => {
      navigate(hit.to);
      closeSearch();
    },
    [navigate, closeSearch],
  );

  const openSearch = useCallback(() => {
    setSearchQuery("");
    setSearchOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) {
        e.preventDefault();
        closeSearch();
        return;
      }
      const isK = e.key?.toLowerCase() === "k" || e.code === "KeyK";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setSearchOpen((o) => {
          if (o) {
            setSearchQuery("");
            return false;
          }
          setSearchQuery("");
          return true;
        });
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [searchOpen, closeSearch]);

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

  const onSearchKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(0, filteredHits.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filteredHits.length > 0) {
      e.preventDefault();
      const hit = filteredHits[activeIndex] ?? filteredHits[0];
      if (hit) goHit(hit);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 h-16 z-20 flex items-center px-4 md:px-6 transition-[left] duration-300 ease-out ${
          sidebarCollapsed ? "left-0 md:left-16" : "left-0 md:left-64"
        } ${darkMode ? "bg-[#0F1117] border-b border-[#1E2130]" : "bg-white border-b border-gray-100"}`}
      >
        <button
          type="button"
          onClick={onToggleMobile}
          className={`mr-2 shrink-0 md:hidden h-11 w-11 flex items-center justify-center rounded-lg transition-colors ${
            darkMode ? "bg-[#1A2235] text-gray-300 hover:bg-[#1E2A3A]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          aria-label={t("header.actions.openSidebar")}
        >
          <i className="ri-menu-line text-base" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className={`truncate text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h1>
          <p className={`truncate text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {new Date().toLocaleDateString(i18n.language === "ru" ? "ru-RU" : "uz-UZ", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <button
            ref={searchTriggerRef}
            type="button"
            onClick={openSearch}
            className={`hidden shrink-0 lg:flex h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm transition-colors ${
              darkMode ? "bg-[#1A2235] text-gray-400 hover:bg-[#1E2A3A]" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
            }`}
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            aria-controls="ha-global-search-dialog"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
              <i className="ri-search-line text-sm" />
            </span>
            <span className="text-xs">{t("header.search.trigger")}</span>
            <kbd
              className={`rounded px-1.5 py-0.5 font-sans text-xs ${darkMode ? "bg-[#0F1117] text-gray-500" : "bg-white text-gray-400"}`}
            >
              {modShortcut}
            </kbd>
          </button>
          <button
            type="button"
            onClick={openSearch}
            className={`hidden h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors md:flex lg:hidden ${
              darkMode ? "bg-[#1A2235] text-gray-400 hover:bg-[#1E2A3A]" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
            aria-label={t("header.search.global")}
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            aria-controls="ha-global-search-dialog"
          >
            <i className="ri-search-line text-base" />
          </button>

          <button
            type="button"
            onClick={onToggleDark}
            aria-label={darkMode ? t("header.actions.switchToLight") : t("header.actions.switchToDark")}
            className={`h-11 w-11 shrink-0 flex cursor-pointer items-center justify-center rounded-lg transition-colors ${
              darkMode ? "bg-[#1A2235] text-yellow-400 hover:bg-[#1E2A3A]" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <i className={`${darkMode ? "ri-sun-line" : "ri-moon-line"} text-base`} aria-hidden />
          </button>

          <div className="relative shrink-0">
            <button
              type="button"
              ref={notifTriggerRef}
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={showNotifications ? t("header.actions.hideNotifications") : t("header.actions.showNotifications")}
              aria-expanded={showNotifications}
              aria-controls="ha-notification-popover"
              aria-haspopup="true"
              className={`relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                darkMode ? "bg-[#1A2235] text-gray-400 hover:bg-[#1E2A3A]" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <div className="flex h-5 w-5 items-center justify-center">
                <i className="ri-notification-3-line text-base" aria-hidden="true" />
              </div>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
              <span className="sr-only">{unreadCount} new notifications</span>
            </button>

            {showNotifications && (
              <div
                ref={notifPopoverRef}
                id="ha-notification-popover"
                role="region"
                aria-label="Bildirishnomalar"
                tabIndex={-1}
                className={`absolute right-0 top-11 z-50 w-80 rounded-xl border ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}
              >
                <div className={`flex items-center justify-between border-b px-4 py-3 ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
                  <p id="ha-notifications-title" className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {t("header.notifications.title")}
                  </p>
                  <button
                    type="button"
                    aria-label={t("header.actions.closeNotifications")}
                    onClick={() => setShowNotifications(false)}
                    className="-mr-1 flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-md"
                  >
                    <i className={`ri-close-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`} aria-hidden />
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
                      className={`w-full cursor-pointer px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 ${
                        darkMode ? "hover:bg-[#1A2235]" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                            n.type === "warning" ? "bg-yellow-400" : n.type === "success" ? "bg-teal-400" : "bg-blue-400"
                          }`}
                        />
                        <div>
                          <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{n.text}</p>
                          <span className="sr-only">
                            {n.type === "warning" ? "Ogohlantirish" : n.type === "success" ? "Muvaffaqiyat" : "Ma'lumot"}
                          </span>
                          <p className={`mt-0.5 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{n.time}</p>
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

      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]" role="presentation">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/50"
            aria-label={t("header.search.close")}
            onClick={closeSearch}
          />
          <div
            ref={searchDialogRef}
            id="ha-global-search-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ha-global-search-title"
            tabIndex={-1}
            className={`relative w-full max-w-lg overflow-hidden rounded-xl border shadow-2xl ${
              darkMode ? "border-[#1E2130] bg-[#141824]" : "border-gray-200 bg-white"
            }`}
          >
            <div className={`flex items-center gap-2 border-b px-3 ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
              <i className={`ri-search-line shrink-0 text-lg ${darkMode ? "text-gray-500" : "text-gray-400"}`} aria-hidden />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder={t("header.search.placeholder")}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className={`min-w-0 flex-1 bg-transparent py-3 text-sm outline-none ${
                  darkMode ? "text-white placeholder:text-gray-500" : "text-gray-900 placeholder:text-gray-400"
                }`}
              />
              <button
                type="button"
                onClick={closeSearch}
                className={`shrink-0 rounded px-2 py-1 text-xs ${darkMode ? "text-gray-500 hover:bg-[#1A2235]" : "text-gray-400 hover:bg-gray-100"}`}
              >
                Esc
              </button>
            </div>
            <p id="ha-global-search-title" className="sr-only">
              {t("header.search.global")}
            </p>
            <ul
              className={`max-h-[min(50vh,320px)] overflow-y-auto py-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}
              role="listbox"
              aria-label={t("header.search.results")}
            >
              {filteredHits.length === 0 ? (
                <li className={`px-4 py-6 text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("header.search.notFound")}</li>
              ) : (
                filteredHits.map((hit, i) => (
                  <li key={hit.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === activeIndex}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => goHit(hit)}
                      className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                        i === activeIndex
                          ? darkMode
                            ? "bg-[#1A2235]"
                            : "bg-teal-50"
                          : darkMode
                            ? "hover:bg-[#1A2235]/80"
                            : "hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${
                          darkMode ? "bg-teal-500/15 text-teal-400" : "bg-teal-50 text-teal-600"
                        }`}
                      >
                        <i className={hit.icon} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{hit.label}</span>
                        {hit.hint ? (
                          <span className={`mt-0.5 block text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>{hit.hint}</span>
                        ) : null}
                      </span>
                      <span className={`mt-0.5 shrink-0 text-xs ${darkMode ? "text-gray-600" : "text-gray-400"}`}>{t("header.search.page")}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className={`border-t px-4 py-2 text-xs ${darkMode ? "border-[#1E2130] text-gray-500" : "border-gray-100 text-gray-400"}`}>
              <span className="hidden sm:inline">{t("header.search.help")}</span>
              <span className="sm:ml-1">
                {modShortcut} · Esc
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
