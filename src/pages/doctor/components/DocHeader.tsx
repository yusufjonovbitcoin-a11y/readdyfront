import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { getCurrentDoctorSession } from "@/api/services/doctorSession.service";
import { useModalA11y } from "@/hooks/useModalA11y";
import { useAuth } from "@/hooks/useAuth";
import { getModShortcut } from "@/utils/modShortcut";

interface DocHeaderProps {
  title: string;
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

export default function DocHeader({ title, sidebarCollapsed, onToggleMobile, notificationCount }: DocHeaderProps) {
  const { t, i18n } = useTranslation("doctor");
  const [showNotif, setShowNotif] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const notifTriggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const previousNotificationsOpenRef = useRef(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useDoctorTheme();
  const modShortcut = useMemo(() => getModShortcut(), []);

  const notifPopoverRef = useModalA11y({
    isOpen: showNotif,
    onClose: () => setShowNotif(false),
    triggerRef: notifTriggerRef,
    isolateBackground: false,
    trapFocus: false,
    lockScroll: false,
  });
  const currentDoctorSession = getCurrentDoctorSession();
  const profileName = currentDoctorSession?.name ?? user?.name ?? "Doctor";
  const profileAvatar = currentDoctorSession?.avatar ?? user?.avatar ?? "";
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

  const allHits = useMemo((): SearchHit[] => {
    return [
      { id: "patients", label: t("sidebar.newPatients"), hint: "/doctor/patients", to: "/doctor/patients", icon: "ri-user-add-line" },
      { id: "history", label: t("sidebar.history"), hint: "/doctor/history", to: "/doctor/history", icon: "ri-history-line" },
      { id: "analytics", label: t("sidebar.analytics"), hint: "/doctor/analytics", to: "/doctor/analytics", icon: "ri-bar-chart-2-line" },
      { id: "questions", label: t("sidebar.questions"), hint: "/doctor/questions", to: "/doctor/questions", icon: "ri-questionnaire-line" },
      { id: "notifications", label: t("sidebar.notifications"), hint: "/doctor/notifications", to: "/doctor/notifications", icon: "ri-notification-3-line" },
      { id: "settings", label: t("sidebar.settings"), hint: "/doctor/settings", to: "/doctor/settings", icon: "ri-settings-3-line" },
      { id: "profile", label: t("profile.title"), hint: "/doctor/profile", to: "/doctor/profile", icon: "ri-user-line" },
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
        className={`fixed top-0 right-0 z-20 h-16 flex min-w-0 items-center px-4 md:px-6 transition-[left] duration-300 ease-out ${
          sidebarCollapsed ? "left-0 md:left-16" : "left-0 md:left-64"
        } ${darkMode ? "bg-[#0D1117] border-b border-[#1C2333]" : "bg-white border-b border-gray-100"}`}
      >
        <button
          type="button"
          onClick={onToggleMobile}
          className={`mr-2 shrink-0 md:hidden h-11 w-11 flex items-center justify-center rounded-lg transition-colors ${
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
          <span className={`hidden max-w-[240px] shrink-0 truncate text-sm lg:block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {new Date().toLocaleDateString(i18n.language === "ru" ? "ru-RU" : "uz-UZ", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              weekday: "long",
            })}
          </span>

          <button
            ref={searchTriggerRef}
            type="button"
            onClick={openSearch}
            className={`hidden h-11 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm transition-colors lg:flex ${
              darkMode ? "bg-[#1C2333] text-gray-400 hover:bg-[#252D3D]" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            aria-controls="doctor-global-search-dialog"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
              <i className="ri-search-line text-sm" />
            </span>
            <span className="text-xs">{t("header.search.trigger")}</span>
            <kbd
              className={`rounded px-1.5 py-0.5 font-sans text-[10px] leading-none ${
                darkMode ? "bg-[#0D1117] text-gray-500" : "bg-white text-gray-400"
              }`}
            >
              {modShortcut}
            </kbd>
          </button>
          <button
            type="button"
            onClick={openSearch}
            className={`hidden md:flex lg:hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors ${
              darkMode ? "bg-[#1C2333] text-gray-300 hover:bg-[#252D3D]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            aria-label={t("header.search.global")}
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            aria-controls="doctor-global-search-dialog"
          >
            <i className="ri-search-line text-base" />
          </button>

          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={darkMode ? t("header.actions.switchToLight") : t("header.actions.switchToDark")}
            className={`h-11 w-11 shrink-0 flex cursor-pointer items-center justify-center rounded-lg transition-colors ${
              darkMode ? "bg-[#1C2333] text-yellow-400 hover:bg-[#252D3D]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <i className={`${darkMode ? "ri-sun-line" : "ri-moon-line"} text-base`} aria-hidden />
          </button>

          <div className="relative shrink-0">
            <button
              type="button"
              ref={notifTriggerRef}
              onClick={() => setShowNotif(!showNotif)}
              aria-label={showNotif ? t("header.actions.hideNotifications") : t("header.actions.showNotifications")}
              aria-expanded={showNotif}
              aria-controls="doctor-notification-popover"
              aria-haspopup="true"
              className={`relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                darkMode ? "bg-[#1C2333] text-gray-300 hover:bg-[#252D3D]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <i className="ri-notification-3-line text-base" aria-hidden="true"></i>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
              <span className="sr-only">{unreadCount} new notifications</span>
            </button>

            {showNotif && (
              <div
                ref={notifPopoverRef}
                id="doctor-notification-popover"
                role="region"
                aria-label="Bildirishnomalar"
                tabIndex={-1}
                className={`absolute right-0 top-12 z-50 w-80 rounded-xl border shadow-lg ${
                  darkMode ? "bg-[#161B27] border-[#1C2333]" : "bg-white border-gray-100"
                }`}
              >
                <div className={`flex items-center justify-between border-b px-4 py-3 ${darkMode ? "border-[#1C2333]" : "border-gray-100"}`}>
                  <span id="doctor-notifications-title" className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {t("header.notifications.title")}
                  </span>
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{unreadCount}</span>
                </div>
                <div className="max-h-64 overflow-y-auto py-2">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        setShowNotif(false);
                        navigate(n.to);
                      }}
                      className={`flex w-full cursor-pointer gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 ${
                        darkMode ? "hover:bg-[#1C2333]" : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                          n.type === "critical" ? "bg-red-100" : "bg-violet-100"
                        }`}
                      >
                        <i
                          className={`text-sm ${n.type === "critical" ? "ri-alarm-warning-line text-red-500" : "ri-information-line text-violet-500"}`}
                          aria-hidden="true"
                        ></i>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{n.text}</p>
                        <span className="sr-only">{n.type === "critical" ? "Kritik ogohlantirish" : "Ma'lumot"}</span>
                        <p className={`mt-1 text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{n.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/doctor/profile")}
            title={profileName}
            aria-label={t("header.actions.openProfile")}
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-violet-600 ring-2 ring-transparent transition-[box-shadow,transform] hover:scale-[1.02] hover:ring-violet-400/50"
          >
            {!avatarFailed && profileAvatar ? (
              <img
                src={profileAvatar}
                alt={profileName}
                width={44}
                height={44}
                className="h-full w-full object-cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <span className="text-xs font-bold text-white">{profileInitials || "DR"}</span>
            )}
          </button>
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
            id="doctor-global-search-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-global-search-title"
            tabIndex={-1}
            className={`relative w-full max-w-lg overflow-hidden rounded-xl border shadow-2xl ${
              darkMode ? "border-[#1C2333] bg-[#161B27]" : "border-gray-200 bg-white"
            }`}
          >
            <div className={`flex items-center gap-2 border-b px-3 ${darkMode ? "border-[#1C2333]" : "border-gray-100"}`}>
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
                className={`shrink-0 rounded px-2 py-1 text-xs ${darkMode ? "text-gray-500 hover:bg-[#1C2333]" : "text-gray-400 hover:bg-gray-100"}`}
              >
                Esc
              </button>
            </div>
            <p id="doctor-global-search-title" className="sr-only">
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
                            ? "bg-[#1C2333]"
                            : "bg-violet-50"
                          : darkMode
                            ? "hover:bg-[#1C2333]/80"
                            : "hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${
                          darkMode ? "bg-violet-500/15 text-violet-400" : "bg-violet-50 text-violet-600"
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
            <div className={`border-t px-4 py-2 text-xs ${darkMode ? "border-[#1C2333] text-gray-500" : "border-gray-100 text-gray-400"}`}>
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
