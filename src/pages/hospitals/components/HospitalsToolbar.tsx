import { useTranslation } from "react-i18next";

type StatusFilter = "all" | "active" | "inactive";

interface HospitalsToolbarProps {
  darkMode: boolean;
  search: string;
  statusFilter: StatusFilter;
  isAddingHospital: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onAddClick: () => void;
  addButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export default function HospitalsToolbar({
  darkMode,
  search,
  statusFilter,
  isAddingHospital,
  onSearchChange,
  onStatusFilterChange,
  onAddClick,
  addButtonRef,
}: HospitalsToolbarProps) {
  const { t } = useTranslation("admin");

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 min-w-0">
      <div className={`flex min-w-0 w-full lg:flex-1 items-center gap-2 px-3 py-2.5 rounded-lg ${darkMode ? "bg-[#1A2235]" : "bg-white border border-gray-200"}`}>
        <div className="w-4 h-4 flex items-center justify-center">
          <i className={`ri-search-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
        </div>
        <input
          className={`min-w-0 flex-1 bg-transparent text-sm outline-none ${darkMode ? "text-white placeholder-gray-600" : "text-gray-900 placeholder-gray-400"}`}
          placeholder={t("hospitals.searchPlaceholder")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className={`flex shrink-0 max-w-full overflow-x-auto items-center gap-1 p-1 rounded-lg ${darkMode ? "bg-[#1A2235]" : "bg-gray-100"}`}>
        {(["all", "active", "inactive"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStatusFilterChange(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
              statusFilter === s
                ? "bg-emerald-500 text-white"
                : darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {s === "all" ? t("common:filters.all") : s === "active" ? t("common:status.active") : t("common:status.inactive")}
          </button>
        ))}
      </div>

      <div className="lg:ml-auto shrink-0">
        <button
          ref={addButtonRef}
          onClick={onAddClick}
          disabled={isAddingHospital}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 cursor-pointer transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-add-line text-base" />
          </div>
          {t("hospitals.add")}
        </button>
      </div>
    </div>
  );
}
