import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { getAuditLogById } from "@/api/audit";
import type { AuditLogDto as AuditLog } from "@/api/types/audit.types";
import { usePageState } from "@/hooks/usePageState";
import { copyTextWithFallback } from "@/utils/clipboard";

const ACTION_COLORS: Record<string, { bg: string; text: string; icon: string; lightBg: string; lightText: string }> = {
  LOGIN: { bg: "bg-emerald-500/15", text: "text-emerald-400", icon: "ri-login-box-line", lightBg: "bg-emerald-50", lightText: "text-emerald-700" },
  LOGOUT: { bg: "bg-gray-500/15", text: "text-gray-400", icon: "ri-logout-box-line", lightBg: "bg-gray-50", lightText: "text-gray-700" },
  CREATE: { bg: "bg-teal-500/15", text: "text-teal-400", icon: "ri-add-circle-line", lightBg: "bg-teal-50", lightText: "text-teal-700" },
  UPDATE: { bg: "bg-amber-500/15", text: "text-amber-400", icon: "ri-edit-line", lightBg: "bg-amber-50", lightText: "text-amber-700" },
  DELETE: { bg: "bg-red-500/15", text: "text-red-400", icon: "ri-delete-bin-line", lightBg: "bg-red-50", lightText: "text-red-700" },
  VIEW: { bg: "bg-sky-500/15", text: "text-sky-400", icon: "ri-eye-line", lightBg: "bg-sky-50", lightText: "text-sky-700" },
  EXPORT: { bg: "bg-indigo-500/15", text: "text-indigo-400", icon: "ri-download-2-line", lightBg: "bg-indigo-50", lightText: "text-indigo-700" },
  SETTINGS_CHANGE: { bg: "bg-orange-500/15", text: "text-orange-400", icon: "ri-settings-3-line", lightBg: "bg-orange-50", lightText: "text-orange-700" },
  PASSWORD_CHANGE: { bg: "bg-pink-500/15", text: "text-pink-400", icon: "ri-lock-password-line", lightBg: "bg-pink-50", lightText: "text-pink-700" },
  ROLE_CHANGE: { bg: "bg-violet-500/15", text: "text-violet-400", icon: "ri-shield-user-line", lightBg: "bg-violet-50", lightText: "text-violet-700" },
};

const ROLE_COLORS: Record<string, { text: string; bg: string }> = {
  SUPER_ADMIN: { text: "text-emerald-400", bg: "bg-emerald-500" },
  HOSPITAL_ADMIN: { text: "text-teal-400", bg: "bg-teal-500" },
  DOCTOR: { text: "text-violet-400", bg: "bg-violet-500" },
};

const STATUS_CONFIG: Record<string, { icon: string; cls: string; labelKey: string; bg: string; border: string }> = {
  success: { icon: "ri-checkbox-circle-fill", cls: "text-emerald-400", labelKey: "auditDetail.status.success", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  failed: { icon: "ri-close-circle-fill", cls: "text-red-400", labelKey: "auditDetail.status.failed", bg: "bg-red-500/10", border: "border-red-500/30" },
  warning: { icon: "ri-alert-fill", cls: "text-amber-400", labelKey: "auditDetail.status.warning", bg: "bg-amber-500/10", border: "border-amber-500/30" },
};

function formatFullTime(ts: string) {
  return new Date(ts).toLocaleString("uz-UZ", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    weekday: "long",
  });
}

function formatRelativeTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Hozirgina";
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  return `${days} kun oldin`;
}

interface InfoRowProps {
  label: string;
  value: string;
  mono?: boolean;
  darkMode: boolean;
  icon?: string;
  copyable?: boolean;
  onCopy?: (value: string) => void;
}

