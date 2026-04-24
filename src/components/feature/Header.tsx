import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useModalA11y } from "@/hooks/useModalA11y";
import { useHospitals } from "@/hooks/useHospitals";

interface HeaderProps {
  title: string;
  darkMode: boolean;
  onToggleDark: () => void;
  sidebarCollapsed: boolean;
  onToggleMobile: () => void;
}

type SearchHit = {
  id: string;
  kind: "page" | "hospital";
  label: string;
  hint?: string;
  to: string;
};

const MODAL_INERT_SELECTORS = ["header", "main", "aside"];

function normalize(s: string) {
  return s.toLowerCase().trim();
}

export default function Header({ title, darkMode, onToggleDark, sidebarCollapsed, onToggleMobile }: HeaderProps) {
  const { t, i18n } = useTranslation("admin");
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const { hospitals } = useHospitals();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const notificationsTriggerRef = useRef<HTMLButtonElement>(null);
  const previousNotificationsOpenRef = useRef(false);

  const modShortcut = useMemo(() => {
    if (typeof navigator === "undefined") return "Ctrl+K";
    return /Mac|iPhone|iPod|iPad/i.test(navigator.platform ?? "") ? "⌘K" : "Ctrl+K";
  }, []);

  const headerDateLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString(i18n.language === "ru" ? "ru-RU" : "uz-UZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [i18n.language]);

  const hospitalHits = useMemo(
    (): SearchHit[] =>
      hospitals.map((h) => ({
        id: `h-${h.id}`,
        kind: "hospital",
        label: h.name,
        hint: h.viloyat,
        to: `/hospitals/${h.id}`,
      })),
    [hospitals],
  );

  const allHits = useMemo((): SearchHit[] => {
    const pages: SearchHit[] = [
      { id: "page-dashboard", kind: "page" as const, label: t("admin:header.pages.dashboard"), hint: t("admin:header.pages.home"), to: "/dashboard" },
      { id: "page-hospitals", kind: "page" as const, label: t("admin:header.pages.hospitals"), hint: t("admin:header.pages.list"), to: "/hospitals" },
      { id: "page-analytics", kind: "page" as const, label: t("admin:header.pages.analytics"), to: "/analytics" },
      { id: "page-users", kind: "page" as const, label: t("admin:header.pages.users"), to: "/users" },
      { id: "page-audit-logs", kind: "page" as const, label: t("admin:header.pages.auditLogs"), to: "/audit-logs" },
      { id: "page-settings", kind: "page" as const, label: t("admin:header.pages.settings"), to: "/settings" },
    ];
    return [...pages, ...hospitalHits];
  }, [t, hospitalHits]);

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
    const t = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
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
  const notificationsPanelRef = useModalA11y({
    isOpen: showNotifications,
    onClose: () => setShowNotifications(false),
    returnFocusRef: notificationsTriggerRef,
    isolateBackground: false,
    trapFocus: false,
    lockScroll: false,
  });

  const goHit = useCallback(
    (hit: SearchHit) => {
      navigate(hit.to);
      closeSearch();
    },
    [navigate, closeSearch],
  );

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) {
        e.preventDefault();
        closeSearch();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
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
    if (!showNotifications) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (notificationsPanelRef.current?.contains(target)) return;
      if (notificationsTriggerRef.current?.contains(target)) return;
      setShowNotifications(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showNotifications, notificationsPanelRef]);

  useEffect(() => {
    const handleEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && showNotifications) {
        setShowNotifications(false);
        notificationsTriggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showNotifications]);

  useEffect(() => {
    if (previousNotificationsOpenRef.current && !showNotifications) {
      notificationsTriggerRef.current?.focus();
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

  const notifications = [
    { id: 1, text: t("admin:header.notifications.items.deactivated"), time: t("admin:header.notifications.times.fiveMin"), type: "warning", to: "/users" },
    { id: 2, text: t("admin:header.notifications.items.newDoctor"), time: t("admin:header.notifications.times.oneHour"), type: "info", to: "/hospitals" },
    { id: 3, text: t("admin:header.notifications.items.monthlyReport"), time: t("admin:header.notifications.times.threeHour"), type: "success", to: "/analytics" },
  ];

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
        className={`mr-2 md:hidden w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${
          darkMode ? "bg-[#1A2235] text-gray-300 hover:bg-[#1E2A3A]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
        aria-label={t("admin:header.actions.openSidebar")}
      >
        <i className="ri-menu-line text-base" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className={`truncate text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h1>
        <p className={`truncate text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          {headerDateLabel}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {/* Search — global command palette */}
        <button
          ref={searchTriggerRef}
          type="button"
          onClick={() => {
            setSearchQuery("");
            setSearchOpen(true);
          }}
          className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
            darkMode ? "bg-[#1A2235] text-gray-400 hover:bg-[#1E2A3A]" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
          }`}
          aria-haspopup="dialog"
          aria-expanded={searchOpen}
          aria-controls="global-search-dialog"
        >
          <span className="w-4 h-4 flex items-center justify-center" aria-hidden>
            <i className="ri-search-line text-sm"></i>
          </span>
          <span className="text-xs">{t("admin:header.search.trigger")}</span>
          <kbd
            className={`text-xs px-1.5 py-0.5 rounded font-sans ${darkMode ? "bg-[#0F1117] text-gray-500" : "bg-white text-gray-400"}`}
          >
            {modShortcut}
          </kbd>
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setSearchOpen(true);
          }}
          className={`hidden md:flex lg:hidden w-11 h-11 items-center justify-center rounded-lg transition-colors ${
            darkMode ? "bg-[#1A2235] text-gray-400 hover:bg-[#1E2A3A]" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
          aria-label={t("admin:header.search.global")}
          aria-haspopup="dialog"
          aria-expanded={searchOpen}
          aria-controls="global-search-dialog"
        >
          <i className="ri-search-line text-base" />
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          aria-label={darkMode ? t("admin:header.actions.switchToLight") : t("admin:header.actions.switchToDark")}
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
            ref={notificationsTriggerRef}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={showNotifications ? t("admin:header.actions.hideNotifications") : t("admin:header.actions.showNotifications")}
            aria-expanded={showNotifications}
            aria-controls="admin-notification-popover"
            aria-haspopup="true"
            className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors cursor-pointer relative ${
              darkMode ? "bg-[#1A2235] text-gray-400 hover:bg-[#1E2A3A]" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-notification-3-line text-base" aria-hidden="true"></i>
            </div>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div
              ref={notificationsPanelRef}
              id="admin-notification-popover"
              role="region"
              aria-label="Bildirishnomalar"
              tabIndex={-1}
              className={`absolute right-0 top-11 w-80 rounded-xl shadow-lg border z-50 ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}
            >
              <div className={`px-4 py-3 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
                <p id="header-notifications-title" className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{t("admin:header.notifications.title")}</p>
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
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "warning" ? "bg-yellow-400" : n.type === "success" ? "bg-emerald-400" : "bg-blue-400"}`}></div>
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

    {searchOpen && (
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4" role="presentation">
        <button
          type="button"
          className="absolute inset-0 bg-black/50 cursor-default"
          aria-label={t("admin:header.search.close")}
          onClick={closeSearch}
        />
        <div
          ref={searchDialogRef}
          id="global-search-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="global-search-title"
          tabIndex={-1}
          className={`relative w-full max-w-lg rounded-xl shadow-2xl border overflow-hidden ${
            darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-200"
          }`}
        >
          <div className={`flex items-center gap-2 px-3 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
            <i className={`ri-search-line text-lg shrink-0 ${darkMode ? "text-gray-500" : "text-gray-400"}`} aria-hidden />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder={t("admin:header.search.placeholder")}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className={`flex-1 min-w-0 py-3 bg-transparent text-sm outline-none ${
                darkMode ? "text-white placeholder:text-gray-500" : "text-gray-900 placeholder:text-gray-400"
              }`}
            />
            <button
              type="button"
              onClick={closeSearch}
              className={`shrink-0 px-2 py-1 rounded text-xs ${darkMode ? "text-gray-500 hover:bg-[#1A2235]" : "text-gray-400 hover:bg-gray-100"}`}
            >
              Esc
            </button>
          </div>
          <p id="global-search-title" className="sr-only">
            {t("admin:header.search.global")}
          </p>
          <ul
            className={`max-h-[min(50vh,320px)] overflow-y-auto py-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}
            role="listbox"
            aria-label={t("admin:header.search.results")}
          >
            {filteredHits.length === 0 ? (
              <li className={`px-4 py-6 text-sm text-center ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                {t("admin:header.search.notFound")}
              </li>
            ) : (
              filteredHits.map((hit, i) => (
                <li key={hit.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => goHit(hit)}
                    className={`w-full text-left px-4 py-2.5 flex items-start gap-3 transition-colors ${
                      i === activeIndex
                        ? darkMode
                          ? "bg-[#1A2235]"
                          : "bg-emerald-50"
                        : darkMode
                          ? "hover:bg-[#1A2235]/80"
                          : "hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
                        hit.kind === "page"
                          ? darkMode
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-blue-50 text-blue-600"
                          : darkMode
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      <i className={hit.kind === "page" ? "ri-layout-grid-line" : "ri-hospital-line"} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{hit.label}</span>
                      {hit.hint ? (
                        <span className={`block text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>{hit.hint}</span>
                      ) : null}
                    </span>
                    <span className={`text-xs shrink-0 mt-0.5 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                      {hit.kind === "page" ? t("admin:header.search.page") : t("admin:header.search.hospital")}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className={`px-4 py-2 text-xs border-t ${darkMode ? "border-[#1E2130] text-gray-500" : "border-gray-100 text-gray-400"}`}>
            <span className="hidden sm:inline">{t("admin:header.search.help")}</span>
            {modShortcut} yoki Esc
          </div>
        </div>
      </div>
    )}
    </>
  );
}
