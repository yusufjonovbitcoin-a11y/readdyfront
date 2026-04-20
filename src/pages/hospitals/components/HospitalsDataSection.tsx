import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Hospital } from "@/types";
import StatusChip from "@/components/ui/StatusChip";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { clampPage } from "@/utils/pagination";

type PageItem = number | string;

interface HospitalsDataSectionProps {
  darkMode: boolean;
  hospitals: Hospital[];
  filtered: Hospital[];
  pageRows: Hospital[];
  page: number;
  totalPages: number;
  pageSize: number;
  paginationItems: PageItem[];
  togglingHospitalIds: Set<string>;
  deletingHospitalId: string | null;
  onToggleStatus: (id: string) => void;
  onDeleteRequest: (id: string, trigger: HTMLElement | null) => void;
  onNavigateDetail: (id: string) => void;
  onPageChange: (next: number) => void;
}

export default function HospitalsDataSection({
  darkMode,
  hospitals,
  filtered,
  pageRows,
  page,
  totalPages,
  pageSize,
  paginationItems,
  togglingHospitalIds,
  deletingHospitalId,
  onToggleStatus,
  onDeleteRequest,
  onNavigateDetail,
  onPageChange,
}: HospitalsDataSectionProps) {
  const { t } = useTranslation("admin");
  const cardClass = `rounded-xl p-4 border ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`;

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t("common:stats.total"), value: hospitals.length, color: "text-white" },
          { label: t("common:status.active"), value: hospitals.filter((h) => h.status === "active").length, color: "text-emerald-400" },
          { label: t("common:status.inactive"), value: hospitals.filter((h) => h.status === "inactive").length, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 text-center ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 md:hidden">
        {pageRows.length === 0 ? (
          <div className={`${cardClass} text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("hospitals.empty")}</div>
        ) : (
          pageRows.map((h) => (
            <article key={h.id} className={cardClass}>
              <div className="flex items-start justify-between gap-3">
                <Link to={`/hospitals/${h.id}`} className="no-underline flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <i className="ri-hospital-line text-emerald-400 text-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{h.name}</p>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t("hospitals.table.adminPrefix")} {h.adminName}</p>
                  </div>
                </Link>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${h.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {h.status === "active" ? t("common:status.active") : t("common:status.inactive")}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>{t("hospitals.table.doctors")}: <span className={darkMode ? "text-gray-200" : "text-gray-700"}>{h.doctorsCount}</span></p>
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>{t("hospitals.table.dailyPatients")}: <span className={darkMode ? "text-gray-200" : "text-gray-700"}>{h.dailyPatients}</span></p>
                <p className={`col-span-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t("hospitals.table.address")}: <span className={darkMode ? "text-gray-200" : "text-gray-700"}>{h.address}</span></p>
              </div>
              <div className="mt-3 flex items-center justify-end gap-1">
                <button onClick={() => onNavigateDetail(h.id)} aria-label={`View hospital ${h.name}`} className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${darkMode ? "hover:bg-[#0F1117] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"}`} title={t("common:actions.view")}><i aria-hidden="true" className="ri-eye-line text-sm" /></button>
                <button onClick={() => onToggleStatus(h.id)} disabled={togglingHospitalIds.has(h.id)} aria-label={`Toggle hospital status for ${h.name}`} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${togglingHospitalIds.has(h.id) ? "" : "cursor-pointer"} ${darkMode ? "hover:bg-[#0F1117] text-gray-400 hover:text-yellow-400" : "hover:bg-gray-100 text-gray-400 hover:text-yellow-600"}`} title={t("common:actions.toggleStatus")}><i aria-hidden="true" className="ri-toggle-line text-sm" /></button>
                <button onClick={(e) => onDeleteRequest(h.id, e.currentTarget)} disabled={Boolean(deletingHospitalId)} aria-label={`Delete hospital ${h.name}`} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${deletingHospitalId ? "" : "cursor-pointer"} ${darkMode ? "hover:bg-red-500/20 text-gray-400 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`} title={t("common:buttons.delete")}><i aria-hidden="true" className="ri-delete-bin-line text-sm" /></button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className={`rounded-xl overflow-hidden ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
        <div className="hidden overflow-x-auto md:block">
          <ResponsiveTable minWidthClassName="min-w-[860px]" caption={t("titles.hospitals")}>
            <thead><tr className={`${darkMode ? "bg-[#0F1117]" : "bg-gray-50"}`}>
              <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("hospitals.table.hospital")}</th>
              <th scope="col" className={`hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("hospitals.table.address")}</th>
              <th scope="col" className={`hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("hospitals.table.phone")}</th>
              <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("hospitals.table.doctors")}</th>
              <th scope="col" className={`hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("hospitals.table.dailyPatients")}</th>
              <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("hospitals.table.status")}</th>
              <th scope="col" className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("hospitals.table.actions")}</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className={`px-4 py-12 text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("hospitals.empty")}</td></tr>
              ) : (
                pageRows.map((h, i) => (
                  <tr key={h.id} className={`border-t cursor-pointer transition-colors ${darkMode ? `border-[#1E2130] ${i % 2 === 0 ? "bg-[#1A2235]" : "bg-[#161D2E]"} hover:bg-[#1E2A3A]` : `border-gray-50 hover:bg-gray-50`}`}>
                    <td className="px-4 py-3.5"><Link to={`/hospitals/${h.id}`} className="no-underline flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"><div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0"><i className="ri-hospital-line text-emerald-400 text-sm" /></div><div><p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{h.name}</p><p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("hospitals.table.adminPrefix")} {h.adminName}</p></div></Link></td>
                    <td className="hidden md:table-cell px-4 py-3.5"><p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{h.address}</p></td>
                    <td className="hidden lg:table-cell px-4 py-3.5"><p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{h.phone}</p></td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-1.5"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-stethoscope-line text-emerald-400 text-sm" /></div><span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{h.doctorsCount}</span></div></td>
                    <td className="hidden sm:table-cell px-4 py-3.5"><div className="flex items-center gap-1.5"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-user-heart-line text-blue-400 text-sm" /></div><span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{h.dailyPatients}</span></div></td>
                    <td className="px-4 py-3.5"><StatusChip label={h.status === "active" ? t("common:status.active") : t("common:status.inactive")} tone={h.status === "active" ? "success" : "danger"} darkMode={darkMode} /></td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-1">
                      <button onClick={() => onNavigateDetail(h.id)} aria-label={`View hospital ${h.name}`} className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${darkMode ? "hover:bg-[#0F1117] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"}`} title={t("common:actions.view")}><i aria-hidden="true" className="ri-eye-line text-sm" /></button>
                      <button onClick={() => onToggleStatus(h.id)} disabled={togglingHospitalIds.has(h.id)} aria-label={`Toggle hospital status for ${h.name}`} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${togglingHospitalIds.has(h.id) ? "" : "cursor-pointer"} ${darkMode ? "hover:bg-[#0F1117] text-gray-400 hover:text-yellow-400" : "hover:bg-gray-100 text-gray-400 hover:text-yellow-600"}`} title={t("common:actions.toggleStatus")}><i aria-hidden="true" className="ri-toggle-line text-sm" /></button>
                      <button onClick={(e) => onDeleteRequest(h.id, e.currentTarget)} disabled={Boolean(deletingHospitalId)} aria-label={`Delete hospital ${h.name}`} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${deletingHospitalId ? "" : "cursor-pointer"} ${darkMode ? "hover:bg-red-500/20 text-gray-400 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`} title={t("common:buttons.delete")}><i aria-hidden="true" className="ri-delete-bin-line text-sm" /></button>
                    </div></td>
                  </tr>
                ))
              )}
            </tbody>
          </ResponsiveTable>
        </div>
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-3 border-t ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {filtered.length === 0 ? t("hospitals.pagination.totalZero") : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} / ${filtered.length}`}
          </p>
          {filtered.length > 0 && (
            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button type="button" aria-label="Go to previous hospitals page" disabled={page <= 1} onClick={() => onPageChange(clampPage(page - 1, totalPages))} className={`w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors ${page <= 1 ? darkMode ? "text-gray-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed" : darkMode ? "text-gray-400 hover:bg-[#1E2A3A] cursor-pointer" : "text-gray-500 hover:bg-gray-100 cursor-pointer"}`}><i aria-hidden="true" className="ri-arrow-left-s-line" /></button>
              <span className={`sm:hidden px-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{page} / {totalPages}</span>
              <div className="hidden sm:flex items-center gap-1">
                {paginationItems.map((item, idx) => typeof item === "number" ? (
                  <button key={`page-${item}`} type="button" onClick={() => onPageChange(item)} aria-label={`Go to hospitals page ${item}`} aria-current={item === page ? "page" : undefined} className={`w-7 h-7 flex items-center justify-center rounded-md text-xs cursor-pointer transition-colors ${item === page ? "bg-emerald-500 text-white" : darkMode ? "text-gray-400 hover:bg-[#1E2A3A]" : "text-gray-500 hover:bg-gray-100"}`}>{item}</button>
                ) : (
                  <span key={`ellipsis-${idx}`} aria-hidden="true" className={`w-7 text-center text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>…</span>
                ))}
              </div>
              <button type="button" aria-label="Go to next hospitals page" disabled={page >= totalPages} onClick={() => onPageChange(clampPage(page + 1, totalPages))} className={`w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors ${page >= totalPages ? darkMode ? "text-gray-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed" : darkMode ? "text-gray-400 hover:bg-[#1E2A3A] cursor-pointer" : "text-gray-500 hover:bg-gray-100 cursor-pointer"}`}><i aria-hidden="true" className="ri-arrow-right-s-line" /></button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
