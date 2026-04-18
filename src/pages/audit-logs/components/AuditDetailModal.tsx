import { AuditLog } from "@/mocks/audit_logs";

interface AuditDetailModalProps {
  log: AuditLog | null;
  onClose: () => void;
  darkMode: boolean;
}

const STATUS_CONFIG: Record<string, { icon: string; cls: string; label: string }> = {
  success: { icon: "ri-checkbox-circle-fill", cls: "text-emerald-500", label: "Muvaffaqiyatli" },
  failed: { icon: "ri-close-circle-fill", cls: "text-red-500", label: "Muvaffaqiyatsiz" },
  warning: { icon: "ri-alert-fill", cls: "text-amber-500", label: "Ogohlantirish" },
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  HOSPITAL_ADMIN: "Hospital Admin",
  DOCTOR: "Shifokor",
};

function formatTime(ts: string) {
  return new Date(ts).toLocaleString("uz-UZ", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function AuditDetailModal({ log, onClose, darkMode }: AuditDetailModalProps) {
  if (!log) return null;

  const statusCfg = STATUS_CONFIG[log.status];

  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: "Log ID", value: log.id, mono: true },
    { label: "Vaqt", value: formatTime(log.timestamp) },
    { label: "Foydalanuvchi", value: log.userName },
    { label: "Foydalanuvchi ID", value: log.userId, mono: true },
    { label: "Rol", value: ROLE_LABELS[log.role] },
    ...(log.hospitalName ? [{ label: "Kasalxona", value: log.hospitalName }] : []),
    { label: "Amal", value: log.action },
    { label: "Resurs", value: log.resource },
    ...(log.resourceId ? [{ label: "Resurs ID", value: log.resourceId, mono: true }] : []),
    { label: "Tavsif", value: log.detail },
    { label: "IP manzil", value: log.ip, mono: true },
    { label: "Brauzer / Qurilma", value: log.userAgent },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full max-w-lg rounded-2xl overflow-hidden ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? "border-[#2A3448]" : "border-gray-100"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${darkMode ? "bg-[#0F1117]" : "bg-gray-100"}`}>
              <i className="ri-file-list-3-line text-emerald-500 text-lg"></i>
            </div>
            <div>
              <h3 className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Audit Log Tafsiloti</h3>
              <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{log.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${
              darkMode ? "hover:bg-[#2A3448] text-gray-400" : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Status Banner */}
        <div className={`px-6 py-3 flex items-center gap-2 ${
          log.status === "success" ? "bg-emerald-500/10" :
          log.status === "failed" ? "bg-red-500/10" : "bg-amber-500/10"
        }`}>
          <div className="w-5 h-5 flex items-center justify-center">
            <i className={`${statusCfg.icon} text-lg ${statusCfg.cls}`}></i>
          </div>
          <span className={`text-sm font-semibold ${statusCfg.cls}`}>{statusCfg.label}</span>
        </div>

        {/* Details */}
        <div className="px-6 py-4 space-y-3 max-h-96 overflow-y-auto">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start gap-3">
              <span className={`text-xs font-medium w-36 flex-shrink-0 pt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                {row.label}
              </span>
              <span className={`text-sm flex-1 break-all ${
                row.mono ? "font-mono" : ""
              } ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-end ${darkMode ? "border-[#2A3448]" : "border-gray-100"}`}>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
