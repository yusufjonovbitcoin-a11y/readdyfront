import { useTranslation } from "react-i18next";
import { useEffect, useMemo, type RefObject } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useDocPatients } from "@/context/DocPatientsContext";
import { formatLocalYMD } from "@/utils/date";
import { groupChatMessages, chatDoctorsBySpecialty } from "@/mocks/doctorChat";

export const SIDEBAR_WIDTH = { expanded: 256, collapsed: 64 } as const;

interface NavItem {
  path: string;
  to?: string;
  icon: string;
  label: string;
  exact?: boolean;
}

const doctorRouteWarmupMap: Record<string, () => Promise<unknown>> = {
  "/doctor/patients": () => import("@/pages/doctor/patients/page"),
  "/doctor/history": () => import("@/pages/doctor/history/page"),
  "/doctor/analytics": () => import("@/pages/doctor/analytics/page"),
  "/doctor/questions": () => import("@/pages/doctor/questions/page"),
  "/doctor/notifications": () => import("@/pages/notifications/page"),
  "/doctor/news": () => import("@/pages/doctor/news/page"),
  "/doctor/chat": () => import("@/pages/doctor/chat/page"),
  "/doctor/settings": () => import("@/pages/doctor/settings/page"),
};

interface DocSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  drawerRef?: RefObject<HTMLElement | null>;
}

