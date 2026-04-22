import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { AuditLogDto as AuditLog } from "@/api/types/audit.types";

interface AuditTableProps {
  logs: AuditLog[];
  onViewDetail: (log: AuditLog) => void;
  darkMode: boolean;
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: "bg-emerald-100 text-emerald-700",
  LOGOUT: "bg-gray-100 text-gray-600",
  CREATE: "bg-teal-100 text-teal-700",
  UPDATE: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
  VIEW: "bg-sky-100 text-sky-700",
  EXPORT: "bg-indigo-100 text-indigo-700",
  SETTINGS_CHANGE: "bg-orange-100 text-orange-700",
  PASSWORD_CHANGE: "bg-pink-100 text-pink-700",
  ROLE_CHANGE: "bg-violet-100 text-violet-700",
};

const ACTION_COLORS_DARK: Record<string, string> = {
  LOGIN: "bg-emerald-500/15 text-emerald-400",
  LOGOUT: "bg-gray-500/15 text-gray-400",
  CREATE: "bg-teal-500/15 text-teal-400",
  UPDATE: "bg-amber-500/15 text-amber-400",
  DELETE: "bg-red-500/15 text-red-400",
  VIEW: "bg-sky-500/15 text-sky-400",
  EXPORT: "bg-indigo-500/15 text-indigo-400",
  SETTINGS_CHANGE: "bg-orange-500/15 text-orange-400",
  PASSWORD_CHANGE: "bg-pink-500/15 text-pink-400",
  ROLE_CHANGE: "bg-violet-500/15 text-violet-400",
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "text-emerald-500",
  HOSPITAL_ADMIN: "text-teal-500",
  DOCTOR: "text-violet-500",
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  HOSPITAL_ADMIN: "Hospital Admin",
  DOCTOR: "Shifokor",
};

const STATUS_CONFIG: Record<string, { icon: string; cls: string }> = {
  success: { icon: "ri-checkbox-circle-line", cls: "text-emerald-500" },
  failed: { icon: "ri-close-circle-line", cls: "text-red-500" },
  warning: { icon: "ri-alert-line", cls: "text-amber-500" },
};

