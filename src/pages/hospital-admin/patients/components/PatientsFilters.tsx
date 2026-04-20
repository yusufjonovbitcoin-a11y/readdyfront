type StatusFilter = "all" | "active" | "discharged" | "scheduled";
type GenderFilter = "all" | "male" | "female";

interface PatientsFiltersProps {
  darkMode: boolean;
  inputClass: string;
  search: string;
  onSearchChange: (value: string) => void;
  filterStatus: StatusFilter;
  onFilterStatusChange: (value: StatusFilter) => void;
  filterGender: GenderFilter;
  onFilterGenderChange: (value: GenderFilter) => void;
  filterDoctor: string;
  onFilterDoctorChange: (value: string) => void;
  doctorOptions: Array<{ id: string; name: string }>;
  t: (key: string) => string;
}

export default function PatientsFilters({
  darkMode,
  inputClass,
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterGender,
  onFilterGenderChange,
  filterDoctor,
  onFilterDoctorChange,
  doctorOptions,
  t,
}: PatientsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
          <i className={`ri-search-line text-sm ${darkMode ? "text-gray-400" : "text-gray-400"}`}></i>
        </div>
        <input
          type="text"
          placeholder={t("patients.search")}
          className={`${inputClass} pl-9 w-56`}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select className={inputClass} value={filterStatus} onChange={(e) => onFilterStatusChange(e.target.value as StatusFilter)}>
        <option value="all">{t("patients.filters.allStatuses")}</option>
        <option value="active">{t("common:status.active")}</option>
        <option value="scheduled">{t("patients.status.scheduled")}</option>
        <option value="discharged">{t("patients.status.discharged")}</option>
      </select>
      <select className={inputClass} value={filterGender} onChange={(e) => onFilterGenderChange(e.target.value as GenderFilter)}>
        <option value="all">Barcha jins</option>
        <option value="male">Erkak</option>
        <option value="female">Ayol</option>
      </select>
      <select className={inputClass} value={filterDoctor} onChange={(e) => onFilterDoctorChange(e.target.value)}>
        <option value="all">Barcha shifokorlar</option>
        {doctorOptions.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
    </div>
  );
}
