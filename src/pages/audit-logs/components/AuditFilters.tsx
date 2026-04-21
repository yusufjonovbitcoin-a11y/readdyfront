import type { AuditAction, AuditResource } from "@/api/types/audit.types";

interface AuditFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  roleFilter: string;
  onRoleChange: (v: string) => void;
  actionFilter: string;
  onActionChange: (v: string) => void;
  resourceFilter: string;
  onResourceChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  onReset: () => void;
  darkMode: boolean;
}

const ACTIONS: AuditAction[] = ["LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT", "SETTINGS_CHANGE", "PASSWORD_CHANGE", "ROLE_CHANGE"];
const RESOURCES: AuditResource[] = ["AUTH", "DOCTOR", "PATIENT", "HOSPITAL", "USER", "QUESTION", "ANALYTICS", "SETTINGS"];

export default function AuditFilters({
  search, onSearchChange,
  roleFilter, onRoleChange,
  actionFilter, onActionChange,
  resourceFilter, onResourceChange,
  statusFilter, onStatusChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
  onReset,
  darkMode,
}: AuditFiltersProps) {
  const inputCls = `w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
    darkMode
      ? "bg-[#1A2235] border-[#2A3448] text-white placeholder-gray-500"
      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
  }`;

  const selectCls = `w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
    darkMode
      ? "bg-[#1A2235] border-[#2A3448] text-white"
      : "bg-white border-gray-200 text-gray-900"
  }`;

  return (
    <div className={`rounded-xl p-4 mb-4 ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
            <i className="ri-search-line text-gray-400 text-sm"></i>
          </div>
          <input
            id="audit-filter-search"
            aria-label="Qidiruv"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Foydalanuvchi, IP, tavsif bo'yicha qidirish..."
            className={`${inputCls} pl-9`}
          />
        </div>

        {/* Date From */}
        <input
          id="audit-filter-date-from"
          aria-label="Sana dan"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className={inputCls}
        />

        {/* Date To */}
        <input
          id="audit-filter-date-to"
          aria-label="Sana gacha"
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Role */}
        <select id="audit-filter-role" aria-label="Rol" value={roleFilter} onChange={(e) => onRoleChange(e.target.value)} className={selectCls}>
          <option value="">Barcha rollar</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="HOSPITAL_ADMIN">Hospital Admin</option>
          <option value="DOCTOR">Doctor</option>
        </select>

        {/* Action */}
        <select id="audit-filter-action" aria-label="Amal" value={actionFilter} onChange={(e) => onActionChange(e.target.value)} className={selectCls}>
          <option value="">Barcha amallar</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {/* Resource */}
        <select id="audit-filter-resource" aria-label="Resurs" value={resourceFilter} onChange={(e) => onResourceChange(e.target.value)} className={selectCls}>
          <option value="">Barcha resurslar</option>
          {RESOURCES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Status */}
        <select id="audit-filter-status" aria-label="Status" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} className={selectCls}>
          <option value="">Barcha statuslar</option>
          <option value="success">Muvaffaqiyatli</option>
          <option value="failed">Muvaffaqiyatsiz</option>
          <option value="warning">Ogohlantirish</option>
        </select>

        {/* Reset */}
        <button
          onClick={onReset}
          className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
            darkMode
              ? "border-[#2A3448] text-gray-400 hover:text-white hover:bg-[#0F1117]"
              : "border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <i className="ri-refresh-line text-sm"></i>
          <span>Tozalash</span>
        </button>
      </div>
    </div>
  );
}
