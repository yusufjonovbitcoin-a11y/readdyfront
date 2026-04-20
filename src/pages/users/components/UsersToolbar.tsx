import { useTranslation } from "react-i18next";
import type { Dispatch, SetStateAction } from "react";

type RoleFilter = "all" | "HOSPITAL_ADMIN" | "DOCTOR";

interface UsersToolbarProps {
  darkMode: boolean;
  search: string;
  roleFilter: RoleFilter;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: Dispatch<SetStateAction<RoleFilter>>;
  onAddClick: () => void;
}

export default function UsersToolbar({
  darkMode,
  search,
  roleFilter,
  onSearchChange,
  onRoleFilterChange,
  onAddClick,
}: UsersToolbarProps) {
  const { t } = useTranslation("admin");

  return (
    <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center min-w-0 gap-3">
      <div
        className={`flex min-w-0 w-full md:w-auto md:flex-1 items-center gap-2 px-3 py-2.5 rounded-lg ${
          darkMode ? "bg-[#1A2235]" : "bg-white border border-gray-200"
        }`}
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <i className={`ri-search-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
        </div>
        <input
          className={`min-w-0 flex-1 bg-transparent text-sm outline-none ${
            darkMode ? "text-white placeholder-gray-600" : "text-gray-900 placeholder-gray-400"
          }`}
          placeholder={t("users.search")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div
        className={`flex max-w-full overflow-x-auto items-center gap-1 p-1 rounded-lg ${
          darkMode ? "bg-[#1A2235]" : "bg-gray-100"
        }`}
      >
        {(["all", "HOSPITAL_ADMIN", "DOCTOR"] as RoleFilter[]).map((r) => (
          <button
            key={r}
            onClick={() => onRoleFilterChange(r)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              roleFilter === r
                ? "bg-emerald-500 text-white"
                : darkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {r === "all" ? t("common:filters.all") : r === "HOSPITAL_ADMIN" ? t("users.roles.admins") : t("users.roles.doctors")}
          </button>
        ))}
      </div>

      <button
        onClick={onAddClick}
        className="md:ml-auto flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 cursor-pointer transition-colors whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-user-add-line text-base" />
        </div>
        {t("users.add")}
      </button>
    </div>
  );
}
