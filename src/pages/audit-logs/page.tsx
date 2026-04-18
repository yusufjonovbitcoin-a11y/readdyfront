import { useState, useMemo } from "react";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { mockAuditLogs, AuditLog } from "@/mocks/audit_logs";
import AuditFilters from "./components/AuditFilters";
import AuditTable from "./components/AuditTable";
import AuditCard from "./components/AuditCard";
import AuditDetailModal from "./components/AuditDetailModal";

const PAGE_SIZE = 12;

const SUMMARY_STATS = [
  { label: "Jami loglar", value: "1,248", icon: "ri-file-list-3-line", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Bugungi amallar", value: "87", icon: "ri-calendar-check-line", color: "text-teal-500", bg: "bg-teal-500/10" },
  { label: "Muvaffaqiyatsiz", value: "12", icon: "ri-close-circle-line", color: "text-red-500", bg: "bg-red-500/10" },
  { label: "Ogohlantirishlar", value: "5", icon: "ri-alert-line", color: "text-amber-500", bg: "bg-amber-500/10" },
];

type ViewMode = "table" | "card";

function AuditLogsPageContent() {
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

  const allLogs = useMemo(() => {
    const stored = JSON.parse(localStorage.getItem("medcore_audit_logs") || "[]") as AuditLog[];
    const combined = [...stored, ...mockAuditLogs];
    const seen = new Set<string>();
    return combined.filter((l) => {
      if (seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, []);

  const filtered = useMemo(() => {
    return allLogs.filter((log) => {
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
      if (dateFrom) {
        const logDate = new Date(log.timestamp).toISOString().split("T")[0];
        if (logDate < dateFrom) return false;
      }
      if (dateTo) {
        const logDate = new Date(log.timestamp).toISOString().split("T")[0];
        if (logDate > dateTo) return false;
      }
      return true;
    });
  }, [allLogs, search, roleFilter, actionFilter, resourceFilter, statusFilter, dateFrom, dateTo]);

  const pageSize = viewMode === "card" ? 12 : PAGE_SIZE;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

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

  const handleExport = () => {
    const csv = [
      ["Vaqt", "Foydalanuvchi", "Rol", "Amal", "Resurs", "Tavsif", "IP", "Status"].join(","),
      ...filtered.map((l) =>
        [
          new Date(l.timestamp).toLocaleString(),
          l.userName,
          l.role,
          l.action,
          l.resource,
          `"${l.detail}"`,
          l.ip,
          l.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Audit Logs</h1>
            <p className={`text-sm mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Tizimda amalga oshirilgan barcha amallar tarixi
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
                <span>Jadval</span>
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
                <span>Kartalar</span>
              </button>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-download-2-line text-sm"></i>
              <span>CSV Eksport</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {SUMMARY_STATS.map((stat) => (
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
            Jami <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{filtered.length}</span> ta log topildi
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {page} / {totalPages || 1} sahifa
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
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Hech qanday log topilmadi</p>
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
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
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
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer ${
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
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                darkMode ? "bg-[#1A2235] text-gray-400 hover:text-white" : "bg-white text-gray-500 hover:text-gray-900"
              }`}
            >
              <i className="ri-arrow-right-s-line text-lg"></i>
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal (quick view) */}
      <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} darkMode={darkMode} />
    </>
  );
}

export default function AuditLogsPage() {
  return (
    <MainLayout title="Audit Logs">
      <AuditLogsPageContent />
    </MainLayout>
  );
}