export default function DocSidebar({ collapsed, onToggle, mobileOpen, onCloseMobile, drawerRef }: DocSidebarProps) {
  const { t } = useTranslation("doctor");
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { darkMode } = useDoctorTheme();
  const { patients } = useDocPatients();
  const showExpanded = mobileOpen || !collapsed;

  const { queueTodayCount, inProgressTodayCount, completedTodayCount } = useMemo(() => {
    const todayStr = formatLocalYMD();
    const todayList = patients.filter((p) => p.date === todayStr);
    return {
      queueTodayCount: todayList.filter((p) => p.status === "queue").length,
      inProgressTodayCount: todayList.filter((p) => p.status === "in_progress").length,
      completedTodayCount: todayList.filter((p) => p.status === "completed").length,
    };
  }, [patients]);
  const doctorName = user?.name?.trim() || t("sidebar.doctorName");
  const doctorAvatar = user?.avatar?.trim() || "";
  const doctorInitials = doctorName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const handleLogout = async () => {
    await logout();
    onCloseMobile();
    navigate("/login", { replace: true });
  };
  const prewarmDoctorPath = (path: string) => {
    void doctorRouteWarmupMap[path]?.();
  };
  const navItems: NavItem[] = [
    { path: "/doctor/patients", icon: "ri-user-add-line", label: t("sidebar.newPatients") },
    { path: "/doctor/history", icon: "ri-history-line", label: t("sidebar.history") },
    { path: "/doctor/analytics", icon: "ri-bar-chart-2-line", label: t("sidebar.analytics") },
    { path: "/doctor/questions", icon: "ri-questionnaire-line", label: t("sidebar.questions") },
    { path: "/doctor/notifications", icon: "ri-notification-3-line", label: t("sidebar.notifications") },
    { path: "/doctor/news", icon: "ri-newspaper-line", label: t("sidebar.news") },
    { path: "/doctor/settings", icon: "ri-settings-3-line", label: t("sidebar.settings") },
  ];

  useEffect(() => {
    let cancelled = false;
    const warmup = () => {
      if (cancelled) return;
      void import("@/pages/doctor/patients/page");
      void import("@/pages/doctor/patients/detail/page");
      void import("@/pages/doctor/history/page");
      void import("@/pages/doctor/analytics/page");
      void import("@/pages/doctor/questions/page");
      void import("@/pages/doctor/settings/page");
      void import("@/pages/doctor/news/page");
      void import("@/pages/doctor/chat/page");
      void import("@/pages/notifications/page");
    };
    const idle = (globalThis as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (typeof idle === "function") {
      const id = idle(warmup);
      return () => {
        cancelled = true;
        const cancelIdle = (globalThis as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
        cancelIdle?.(id);
      };
    }
    const timer = globalThis.setTimeout(warmup, 250);
    return () => {
      cancelled = true;
      globalThis.clearTimeout(timer);
    };
  }, []);

  return (
    <aside
      ref={drawerRef}
      role={mobileOpen ? "dialog" : undefined}
      aria-modal={mobileOpen ? "true" : undefined}
      aria-label={mobileOpen ? "Navigation menu" : undefined}
      tabIndex={mobileOpen ? -1 : undefined}
      style={{ width: collapsed && !mobileOpen ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded }}
      className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-[width,transform] duration-300 ease-out isolate ${
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } ${
        darkMode ? "bg-[#0D1117] border-r border-[#30363D]" : "bg-white border-r border-gray-100"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
            <i className="ri-stethoscope-line text-white text-sm"></i>
          </div>
        </div>
        {showExpanded && (
          <div className="ml-3 flex-1 min-w-0">
            <span className={`text-sm font-bold tracking-wide block truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
              {t("sidebar.doctorName")}
            </span>
            <span className="text-xs text-green-600 font-medium">{t("sidebar.specialty")}</span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
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
              `no-underline flex items-center h-11 rounded-lg transition-colors duration-150 cursor-pointer [-webkit-tap-highlight-color:transparent] outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 ${
                showExpanded ? "px-3" : "justify-center px-2"
              } ${
                isActive
                  ? darkMode
                    ? "bg-green-900/30 text-green-300 active:bg-green-900/45"
                    : "bg-green-50 text-green-700 active:bg-green-100"
                  : darkMode
                  ? "text-gray-300 hover:bg-[#21262D] hover:text-white active:bg-[#30363D]/80"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
              }`;

            return (
              <Link
                key={item.to ?? item.path}
                to={item.to ?? item.path}
                prefetch="none"
                onClick={onCloseMobile}
                onMouseEnter={() => prewarmDoctorPath(item.to ?? item.path)}
                onFocus={() => prewarmDoctorPath(item.to ?? item.path)}
                className={itemClass}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                title={item.label}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <i className={`${item.icon} text-base`}></i>
                </div>
                {showExpanded && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
                {isActive && showExpanded && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Chat Guruhi Card */}
      {(() => {
        const isGroupActive = location.pathname.startsWith("/doctor/chat");
        const groupUnread = groupChatMessages.filter((m) => !m.read).length;
        const kardioDoctors = chatDoctorsBySpecialty.Kardiologiya || [];
        const onlineMembers = kardioDoctors.filter((d) => d.status === "online").length;
        const totalMembers = kardioDoctors.length + 1;
        return (
          <div className={`px-3 py-1.5 border-t ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
            <a
              href="/doctor/chat"
              onClick={(e) => {
                e.preventDefault();
                navigate("/doctor/chat");
                onCloseMobile();
              }}
              onMouseEnter={() => prewarmDoctorPath("/doctor/chat")}
              className={`block rounded-xl p-2.5 transition-all cursor-pointer no-underline ${
                isGroupActive
                  ? darkMode
                    ? "bg-green-900/30 border border-green-500/30"
                    : "bg-green-50 border border-green-200"
                  : darkMode
                  ? "bg-[#161B22] border border-[#30363D] hover:border-green-500/30"
                  : "bg-white border border-gray-100 hover:border-green-200 hover:shadow-sm"
              }`}
            >
              {showExpanded ? (
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="flex -space-x-1.5">
                      <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white dark:ring-[#161B22]">AK</div>
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white dark:ring-[#161B22]">RT</div>
                      <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white dark:ring-[#161B22]">BS</div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-sm font-semibold truncate ${isGroupActive ? (darkMode ? "text-green-300" : "text-green-700") : darkMode ? "text-gray-200" : "text-gray-900"}`}>
                        {t("sidebar.chatGroup")}
                      </p>
                      {groupUnread > 0 && (
                        <span className="flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">{groupUnread}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className={`text-[11px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {onlineMembers} onlayn · {totalMembers} a'zo
                      </span>
                    </div>
                  </div>
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    <i className={`ri-arrow-right-s-line text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                      <i className="ri-chat-3-line text-white text-sm" />
                    </div>
                    {groupUnread > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] flex items-center justify-center bg-red-500 text-white text-[8px] font-bold rounded-full px-0.5">{groupUnread}</span>
                    )}
                  </div>
                </div>
              )}
            </a>
          </div>
        );
      })()}

      {/* Quick Stats */}
      {showExpanded && (
        <div className={`mx-3 mb-3 p-3 rounded-lg ${darkMode ? "bg-[#21262D] border border-[#30363D]" : "bg-green-50"}`}>
          <p className={`text-xs font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t("sidebar.today")}</p>
          <div className="flex gap-2">
            <Link
              to="/doctor/patients?tab=queue"
              prefetch="none"
              onClick={onCloseMobile}
              className={`no-underline flex min-w-0 flex-1 flex-col items-center justify-center rounded-lg px-2 py-2.5 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 [-webkit-tap-highlight-color:transparent] ${
                darkMode
                  ? "bg-[#161B22] hover:bg-[#30363D] active:bg-[#21262D]"
                  : "bg-white/80 hover:bg-white active:bg-white shadow-sm border border-green-100/80"
              }`}
              aria-label={`${t("sidebar.queue")}: ${queueTodayCount}`}
            >
              <p className={`text-lg font-bold tabular-nums ${darkMode ? "text-white" : "text-gray-900"}`}>
                {queueTodayCount}
              </p>
              <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>{t("sidebar.queue")}</p>
            </Link>
            <Link
              to="/doctor/patients?tab=in_progress"
              prefetch="none"
              onClick={onCloseMobile}
              className={`no-underline flex min-w-0 flex-1 flex-col items-center justify-center rounded-lg px-2 py-2.5 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 [-webkit-tap-highlight-color:transparent] ${
                darkMode
                  ? "bg-[#161B22] hover:bg-[#30363D] active:bg-[#21262D]"
                  : "bg-white/80 hover:bg-white active:bg-white shadow-sm border border-green-100/80"
              }`}
              aria-label={`${t("sidebar.inProgress")}: ${inProgressTodayCount}`}
            >
              <p className={`text-lg font-bold tabular-nums text-amber-500`}>{inProgressTodayCount}</p>
              <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>{t("sidebar.inProgress")}</p>
            </Link>
            <Link
              to="/doctor/patients?tab=completed"
              prefetch="none"
              onClick={onCloseMobile}
              className={`no-underline flex min-w-0 flex-1 flex-col items-center justify-center rounded-lg px-2 py-2.5 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 [-webkit-tap-highlight-color:transparent] ${
                darkMode
                  ? "bg-[#161B22] hover:bg-[#30363D] active:bg-[#21262D]"
                  : "bg-white/80 hover:bg-white active:bg-white shadow-sm border border-green-100/80"
              }`}
              aria-label={`${t("sidebar.completed")}: ${completedTodayCount}`}
            >
              <p className={`text-lg font-bold tabular-nums text-green-500`}>{completedTodayCount}</p>
              <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>{t("sidebar.completed")}</p>
            </Link>
          </div>
        </div>
      )}
      {/* User profile (settings) + chiqish alohida */}
      <div className={`p-3 border-t ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
        <div
          className={`flex [-webkit-tap-highlight-color:transparent] ${
            showExpanded ? "items-stretch justify-between gap-2" : "flex-col items-center gap-2"
          }`}
        >
          <Link
            to="/doctor/settings"
            prefetch="none"
            onClick={onCloseMobile}
            className={`no-underline flex min-w-0 items-center rounded-lg py-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 ${
              showExpanded ? "min-h-11 flex-1 gap-2 px-3" : "justify-center px-2"
            } ${
              darkMode ? "text-white hover:bg-[#21262D] active:bg-[#30363D]/80" : "hover:bg-gray-50 active:bg-gray-100"
            }`}
            aria-label={`${doctorName} — ${t("sidebar.settings")}`}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-600">
              {doctorAvatar ? (
                <img src={doctorAvatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">{doctorInitials || "DR"}</span>
              )}
            </div>
            {showExpanded && (
              <div className="min-w-0 flex-1 text-left">
                <p className={`truncate text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{doctorName}</p>
                <p className="truncate text-xs text-green-600">DOCTOR</p>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className={`flex w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 ${
              darkMode
                ? "text-gray-400 hover:bg-[#21262D] hover:text-white active:bg-[#30363D]/80"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
            }`}
          >
            <i className="ri-logout-box-r-line text-lg" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
