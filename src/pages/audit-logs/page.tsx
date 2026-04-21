import { useTranslation } from "react-i18next";
import { useEffect, useState, useMemo, useCallback } from "react";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import AuditFilters from "./components/AuditFilters";
import AuditTable from "./components/AuditTable";
import AuditCard from "./components/AuditCard";
import AuditDetailModal from "./components/AuditDetailModal";
import { getAuditLogs } from "@/api/audit";
import type { AuditLogDto as AuditLog } from "@/api/types/audit.types";
import {
  formatLocalDateForFileName,
  getTimestampMs,
  resolveDateFilterRange,
} from "./utils/date";
import { usePageState } from "@/hooks/usePageState";

const PAGE_SIZE = 12;

type ViewMode = "table" | "card";

export function AuditLogsPageContent() {
  const { t } = useTranslation("admin");
  const darkMode = useMainLayoutDarkMode();
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [baseLogs, setBaseLogs] = useState<AuditLog[]>([]);
  const fetchAuditLogs = useCallback(async () => getAuditLogs(), []);
  const pageState = usePageState(fetchAuditLogs);

  useEffect(() => {
    if (!pageState.data) return;
    setBaseLogs(pageState.data);
  }, [pageState.data]);

  const authoritativeLogs = useMemo(() => {
    const seen = new Set<string>();
    return baseLogs.filter((l) => {
      if (seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    }).sort((a, b) => {
      const aMs = getTimestampMs(a.timestamp);
      const bMs = getTimestampMs(b.timestamp);
      if (aMs == null && bMs == null) return 0;
      if (aMs == null) return 1;
      if (bMs == null) return -1;
      return bMs - aMs;
    });
  }, [baseLogs]);

  const dateRange = useMemo(
    () => resolveDateFilterRange(dateFrom, dateTo),
    [dateFrom, dateTo],
  );

  const filtered = useMemo(() => {
    return authoritativeLogs.filter((log) => {
      const logMs = getTimestampMs(log.timestamp);
      if (logMs == null) return false;

      if (search) {
        const q = search.toLowerCase();
        if (
          !log.userName.toLowerCase().includes(q) &&
          !log.ip.includes(q) &&
          !log.detail.toLowerCase().includes(q) &&
          !log.resource.toLowerCase().includes(q)
        ) return false;
      }
      if (roleFilter && log.role !== roleFilter) return false;
      if (actionFilter && log.action !== actionFilter) return false;
      if (resourceFilter && log.resource !== resourceFilter) return false;
      if (statusFilter && log.status !== statusFilter) return false;
      if (dateRange.fromMs != null && logMs < dateRange.fromMs) return false;
      if (dateRange.toMs != null && logMs > dateRange.toMs) return false;
      return true;
    });
  }, [authoritativeLogs, search, roleFilter, actionFilter, resourceFilter, statusFilter, dateRange]);

  const summaryStats = useMemo(() => {
    const today = new Date();
    const todayY = today.getFullYear();
    const todayM = today.getMonth();
    const todayD = today.getDate();

    const todayCount = filtered.reduce((count, log) => {
      const ms = getTimestampMs(log.timestamp);
      if (ms == null) return count;
      const dt = new Date(ms);
      const isToday = dt.getFullYear() === todayY && dt.getMonth() === todayM && dt.getDate() === todayD;
      return isToday ? count + 1 : count;
    }, 0);

    const failedCount = filtered.reduce((count, log) => (log.status === "failed" ? count + 1 : count), 0);
    const warningCount = filtered.reduce((count, log) => (log.status === "warning" ? count + 1 : count), 0);

    return [
      { label: "Jami loglar", value: String(filtered.length), icon: "ri-file-list-3-line", color: "text-emerald-500", bg: "bg-emerald-500/10" },
      { label: "Bugungi amallar", value: String(todayCount), icon: "ri-calendar-check-line", color: "text-teal-500", bg: "bg-teal-500/10" },
      { label: "Muvaffaqiyatsiz", value: String(failedCount), icon: "ri-close-circle-line", color: "text-red-500", bg: "bg-red-500/10" },
      { label: "Ogohlantirishlar", value: String(warningCount), icon: "ri-alert-line", color: "text-amber-500", bg: "bg-amber-500/10" },
    ];
  }, [filtered]);

  const pageSize = viewMode === "card" ? 12 : PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage((p) => Math.min(totalPages, Math.max(1, p)));
  }, [totalPages]);

  const handleReset = () => {
    setSearch("");
    setRoleFilter("");
    setActionFilter("");
    setResourceFilter("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const escapeCsvCell = (value: unknown): string => {
    const raw = String(value ?? "");
    const neutralized = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
    return `"${neutralized.replace(/"/g, '""')}"`;
  };

  const handleExport = () => {
    const headers = [
      escapeCsvCell(t("audit.csv.time")),
      escapeCsvCell(t("audit.csv.user")),
      escapeCsvCell(t("audit.csv.role")),
      escapeCsvCell(t("audit.csv.action")),
      escapeCsvCell(t("audit.csv.resource")),
      escapeCsvCell(t("audit.csv.description")),
      escapeCsvCell("IP"),
      escapeCsvCell(t("audit.csv.status")),
    ].join(",");

    const rows = filtered.map((l) =>
      [
        escapeCsvCell(new Date(l.timestamp).toLocaleString()),
        escapeCsvCell(l.userName),
        escapeCsvCell(l.role),
        escapeCsvCell(l.action),
        escapeCsvCell(l.resource),
        escapeCsvCell(l.detail),
        escapeCsvCell(l.ip),
        escapeCsvCell(l.status),
      ].join(","),
    );

    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${formatLocalDateForFileName()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <div className="space-y-4">
        {pageState.status === "loading" ? (
          <div className={`rounded-xl p-14 text-center ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
            <i className="ri-loader-4-line animate-spin text-2xl text-emerald-500" />
            <p className={`mt-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Audit loglar yuklanmoqda...</p>
          </div>
        ) : null}
        {pageState.status === "error" ? (
          <div className={`rounded-xl p-14 text-center ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
            <i className="ri-error-warning-line text-2xl text-red-500" />
            <p className={`mt-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{pageState.error}</p>
            <button
              type="button"
              onClick={pageState.reload}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium"
            >
              Qayta yuklash
            </button>
          </div>
        ) : null}
        {pageState.status === "success" && authoritativeLogs.length === 0 ? (
          <div className={`rounded-xl p-14 text-center ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
            <i className={`ri-file-search-line text-3xl ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
            <p className={`mt-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{t("audit.empty")}</p>
            <button
              type="button"
              onClick={pageState.reload}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium"
            >
              Qayta tekshirish
            </button>
          </div>
        ) : null}
        {pageState.status !== "success" || authoritativeLogs.length === 0 ? null : (
        <>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{t("audit.title")}</h1>
            <p className={`text-sm mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {t("audit.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className={`flex items-center rounded-xl p-1 ${darkMode ? "bg-[#1A2235]" : "bg-gray-100"}`}>
              <button
                onClick={() => { setViewMode("table"); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === "table"
                    ? "bg-emerald-500 text-white"
                    : darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-table-line text-sm"></i>
                </div>
                <span>{t("audit.tableView")}</span>
              </button>
              <button
                onClick={() => { setViewMode("card"); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === "card"
                    ? "bg-emerald-500 text-white"
                    : darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-layout-grid-line text-sm"></i>
                </div>
                <span>{t("audit.cardsView")}</span>
              </button>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-download-2-line text-sm"></i>
              <span>{t("audit.exportCsv")}</span>
            </button>
          </div>
        </div>
        <div className={`rounded-xl border px-4 py-3 text-xs ${darkMode ? "bg-[#1A2235] border-[#2A3448] text-gray-300" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
          Ushbu bo'lim faqat authoritative audit manbasini ko'rsatadi. Faqat serverda qayd etilgan faoliyatlar bu ro'yxatga qo'shiladi.
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryStats.map((stat) => (
            <div key={stat.label} className={`rounded-xl p-4 flex items-center gap-3 ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${stat.bg}`}>
                <i className={`${stat.icon} text-lg ${stat.color}`}></i>
              </div>
              <div>
                <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{stat.value}</p>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <AuditFilters
          search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
          roleFilter={roleFilter} onRoleChange={(v) => { setRoleFilter(v); setPage(1); }}
          actionFilter={actionFilter} onActionChange={(v) => { setActionFilter(v); setPage(1); }}
          resourceFilter={resourceFilter} onResourceChange={(v) => { setResourceFilter(v); setPage(1); }}
          statusFilter={statusFilter} onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
          dateFrom={dateFrom} onDateFromChange={(v) => { setDateFrom(v); setPage(1); }}
          dateTo={dateTo} onDateToChange={(v) => { setDateTo(v); setPage(1); }}
          onReset={handleReset}
          darkMode={darkMode}
        />

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {t("audit.totalFound")} <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{filtered.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {page} / {totalPages} sahifa
            </span>
          </div>
        </div>

        {/* Content: Table or Card view */}
        {viewMode === "table" ? (
          <AuditTable logs={paginated} onViewDetail={setSelectedLog} darkMode={darkMode} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.length === 0 ? (
              <div className={`col-span-3 rounded-xl p-12 text-center ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-file-search-line text-3xl text-gray-400"></i>
                </div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t("audit.empty")}</p>
              </div>
            ) : (
              paginated.map((log) => (
                <AuditCard key={log.id} log={log} darkMode={darkMode} />
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                darkMode ? "bg-[#1A2235] text-gray-400 hover:text-white" : "bg-white text-gray-500 hover:text-gray-900"
              }`}
            >
              <i className="ri-arrow-left-s-line text-lg"></i>
            </button>

            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) {
                p = i + 1;
              } else if (page <= 4) {
                p = i + 1;
              } else if (page >= totalPages - 3) {
                p = totalPages - 6 + i;
              } else {
                p = page - 3 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer ${
                    page === p
                      ? "bg-emerald-500 text-white font-semibold"
                      : darkMode
                      ? "bg-[#1A2235] text-gray-400 hover:text-white"
                      : "bg-white text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                darkMode ? "bg-[#1A2235] text-gray-400 hover:text-white" : "bg-white text-gray-500 hover:text-gray-900"
              }`}
            >
              <i className="ri-arrow-right-s-line text-lg"></i>
            </button>
          </div>
        )}
        </>
        )}
      </div>

      {/* Detail Modal (quick view) */}
      <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} darkMode={darkMode} />
    </>
  );
}

export default function AuditLogsPage() {
  const { t } = useTranslation("admin");
  return (
    <MainLayout title={t("titles.auditLogs")}>
      <AuditLogsPageContent />
    </MainLayout>
  );
}