function formatTime(ts: string, locale: string) {
  const d = new Date(ts);
  return d.toLocaleString(locale, {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function AuditTable({ logs, onViewDetail, darkMode }: AuditTableProps) {
  const navigate = useNavigate();
  const { i18n } = useTranslation("admin");
  const locale = i18n.language === "ru" ? "ru-RU" : "uz-UZ";
  const panelClass = darkMode ? "bg-[#1A2235]" : "bg-white";
  const fallbackStatusCfg = { icon: "ri-alert-line", cls: "text-amber-500" };
  const fallbackRoleLabel = "Unknown";
  const fallbackRoleColor = darkMode ? "text-amber-400" : "text-amber-600";

  if (logs.length === 0) {
    return (
      <div className={`rounded-xl p-12 text-center ${panelClass}`}>
        <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
          <i className="ri-file-search-line text-3xl text-gray-400"></i>
        </div>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Hech qanday log topilmadi</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden ${panelClass}`}>
      <div className="space-y-3 p-3 md:hidden">
        {logs.map((log) => {
          const statusCfg =
            STATUS_CONFIG[log.status as keyof typeof STATUS_CONFIG] ??
            fallbackStatusCfg;
          const actionColor = darkMode
            ? (ACTION_COLORS_DARK[log.action as keyof typeof ACTION_COLORS_DARK] ?? "bg-gray-500/15 text-gray-400")
            : (ACTION_COLORS[log.action as keyof typeof ACTION_COLORS] ?? "bg-gray-100 text-gray-600");
          const roleLabel = ROLE_LABELS[log.role as keyof typeof ROLE_LABELS] ?? fallbackRoleLabel;
          return (
            <article key={log.id} className={`rounded-lg border p-3 ${darkMode ? "border-[#2A3448] bg-[#0F1117]/40" : "border-gray-100 bg-white"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    to={`/audit-logs/${log.id}`}
                    className={`text-xs font-mono rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${darkMode ? "text-gray-400 focus-visible:ring-offset-[#0D1117]" : "text-gray-500 focus-visible:ring-offset-white"}`}
                  >
                    {formatTime(log.timestamp, locale)}
                  </Link>
                  <p className={`mt-1 text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{log.userName}</p>
                  <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>{roleLabel} {log.hospitalName ? `• ${log.hospitalName}` : ""}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${statusCfg.cls}`}>
                  <i className={`${statusCfg.icon} text-sm`} aria-hidden="true"></i>
                  <span className="capitalize">{log.status}</span>
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${actionColor}`}>{log.action}</span>
                <span className={`text-xs font-mono ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{log.resource}{log.resourceId ? ` #${log.resourceId}` : ""}</span>
              </div>
              <p className={`mt-2 text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{log.detail}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs font-mono ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{log.ip}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/audit-logs/${log.id}`)}
                    aria-label={`Open full details for audit log ${log.id}`}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${darkMode ? "hover:bg-[#2A3448] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"}`}
                    title="To'liq sahifada ko'rish"
                  >
                    <i aria-hidden="true" className="ri-external-link-line text-sm"></i>
                  </button>
                  <button
                    onClick={() => onViewDetail(log)}
                    aria-label={`Open quick modal details for audit log ${log.id}`}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${darkMode ? "hover:bg-[#2A3448] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"}`}
                    title="Modal ko'rish"
                  >
                    <i aria-hidden="true" className="ri-eye-line text-sm"></i>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <caption className="sr-only">Audit logs table</caption>
          <thead>
            <tr className={`text-xs font-semibold uppercase tracking-wide ${
              darkMode ? "bg-[#0F1117] text-gray-400" : "bg-gray-50 text-gray-500"
            }`}>
              <th scope="col" className="px-4 py-3 text-left">Vaqt</th>
              <th scope="col" className="px-4 py-3 text-left">Foydalanuvchi</th>
              <th scope="col" className="px-4 py-3 text-left">Rol</th>
              <th scope="col" className="px-4 py-3 text-left">Amal</th>
              <th scope="col" className="px-4 py-3 text-left">Resurs</th>
              <th scope="col" className="px-4 py-3 text-left">Tavsif</th>
              <th scope="col" className="px-4 py-3 text-left">IP manzil</th>
              <th scope="col" className="px-4 py-3 text-left">Status</th>
              <th scope="col" className="px-4 py-3 text-left">Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const statusCfg =
                STATUS_CONFIG[log.status as keyof typeof STATUS_CONFIG] ??
                fallbackStatusCfg;
              const actionColor = darkMode
                ? (ACTION_COLORS_DARK[log.action as keyof typeof ACTION_COLORS_DARK] ?? "bg-gray-500/15 text-gray-400")
                : (ACTION_COLORS[log.action as keyof typeof ACTION_COLORS] ?? "bg-gray-100 text-gray-600");
              const roleColor = ROLE_COLORS[log.role as keyof typeof ROLE_COLORS] ?? fallbackRoleColor;
              const roleLabel = ROLE_LABELS[log.role as keyof typeof ROLE_LABELS] ?? fallbackRoleLabel;

              return (
                <tr
                  key={log.id}
                  className={`transition-colors border-t ${
                    darkMode
                      ? "border-[#2A3448] hover:bg-[#0F1117]/60"
                      : "border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  {/* Time */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      to={`/audit-logs/${log.id}`}
                      className={`text-xs font-mono rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                        darkMode ? "text-gray-400 focus-visible:ring-offset-[#0D1117]" : "text-gray-500 focus-visible:ring-offset-white"
                      }`}
                    >
                      {formatTime(log.timestamp, locale)}
                    </Link>
                  </td>

                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${
                        log.role === "SUPER_ADMIN" ? "bg-emerald-500" :
                        log.role === "HOSPITAL_ADMIN" ? "bg-teal-500" : "bg-violet-500"
                      }`}>
                        {log.userName.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                      </div>
                      <div>
                        <p className={`text-sm font-medium whitespace-nowrap ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {log.userName}
                        </p>
                        {log.hospitalName && (
                          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                            {log.hospitalName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs font-semibold ${roleColor}`}>
                      {roleLabel}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${actionColor}`}>
                      {log.action}
                    </span>
                  </td>

                  {/* Resource */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs font-mono ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {log.resource}
                      {log.resourceId && <span className="opacity-60"> #{log.resourceId}</span>}
                    </span>
                  </td>

                  {/* Detail */}
                  <td className="px-4 py-3 max-w-xs">
                    <p className={`text-xs truncate ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {log.detail}
                    </p>
                  </td>

                  {/* IP */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs font-mono ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {log.ip}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={`flex items-center gap-1 ${statusCfg.cls}`}>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={`${statusCfg.icon} text-sm`}></i>
                      </div>
                      <span className="text-xs font-medium capitalize">{log.status}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/audit-logs/${log.id}`)}
                        aria-label={`Open full details for audit log ${log.id}`}
                        className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          darkMode ? "hover:bg-[#2A3448] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                        }`}
                        title="To'liq sahifada ko'rish"
                      >
                        <i aria-hidden="true" className="ri-external-link-line text-sm"></i>
                      </button>
                      <button
                        onClick={() => onViewDetail(log)}
                        aria-label={`Open quick modal details for audit log ${log.id}`}
                        className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          darkMode ? "hover:bg-[#2A3448] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                        }`}
                        title="Modal ko'rish"
                      >
                        <i aria-hidden="true" className="ri-eye-line text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
