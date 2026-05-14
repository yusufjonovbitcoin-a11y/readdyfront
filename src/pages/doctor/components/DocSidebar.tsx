import { useTranslation } from "react-i18next";
import { useEffect, useMemo, type RefObject } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDoctorDepartmentChatSummary } from "@/api/adapters/departmentChat.http";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useDocPatients } from "@/context/DocPatientsContext";
import { formatLocalYMD } from "@/utils/date";
import { ChatGuruhiSidebarCard } from "@/components/feature/ChatGuruhiSidebarCard";
import { AppLogoMark } from "@/components/branding/AppLogoMark";
import { MeduzaAiWordmark } from "@/components/branding/MeduzaAiWordmark";

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

  const { data: deptChatSummary } = useQuery({
    queryKey: ["doctor-department-chat-summary"],
    queryFn: getDoctorDepartmentChatSummary,
    enabled: user?.role === "DOCTOR",
  });
  const chatBadgeSummary = useMemo(() => {
    if (!deptChatSummary) return null;
    return {
      online: deptChatSummary.onlineCount,
      members: deptChatSummary.memberCount,
      unread: deptChatSummary.unreadCount,
    };
  }, [deptChatSummary]);

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
      {/* Logo + meduza.ai */}
      <div
        className={`flex items-center h-16 border-b ${showExpanded ? "px-4" : "px-2"} ${
          darkMode ? "border-[#30363D]" : "border-gray-100"
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 pr-2" aria-label="meduza.ai">
          <AppLogoMark size={showExpanded ? 40 : 32} graphicScale={showExpanded ? 1.65 : 1.35} className="shrink-0" />
          {showExpanded && <MeduzaAiWordmark darkMode={darkMode} />}
        </div>
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

      {/* Chat Guruhi + quick stats (single footer section) */}
      <div
        className={`space-y-2 border-t px-3 pt-2 pb-3 ${
          darkMode ? "border-[#30363D]" : "border-gray-100"
        }`}
      >
        <ChatGuruhiSidebarCard
          embedded
          variant="violet"
          i18nNamespace="doctor"
          darkMode={darkMode}
          showExpanded={showExpanded}
          linkTo="/doctor/chat"
          onNavigate={onCloseMobile}
          badgeSummary={chatBadgeSummary}
        />
        {showExpanded && (
          <div className={`p-3 rounded-lg ${darkMode ? "bg-[#21262D] border border-[#30363D]" : "bg-green-50"}`}>
            <p className={`text-xs font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t("sidebar.today")}</p>
            <div className="flex gap-2">
              <Link
                to="/doctor/patients?tab=queue"
                prefetch="none"
                onClick={onCloseMobile}
                className={`no-underline flex min-w-0 flex-1 flex-col items-center justify-center rounded-lg px-2 py-2.5 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 [-webkit-tap-highlight-color:transparent] ${
                  darkMode
                    ? "bg-[#0F1117] hover:bg-[#30363D] active:bg-[#30363D]"
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
                    ? "bg-[#0F1117] hover:bg-[#30363D] active:bg-[#30363D]"
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
                    ? "bg-[#0F1117] hover:bg-[#30363D] active:bg-[#30363D]"
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
      </div>
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
                <p className={`truncate text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{doctorName}</p>
                <p className={`truncate text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t("sidebar.specialty")}</p>
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
