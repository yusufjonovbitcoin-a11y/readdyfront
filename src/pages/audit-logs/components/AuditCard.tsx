import { useNavigate } from "react-router-dom";
import { AuditLog } from "@/mocks/audit_logs";

interface AuditCardProps {
  log: AuditLog;
  darkMode: boolean;
}

const ACTION_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  LOGIN: { bg: "bg-emerald-500/15", text: "text-emerald-400", icon: "ri-login-box-line" },
  LOGOUT: { bg: "bg-gray-500/15", text: "text-gray-400", icon: "ri-logout-box-line" },
  CREATE: { bg: "bg-teal-500/15", text: "text-teal-400", icon: "ri-add-circle-line" },
  UPDATE: { bg: "bg-amber-500/15", text: "text-amber-400", icon: "ri-edit-line" },
  DELETE: { bg: "bg-red-500/15", text: "text-red-400", icon: "ri-delete-bin-line" },
  VIEW: { bg: "bg-sky-500/15", text: "text-sky-400", icon: "ri-eye-line" },
  EXPORT: { bg: "bg-indigo-500/15", text: "text-indigo-400", icon: "ri-download-2-line" },
  SETTINGS_CHANGE: { bg: "bg-orange-500/15", text: "text-orange-400", icon: "ri-settings-3-line" },
  PASSWORD_CHANGE: { bg: "bg-pink-500/15", text: "text-pink-400", icon: "ri-lock-password-line" },
  ROLE_CHANGE: { bg: "bg-violet-500/15", text: "text-violet-400", icon: "ri-shield-user-line" },
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "text-emerald-400",
  HOSPITAL_ADMIN: "text-teal-400",
  DOCTOR: "text-violet-400",
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  HOSPITAL_ADMIN: "Hospital Admin",
  DOCTOR: "Shifokor",
};

const STATUS_CONFIG: Record<string, { icon: string; cls: string; label: string; bg: string }> = {
  success: { icon: "ri-checkbox-circle-fill", cls: "text-emerald-400", label: "Muvaffaqiyatli", bg: "bg-emerald-500/10" },
  failed: { icon: "ri-close-circle-fill", cls: "text-red-400", label: "Muvaffaqiyatsiz", bg: "bg-red-500/10" },
  warning: { icon: "ri-alert-fill", cls: "text-amber-400", label: "Ogohlantirish", bg: "bg-amber-500/10" },
};

function formatTime(ts: string) {
  const d = new Date(ts);
  return {
    date: d.toLocaleDateString("uz-UZ", { year: "numeric", month: "short", day: "numeric" }),
    time: d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

export default function AuditCard({ log, darkMode }: AuditCardProps) {
  const navigate = useNavigate();
  const actionCfg = ACTION_COLORS[log.action] || { bg: "bg-gray-500/15", text: "text-gray-400", icon: "ri-question-line" };
  const statusCfg = STATUS_CONFIG[log.status];
  const { date, time } = formatTime(log.timestamp);

  const avatarColor =
    log.role === "SUPER_ADMIN" ? "bg-emerald-500" :
    log.role === "HOSPITAL_ADMIN" ? "bg-teal-500" : "bg-violet-500";

  const initials = log.userName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div
      onClick={() => navigate(`/audit-logs/${log.id}`)}
      className={`rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01] border ${
        darkMode
          ? "bg-[#1A2235] border-[#2A3448] hover:border-emerald-500/40"
          : "bg-white border-gray-100 hover:border-emerald-300"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white ${avatarColor}`}>
            {initials}
          </div>
          <div>
            <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{log.userName}</p>
            <p className={`text-xs font-medium ${ROLE_COLORS[log.role]}`}>{ROLE_LABELS[log.role]}</p>
          </div>
        </div>

        {/* Status badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusCfg.bg}`}>
          <div className="w-3.5 h-3.5 flex items-center justify-center">
            <i className={`${statusCfg.icon} text-xs ${statusCfg.cls}`}></i>
          </div>
          <span className={`text-xs font-semibold ${statusCfg.cls}`}>{statusCfg.label}</span>
        </div>
      </div>

      {/* Action + Resource */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${actionCfg.bg}`}>
          <div className="w-3.5 h-3.5 flex items-center justify-center">
            <i className={`${actionCfg.icon} text-xs ${actionCfg.text}`}></i>
          </div>
          <span className={`text-xs font-bold ${actionCfg.text}`}>{log.action}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-gray-500 flex-shrink-0"></div>
        <span className={`text-xs font-mono ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {log.resource}{log.resourceId ? ` #${log.resourceId}` : ""}
        </span>
      </div>

      {/* Detail */}
      <p className={`text-xs leading-relaxed mb-3 line-clamp-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
        {log.detail}
      </p>

      {/* Bottom row */}
      <div className={`flex items-center justify-between pt-3 border-t ${darkMode ? "border-[#2A3448]" : "border-gray-100"}`}>
        <div className="flex items-center gap-3">
          {/* IP */}
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className={`ri-global-line text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}></i>
            </div>
            <span className={`text-xs font-mono ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{log.ip}</span>
          </div>
          {/* Hospital */}
          {log.hospitalName && (
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 flex items-center justify-center">
                <i className={`ri-hospital-line text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}></i>
              </div>
              <span className={`text-xs truncate max-w-[120px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{log.hospitalName}</span>
            </div>
          )}
        </div>

        {/* Time */}
        <div className="text-right">
          <p className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{time}</p>
          <p className={`text-xs ${darkMode ? "text-gray-600" : "text-gray-400"}`}>{date}</p>
        </div>
      </div>
    </div>
  );
}
