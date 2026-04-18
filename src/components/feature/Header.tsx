import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { mockHospitals } from "@/mocks/hospitals";

interface HeaderProps {
  title: string;
  darkMode: boolean;
  onToggleDark: () => void;
  sidebarCollapsed: boolean;
}

type SearchHit = {
  id: string;
  kind: "page" | "hospital";
  label: string;
  hint?: string;
  to: string;
};

const PAGE_HITS: Omit<SearchHit, "id">[] = [
  { kind: "page", label: "Boshqaruv paneli", hint: "Bosh sahifa", to: "/" },
  { kind: "page", label: "Kasalxonalar", hint: "Ro'yxat", to: "/hospitals" },
  { kind: "page", label: "Tahlil", to: "/analytics" },
  { kind: "page", label: "Foydalanuvchilar", to: "/users" },
  { kind: "page", label: "Audit Logs", to: "/audit-logs" },
  { kind: "page", label: "Sozlamalar", to: "/settings" },
];

function normalize(s: string) {
  return s.toLowerCase().trim();
}

export default function Header({ title, darkMode, onToggleDark, sidebarCollapsed }: HeaderProps) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const modShortcut = useMemo(() => {
    if (typeof navigator === "undefined") return "Ctrl+K";
    return /Mac|iPhone|iPod|iPad/i.test(navigator.platform ?? "") ? "⌘K" : "Ctrl+K";
  }, []);

  const allHits = useMemo((): SearchHit[] => {
    const pages: SearchHit[] = PAGE_HITS.map((p, i) => ({
      ...p,
      id: `page-${i}`,
    }));
    const hospitals: SearchHit[] = mockHospitals.map((h) => ({
      id: `h-${h.id}`,
      kind: "hospital",
      label: h.name,
      hint: h.viloyat,
      to: `/hospitals/${h.id}`,
    }));
    return [...pages, ...hospitals];
  }, []);

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

  useEffect(() => {
    if (!searchOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [searchOpen]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

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
    { id: 1, text: "Buxoro kasalxonasi faolsizlashtirildi", time: "5 daqiqa oldin", type: "warning" },
    { id: 2, text: "Yangi shifokor ro'yxatdan o'tdi", time: "1 soat oldin", type: "info" },
    { id: 3, text: "Toshkent klinikasi oylik hisobotini yubordi", time: "3 soat oldin", type: "success" },
  ];

  return (
    <>
    <header
      className={`fixed top-0 right-0 h-16 z-20 flex items-center px-6 transition-[left] duration-300 ease-out ${
        sidebarCollapsed ? "left-16" : "left-64"
      } ${darkMode ? "bg-[#0F1117] border-b border-[#1E2130]" : "bg-white border-b border-gray-100"}`}
    >
      <div className="flex-1">
        <h1 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</h1>
        <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
          {new Date().toLocaleDateString("uz-UZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search — global command palette */}
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setSearchOpen(true);
          }}
          className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
            darkMode ? "bg-[#1A2235] text-gray-400 hover:bg-[#1E2A3A]" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
          }`}
          aria-haspopup="dialog"
          aria-expanded={searchOpen}
          aria-controls="global-search-dialog"
        >
          <span className="w-4 h-4 flex items-center justify-center" aria-hidden>
            <i className="ri-search-line text-sm"></i>
          </span>
          <span className="text-xs">Qidirish...</span>
          <kbd
            className={`text-xs px-1.5 py-0.5 rounded font-sans ${darkMode ? "bg-[#0F1117] text-gray-500" : "bg-white text-gray-400"}`}
          >
            {modShortcut}
          </kbd>
        </button>

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
            <div className={`absolute right-0 top-11 w-80 rounded-xl shadow-lg border z-50 ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
              <div className={`px-4 py-3 border-b ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
                <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Xabarnomalar</p>
              </div>
              <div className="py-2">
                {notifications.map((n) => (
                  <div key={n.id} className={`px-4 py-3 cursor-pointer transition-colors ${darkMode ? "hover:bg-[#1A2235]" : "hover:bg-gray-50"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "warning" ? "bg-yellow-400" : n.type === "success" ? "bg-emerald-400" : "bg-blue-400"}`}></div>
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

    {searchOpen && (
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4" role="presentation">
        <button
          type="button"
          className="absolute inset-0 bg-black/50 cursor-default"
          aria-label="Yopish"
          onClick={closeSearch}
        />
        <div
          id="global-search-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="global-search-title"
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
              placeholder="Sahifa yoki kasalxona qidirish..."
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
            Global qidiruv
          </p>
          <ul
            className={`max-h-[min(50vh,320px)] overflow-y-auto py-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}
            role="listbox"
            aria-label="Natijalar"
          >
            {filteredHits.length === 0 ? (
              <li className={`px-4 py-6 text-sm text-center ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Hech narsa topilmadi
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
                      {hit.kind === "page" ? "Sahifa" : "Kasalxona"}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className={`px-4 py-2 text-xs border-t ${darkMode ? "border-[#1E2130] text-gray-500" : "border-gray-100 text-gray-400"}`}>
            <span className="hidden sm:inline">↑↓ tanlash · Enter ochish · </span>
            {modShortcut} yoki Esc
          </div>
        </div>
      </div>
    )}
    </>
  );
}
