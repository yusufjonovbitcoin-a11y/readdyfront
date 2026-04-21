import { useTranslation } from "react-i18next";
import StatusChip from "@/components/ui/StatusChip";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import type { UserDto } from "@/api/types/users.types";
import { clampPage } from "@/utils/pagination";

type User = UserDto;
type PageItem = number | string;

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500/20 text-purple-400",
  HOSPITAL_ADMIN: "bg-blue-500/20 text-blue-400",
  DOCTOR: "bg-emerald-500/20 text-emerald-400",
  RECEPTION: "bg-orange-500/20 text-orange-400",
};

interface UsersDataSectionProps {
  darkMode: boolean;
  users: User[];
  filteredCount: number;
  pageRows: User[];
  page: number;
  totalPages: number;
  pageSize: number;
  paginationItems: PageItem[];
  isSavingUser: boolean;
  togglingUserIds: Set<string>;
  deletingUserId: string | null;
  onToggleStatus: (id: string) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onPageChange: (next: number) => void;
}

export default function UsersDataSection({
  darkMode,
  users,
  filteredCount,
  pageRows,
  page,
  totalPages,
  pageSize,
  paginationItems,
  isSavingUser,
  togglingUserIds,
  deletingUserId,
  onToggleStatus,
  onEditUser,
  onDeleteUser,
  onPageChange,
}: UsersDataSectionProps) {
  const { t } = useTranslation("admin");
  const start = (page - 1) * pageSize;
  const cardClass = `rounded-xl p-4 border ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t("common:stats.total"), value: users.length, color: "text-white" },
          { label: t("users.roles.admins"), value: users.filter((u) => u.role === "HOSPITAL_ADMIN").length, color: "text-blue-400" },
          { label: t("users.roles.doctors"), value: users.filter((u) => u.role === "DOCTOR").length, color: "text-emerald-400" },
          { label: t("common:status.active"), value: users.filter((u) => u.status === "active").length, color: "text-violet-400" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 text-center ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 md:hidden">
        {pageRows.length === 0 ? (
          <div className={`${cardClass} text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            Jami 0 ta foydalanuvchi
          </div>
        ) : (
          pageRows.map((u) => (
            <article key={u.id} className={cardClass}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${u.role === "HOSPITAL_ADMIN" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                    {u.avatar}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{u.name}</p>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{u.phone}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role] || "bg-gray-500/20 text-gray-400"}`}>{u.role}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Email: <span className={darkMode ? "text-gray-200" : "text-gray-700"}>{u.email || "-"}</span></p>
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>{t("users.form.hospitalLabel")}: <span className={darkMode ? "text-gray-200" : "text-gray-700"}>{u.hospitalName || "-"}</span></p>
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Last login: <span className={darkMode ? "text-gray-200" : "text-gray-700"}>{u.lastLogin}</span></p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    u.status === "active"
                      ? darkMode
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-emerald-500/20 text-emerald-700"
                      : darkMode
                        ? "bg-red-500/20 text-red-300"
                        : "bg-red-500/20 text-red-700"
                  }`}
                >
                  <i className={u.status === "active" ? "ri-checkbox-circle-line text-[11px]" : "ri-close-circle-line text-[11px]"} aria-hidden="true" />
                  {u.status === "active" ? t("common:status.active") : t("common:status.inactive")}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleStatus(u.id)}
                    disabled={togglingUserIds.has(u.id)}
                    aria-label={`Toggle user status for ${u.name}`}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${togglingUserIds.has(u.id) ? "" : "cursor-pointer"} ${darkMode ? "hover:bg-[#0F1117] text-gray-400 hover:text-yellow-400" : "hover:bg-gray-100 text-gray-400 hover:text-yellow-600"}`}
                    title={t("users.actions.toggleStatusTitle")}
                  >
                    <i aria-hidden="true" className="ri-toggle-line text-sm" />
                  </button>
                  <button
                    onClick={() => onEditUser(u)}
                    disabled={isSavingUser}
                    aria-label={`Edit user ${u.name}`}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isSavingUser ? "" : "cursor-pointer"} ${darkMode ? "hover:bg-[#0F1117] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"}`}
                    title={t("users.actions.editTitle")}
                  >
                    <i aria-hidden="true" className="ri-edit-line text-sm" />
                  </button>
                  <button
                    onClick={() => onDeleteUser(u.id)}
                    disabled={Boolean(deletingUserId)}
                    aria-label={`Delete user ${u.name}`}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${deletingUserId ? "" : "cursor-pointer"} ${darkMode ? "hover:bg-red-500/20 text-gray-400 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`}
                    title={t("users.actions.deleteTitle")}
                  >
                    <i aria-hidden="true" className="ri-delete-bin-line text-sm" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className={`rounded-xl overflow-hidden ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
        <div className="hidden overflow-x-auto md:block">
          <ResponsiveTable minWidthClassName="min-w-[820px]" caption={t("titles.users")}>
            <thead>
              <tr className={darkMode ? "bg-[#0F1117]" : "bg-gray-50"}>
                <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Foydalanuvchi</th>
                <th scope="col" className={`hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Telefon</th>
                <th scope="col" className={`hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Email</th>
                <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Rol</th>
                <th scope="col" className={`hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Kasalxona</th>
                <th scope="col" className={`hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>So'nggi kirish</th>
                <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Holat</th>
                <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((u, i) => (
                <tr key={u.id} className={`border-t ${darkMode ? "border-[#1E2130]" : "border-gray-50"} ${i % 2 === 0 ? darkMode ? "bg-[#1A2235]" : "" : darkMode ? "bg-[#161D2E]" : "bg-gray-50/50"}`}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${u.role === "HOSPITAL_ADMIN" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                        {u.avatar}
                      </div>
                      <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{u.name}</p>
                    </div>
                  </td>
                  <td className={`hidden sm:table-cell px-4 py-3.5 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{u.phone}</td>
                  <td className={`hidden md:table-cell px-4 py-3.5 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[u.role] || "bg-gray-500/20 text-gray-400"}`}>{u.role}</span>
                  </td>
                  <td className={`hidden lg:table-cell px-4 py-3.5 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    <span className="truncate max-w-[160px] block">{u.hospitalName}</span>
                  </td>
                  <td className={`hidden lg:table-cell px-4 py-3.5 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{u.lastLogin}</td>
                  <td className="px-4 py-3.5">
                    <StatusChip
                      label={u.status === "active" ? t("common:status.active") : t("common:status.inactive")}
                      tone={u.status === "active" ? "success" : "danger"}
                      darkMode={darkMode}
                      icon={<i className={u.status === "active" ? "ri-checkbox-circle-line text-[11px]" : "ri-close-circle-line text-[11px]"} aria-hidden="true" />}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleStatus(u.id)}
                        disabled={togglingUserIds.has(u.id)}
                        aria-label={`Toggle user status for ${u.name}`}
                        className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${togglingUserIds.has(u.id) ? "" : "cursor-pointer"} ${darkMode ? "hover:bg-[#0F1117] text-gray-400 hover:text-yellow-400" : "hover:bg-gray-100 text-gray-400 hover:text-yellow-600"}`}
                        title={t("users.actions.toggleStatusTitle")}
                      >
                        <i aria-hidden="true" className="ri-toggle-line text-sm" />
                      </button>
                      <button
                        onClick={() => onEditUser(u)}
                        disabled={isSavingUser}
                        aria-label={`Edit user ${u.name}`}
                        className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isSavingUser ? "" : "cursor-pointer"} ${darkMode ? "hover:bg-[#0F1117] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"}`}
                        title={t("users.actions.editTitle")}
                      >
                        <i aria-hidden="true" className="ri-edit-line text-sm" />
                      </button>
                      <button
                        onClick={() => onDeleteUser(u.id)}
                        disabled={Boolean(deletingUserId)}
                        aria-label={`Delete user ${u.name}`}
                        className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${deletingUserId ? "" : "cursor-pointer"} ${darkMode ? "hover:bg-red-500/20 text-gray-400 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`}
                        title={t("users.actions.deleteTitle")}
                      >
                        <i aria-hidden="true" className="ri-delete-bin-line text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </ResponsiveTable>
        </div>
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-3 border-t ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {filteredCount === 0 ? "Jami 0 ta foydalanuvchi" : `${start + 1}–${Math.min(start + pageSize, filteredCount)} / ${filteredCount} ta`}
          </p>
          {filteredCount > 0 && (
            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button
                type="button"
                aria-label="Go to previous users page"
                disabled={page <= 1}
                onClick={() => onPageChange(clampPage(page - 1, totalPages))}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-xs transition-colors ${page <= 1 ? darkMode ? "text-gray-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed" : darkMode ? "text-gray-400 hover:bg-[#1E2A3A] cursor-pointer" : "text-gray-500 hover:bg-gray-100 cursor-pointer"}`}
              >
                <i aria-hidden="true" className="ri-arrow-left-s-line" />
              </button>
              <span className={`sm:hidden px-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{page} / {totalPages}</span>
              <div className="hidden sm:flex items-center gap-1">
                {paginationItems.map((item, idx) =>
                  typeof item === "number" ? (
                    <button
                      key={`page-${item}`}
                      type="button"
                      onClick={() => onPageChange(item)}
                      aria-label={`Go to users page ${item}`}
                      aria-current={item === page ? "page" : undefined}
                      className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-xs cursor-pointer transition-colors ${item === page ? "bg-emerald-500 text-white" : darkMode ? "text-gray-400 hover:bg-[#1E2A3A]" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={`ellipsis-${idx}`} aria-hidden="true" className={`w-7 text-center text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>…</span>
                  ),
                )}
              </div>
              <button
                type="button"
                aria-label="Go to next users page"
                disabled={page >= totalPages}
                onClick={() => onPageChange(clampPage(page + 1, totalPages))}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-xs transition-colors ${page >= totalPages ? darkMode ? "text-gray-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed" : darkMode ? "text-gray-400 hover:bg-[#1E2A3A] cursor-pointer" : "text-gray-500 hover:bg-gray-100 cursor-pointer"}`}
              >
                <i aria-hidden="true" className="ri-arrow-right-s-line" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