function InfoRow({ label, value, mono, darkMode, icon, copyable, onCopy }: InfoRowProps) {
  const { t } = useTranslation("admin");
  const handleCopy = () => {
    onCopy?.(value);
  };

  return (
    <div className={`flex items-start gap-4 py-3.5 border-b last:border-b-0 ${darkMode ? "border-[#2A3448]" : "border-gray-100"}`}>
      <div className="w-44 flex-shrink-0 flex items-center gap-2">
        {icon && (
          <div className="w-4 h-4 flex items-center justify-center">
            <i className={`${icon} text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}></i>
          </div>
        )}
        <span className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{label}</span>
      </div>
      <div className="flex-1 flex items-center gap-2">
        <span className={`text-sm break-all ${mono ? "font-mono" : ""} ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
          {value}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded flex-shrink-0 transition-colors cursor-pointer ${
              darkMode ? "hover:bg-[#2A3448] text-gray-500 hover:text-gray-300" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            }`}
            title={t("auditDetail.copy")}
          >
            <i className="ri-file-copy-line text-xs"></i>
          </button>
        )}
      </div>
    </div>
  );
}

function useResolvedAuditLog() {
  const { id } = useParams<{ id: string }>();
  const fetchAuditLog = useCallback(async () => {
    if (!id) return null;
    return getAuditLogById(id);
  }, [id]);
  const pageState = usePageState(fetchAuditLog);
  return { id, log: pageState.data ?? null, status: pageState.status, error: pageState.error, reload: pageState.reload };
}

export function AuditLogDetailContent({ resolved }: { resolved: ReturnType<typeof useResolvedAuditLog> }) {
  const { t } = useTranslation("admin");
  const { id, log, status, error, reload } = resolved;
  const navigate = useNavigate();
  const darkMode = useMainLayoutDarkMode();
  const [copyToast, setCopyToast] = useState<{ message: string; isError: boolean } | null>(null);

  const showCopyToast = useCallback((message: string, isError = false) => {
    setCopyToast({ message, isError });
    window.setTimeout(() => {
      setCopyToast(null);
    }, 2200);
  }, []);

  const handleCopy = useCallback(async (text: string) => {
    const copied = await copyTextWithFallback(text);
    showCopyToast(copied ? t("auditDetail.copySuccess") : t("auditDetail.copyFailed"), !copied);
  }, [showCopyToast, t]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <i className="ri-loader-4-line animate-spin text-3xl text-emerald-500" />
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t("auditDetail.loading")}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <i className="ri-error-warning-line text-3xl text-red-500" />
        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{error}</p>
        <button
          type="button"
          onClick={reload}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg"
        >
          {t("auditDetail.retry")}
        </button>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className={`w-16 h-16 flex items-center justify-center rounded-2xl ${darkMode ? "bg-[#1A2235]" : "bg-gray-100"}`}>
          <i className="ri-file-search-line text-3xl text-gray-400"></i>
        </div>
        <p className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{t("auditDetail.notFoundTitle")}</p>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t("auditDetail.idPrefix")}: {id}</p>
        <button
          onClick={() => navigate("/audit-logs")}
          className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-arrow-left-line text-sm"></i>
          <span>{t("auditDetail.backToList")}</span>
        </button>
      </div>
    );
  }

  const actionCfg =
    ACTION_COLORS[log.action as keyof typeof ACTION_COLORS] ??
    { bg: "bg-amber-500/15", text: "text-amber-500", icon: "ri-alert-line", lightBg: "bg-amber-50", lightText: "text-amber-700" };
  const statusCfg =
    STATUS_CONFIG[log.status as keyof typeof STATUS_CONFIG] ??
    { icon: "ri-alert-line", cls: "text-amber-500", labelKey: "auditDetail.status.unknown", bg: "bg-amber-500/10", border: "border-amber-500/30" };
  const roleCfg =
    ROLE_COLORS[log.role as keyof typeof ROLE_COLORS] ??
    { text: "text-amber-500", bg: "bg-amber-500" };
  const roleLabel = t(`auditDetail.roles.${log.role}`, { defaultValue: t("auditDetail.roles.unknown") });
  const statusLabel = t(statusCfg.labelKey);
  const initials = log.userName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
      <div className="max-w-4xl mx-auto space-y-5">
        {copyToast && (
          <div
            className={`fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg ${
              copyToast.isError ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
            }`}
          >
            {copyToast.message}
          </div>
        )}
        {/* Back button + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/audit-logs")}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
              darkMode ? "bg-[#1A2235] hover:bg-[#2A3448] text-gray-400 hover:text-white" : "bg-white hover:bg-gray-100 text-gray-500"
            }`}
          >
            <i className="ri-arrow-left-line text-lg"></i>
          </button>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate("/audit-logs")}
              className={`cursor-pointer hover:underline ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
            >
              {t("audit.title")}
            </button>
            <i className={`ri-arrow-right-s-line text-sm ${darkMode ? "text-gray-600" : "text-gray-400"}`}></i>
            <span className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{t("auditDetail.breadcrumbDetail")}</span>
          </div>
        </div>

        {/* Hero card */}
        <div className={`rounded-2xl overflow-hidden ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
          {/* Status banner */}
          <div className={`px-6 py-3 flex items-center justify-between border-b ${statusCfg.bg} ${statusCfg.border} border`}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${statusCfg.icon} text-lg ${statusCfg.cls}`}></i>
              </div>
              <span className={`text-sm font-bold ${statusCfg.cls}`}>{statusLabel}</span>
            </div>
            <span className={`text-xs font-mono ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{formatRelativeTime(log.timestamp)}</span>
          </div>

          <div className="p-6">
            {/* User + Action header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
              {/* User avatar */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0 ${roleCfg.bg}`}>
                {initials}
              </div>

              <div className="flex-1">
                <h1 className={`text-xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{log.userName}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-sm font-semibold ${roleCfg.text}`}>{roleLabel}</span>
                  {log.hospitalName && (
                    <>
                      <span className={`text-xs ${darkMode ? "text-gray-600" : "text-gray-300"}`}>•</span>
                      <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{log.hospitalName}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action badge */}
              <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${actionCfg.bg}`}>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${actionCfg.icon} text-lg ${actionCfg.text}`}></i>
                </div>
                <span className={`text-sm font-bold ${actionCfg.text}`}>{log.action}</span>
              </div>
            </div>

            {/* Detail description */}
            <div className={`rounded-xl p-4 mb-6 ${darkMode ? "bg-[#0F1117]" : "bg-gray-50"}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("auditDetail.actionDescription")}</p>
              <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{log.detail}</p>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: t("auditDetail.quick.resource"), value: log.resource, icon: "ri-database-2-line" },
                { label: t("auditDetail.quick.resourceId"), value: log.resourceId || "—", icon: "ri-hashtag" },
                { label: t("auditDetail.quick.ip"), value: log.ip, icon: "ri-global-line" },
                { label: t("auditDetail.quick.time"), value: new Date(log.timestamp).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }), icon: "ri-time-line" },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl p-3 ${darkMode ? "bg-[#0F1117]" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-3.5 h-3.5 flex items-center justify-center">
                      <i className={`${item.icon} text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}></i>
                    </div>
                    <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{item.label}</span>
                  </div>
                  <p className={`text-sm font-semibold font-mono ${darkMode ? "text-white" : "text-gray-900"}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full details table */}
        <div className={`rounded-2xl overflow-hidden ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
          <div className={`px-6 py-4 border-b flex items-center gap-3 ${darkMode ? "border-[#2A3448]" : "border-gray-100"}`}>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/15">
              <i className="ri-file-list-3-line text-emerald-400 text-sm"></i>
            </div>
            <h2 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{t("auditDetail.fullInfoTitle")}</h2>
          </div>

          <div className="px-6">
            <InfoRow label={t("auditDetail.fields.logId")} value={log.id} mono darkMode={darkMode} icon="ri-fingerprint-line" copyable onCopy={handleCopy} />
            <InfoRow label={t("auditDetail.fields.user")} value={log.userName} darkMode={darkMode} icon="ri-user-line" />
            <InfoRow label={t("auditDetail.fields.userId")} value={log.userId} mono darkMode={darkMode} icon="ri-id-card-line" copyable onCopy={handleCopy} />
            <InfoRow label={t("auditDetail.fields.role")} value={roleLabel} darkMode={darkMode} icon="ri-shield-line" />
            {log.hospitalName && (
              <InfoRow label={t("auditDetail.fields.hospital")} value={log.hospitalName} darkMode={darkMode} icon="ri-hospital-line" />
            )}
            {log.hospitalId && (
              <InfoRow label={t("auditDetail.fields.hospitalId")} value={log.hospitalId} mono darkMode={darkMode} icon="ri-building-line" copyable onCopy={handleCopy} />
            )}
            <InfoRow label={t("audit.csv.action")} value={log.action} darkMode={darkMode} icon="ri-flashlight-line" />
            <InfoRow label={t("audit.csv.resource")} value={log.resource} darkMode={darkMode} icon="ri-database-2-line" />
            {log.resourceId && (
              <InfoRow label={t("auditDetail.quick.resourceId")} value={log.resourceId} mono darkMode={darkMode} icon="ri-hashtag" copyable onCopy={handleCopy} />
            )}
            <InfoRow label={t("audit.csv.description")} value={log.detail} darkMode={darkMode} icon="ri-text-snippet" />
            <InfoRow label={t("auditDetail.quick.ip")} value={log.ip} mono darkMode={darkMode} icon="ri-global-line" copyable onCopy={handleCopy} />
            <InfoRow label={t("auditDetail.fields.browserDevice")} value={log.userAgent} darkMode={darkMode} icon="ri-computer-line" />
            <InfoRow label={t("auditDetail.fields.dateTime")} value={formatFullTime(log.timestamp)} darkMode={darkMode} icon="ri-calendar-event-line" />
            <InfoRow label={t("audit.csv.status")} value={statusLabel} darkMode={darkMode} icon="ri-checkbox-circle-line" />
          </div>
        </div>

        {/* Timeline / Related section */}
        <div className={`rounded-2xl overflow-hidden ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
          <div className={`px-6 py-4 border-b flex items-center gap-3 ${darkMode ? "border-[#2A3448]" : "border-gray-100"}`}>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-500/15">
              <i className="ri-time-line text-teal-400 text-sm"></i>
            </div>
            <h2 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{t("auditDetail.securityTitle")}</h2>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: "ri-shield-check-line",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                title: t("auditDetail.security.authTitle"),
                desc: log.action === "LOGIN" || log.action === "LOGOUT" ? t("auditDetail.security.authDirect") : t("auditDetail.security.authSession"),
              },
              {
                icon: "ri-map-pin-line",
                color: "text-teal-400",
                bg: "bg-teal-500/10",
                title: t("auditDetail.security.locationTitle"),
                desc: t("auditDetail.security.locationDesc", { ip: log.ip }),
              },
              {
                icon: "ri-device-line",
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                title: t("auditDetail.security.deviceTitle"),
                desc: log.userAgent,
              },
            ].map((item) => (
              <div key={item.title} className={`rounded-xl p-4 ${darkMode ? "bg-[#0F1117]" : "bg-gray-50"}`}>
                <div className={`w-9 h-9 flex items-center justify-center rounded-xl mb-3 ${item.bg}`}>
                  <i className={`${item.icon} text-lg ${item.color}`}></i>
                </div>
                <p className={`text-sm font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{item.title}</p>
                <p className={`text-xs leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/audit-logs")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors cursor-pointer whitespace-nowrap ${
              darkMode
                ? "border-[#2A3448] text-gray-400 hover:text-white hover:bg-[#1A2235]"
                : "border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <i className="ri-arrow-left-line text-sm"></i>
            <span>{t("common:buttons.back")}</span>
          </button>

          <button
            onClick={() => {
              const text = `${t("auditDetail.export.auditLog")}: ${log.id}\n${t("audit.csv.user")}: ${log.userName}\n${t("audit.csv.action")}: ${log.action}\n${t("audit.csv.resource")}: ${log.resource}\n${t("auditDetail.quick.time")}: ${formatFullTime(log.timestamp)}\n${t("auditDetail.quick.ip")}: ${log.ip}\n${t("audit.csv.status")}: ${statusLabel}\n${t("audit.csv.description")}: ${log.detail}`;
              void handleCopy(text);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-file-copy-line text-sm"></i>
            <span>{t("auditDetail.copyAll")}</span>
          </button>
        </div>
      </div>
  );
}

export default function AuditLogDetailPage() {
  const { t } = useTranslation("admin");
  const resolved = useResolvedAuditLog();
  const { log } = resolved;
  return (
    <MainLayout title={log ? t("auditDetail.pageTitle") : t("audit.title")}>
      <AuditLogDetailContent resolved={resolved} />
    </MainLayout>
  );
}
