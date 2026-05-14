import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Hospital } from "@/types";
import StatusChip from "@/components/ui/StatusChip";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { clampPage } from "@/utils/pagination";

function capitalizeRegionLabel(raw: string): string {
  const s = raw.trim();
  if (!s) return "—";
  return s.charAt(0).toLocaleUpperCase() + s.slice(1).toLocaleLowerCase();
}

/** Viloyat maydoni bo‘lsa undan; bo‘lmasa manzil matnidan (masalan, bir qatorli kiritilgan) */
function regionDisplayName(h: Hospital): string {
  const v = h.viloyat?.trim();
  if (v) return capitalizeRegionLabel(v);
  return capitalizeRegionLabel(h.address);
}

type PageItem = number | string;

interface HospitalsDataSectionProps {
  darkMode: boolean;
  viewMode: "card" | "table";
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
  viewMode,
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
  const cardClass = `rounded-xl p-4 border ${darkMode ? "bg-[#21262D] border-[#30363D]" : "bg-white border-gray-100"}`;
  const hospitalCardShell = darkMode
    ? "group flex h-full flex-col overflow-hidden rounded-2xl border border-[#30363D] bg-[#21262D] shadow-lg shadow-black/20 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[#484f58] hover:shadow-xl hover:shadow-black/25"
    : "group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md";
  const cardSectionBorder = darkMode ? "border-[#30363D]" : "border-gray-100";
  const statTile = darkMode
    ? "rounded-xl border border-[#30363D] bg-[#0F1117]/80 p-3"
    : "rounded-xl border border-gray-100 bg-gray-50/90 p-3";

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t("common:stats.total"), value: hospitals.length, color: "text-white" },
          { label: t("common:status.active"), value: hospitals.filter((h) => h.status === "active").length, color: "text-emerald-400" },
          { label: t("common:status.inactive"), value: hospitals.filter((h) => h.status === "inactive").length, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 text-center ${darkMode ? "bg-[#21262D]" : "bg-white"}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {viewMode === "card" ? (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
        {pageRows.length === 0 ? (
          <div className={`sm:col-span-2 xl:col-span-3 ${cardClass} py-10 text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("hospitals.empty")}</div>
        ) : (
          pageRows.map((h) => (
            <article key={h.id} className={hospitalCardShell}>
              <div className={`border-b px-4 py-4 sm:px-5 sm:py-4 ${cardSectionBorder}`}>
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/hospitals/${h.id}`} className="no-underline flex min-w-0 flex-1 items-center gap-3 rounded-lg outline-none ring-emerald-500/0 transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-emerald-500/40">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/25">
                      <i className="ri-hospital-line text-lg text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-base font-semibold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>{h.name}</p>
                      <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                        <span className={`shrink-0 text-xs font-medium ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                          {t("hospitals.table.adminPrefix")}
                        </span>
                        <span className={`min-w-0 truncate text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                          {h.adminName?.trim() || "—"}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <span
                    className={`inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      h.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {h.status === "active" ? t("common:status.active") : t("common:status.inactive")}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 px-4 py-4 sm:px-5 sm:py-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className={statTile}>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <i className="ri-stethoscope-line text-base" aria-hidden />
                      <span className={`text-lg font-semibold tabular-nums ${darkMode ? "text-white" : "text-gray-900"}`}>{h.doctorsCount}</span>
                    </div>
                    <p className={`mt-1 text-[11px] font-medium uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      {t("hospitals.table.doctors")}
                    </p>
                  </div>
                  <div className={statTile}>
                    <div className="flex items-center gap-1.5 text-blue-400">
                      <i className="ri-user-heart-line text-base" aria-hidden />
                      <span className={`text-lg font-semibold tabular-nums ${darkMode ? "text-white" : "text-gray-900"}`}>{h.dailyPatients}</span>
                    </div>
                    <p className={`mt-1 text-[11px] font-medium uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      {t("hospitals.table.dailyPatients")}
                    </p>
                  </div>
                </div>
                <div className={statTile}>
                  <div className="flex gap-2">
                    <i className="ri-map-2-line mt-0.5 flex-shrink-0 text-emerald-400/90" aria-hidden />
                    <div className="min-w-0">
                      <p className={`text-[11px] font-medium uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                        {t("hospitals.table.viloyat")}
                      </p>
                      <p className={`mt-0.5 text-sm font-semibold leading-snug ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                        {regionDisplayName(h)}
                      </p>
                      {h.viloyat?.trim() ? (
                        <p className={`mt-2 text-[11px] font-medium uppercase tracking-wide ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                          {t("hospitals.table.address")}
                        </p>
                      ) : null}
                      {h.viloyat?.trim() ? (
                        <p className={`mt-0.5 text-sm leading-snug ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{h.address}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                {h.phone ? (
                  <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${darkMode ? "border-[#30363D] bg-[#0F1117]/50 text-gray-300" : "border-gray-100 bg-white text-gray-600"}`}>
                    <i className="ri-phone-line flex-shrink-0 text-emerald-500/90" aria-hidden />
                    <span className="min-w-0 truncate">{h.phone}</span>
                  </div>
                ) : null}
              </div>

              <div className={`mt-auto flex items-center justify-end gap-0.5 border-t px-2 py-2 sm:px-3 ${cardSectionBorder}`}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateDetail(h.id);
                  }}
                  aria-label={`View hospital ${h.name}`}
                  className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg transition-colors ${darkMode ? "text-gray-400 hover:bg-[#0F1117] hover:text-white" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}
                  title={t("common:actions.view")}
                >
                  <i aria-hidden="true" className="ri-eye-line text-base" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(h.id);
                  }}
                  disabled={togglingHospitalIds.has(h.id)}
                  aria-label={`Toggle hospital status for ${h.name}`}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${togglingHospitalIds.has(h.id) ? "" : "cursor-pointer"} ${darkMode ? "text-gray-400 hover:bg-[#0F1117] hover:text-yellow-400" : "text-gray-400 hover:bg-gray-100 hover:text-yellow-600"}`}
                  title={t("common:actions.toggleStatus")}
                >
                  <i aria-hidden="true" className="ri-toggle-line text-base" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRequest(h.id, e.currentTarget);
                  }}
                  disabled={Boolean(deletingHospitalId)}
                  aria-label={`Delete hospital ${h.name}`}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${deletingHospitalId ? "" : "cursor-pointer"} ${darkMode ? "text-gray-400 hover:bg-red-500/20 hover:text-red-400" : "text-gray-400 hover:bg-red-50 hover:text-red-500"}`}
                  title={t("common:buttons.delete")}
                >
                  <i aria-hidden="true" className="ri-delete-bin-line text-base" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
      ) : null}

      {viewMode === "table" ? (
      <div className={`rounded-xl overflow-hidden ${darkMode ? "bg-[#21262D]" : "bg-white"}`}>
        <div className="overflow-x-auto">
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
                  <tr
                    key={h.id}
                    className={`border-t cursor-pointer transition-colors ${darkMode ? `border-[#30363D] ${i % 2 === 0 ? "bg-[#21262D]" : "bg-[#0F1117]"} hover:bg-[#30363D]/50` : `border-gray-50 hover:bg-gray-50`}`}
                    onClick={() => onNavigateDetail(h.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onNavigateDetail(h.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open hospital ${h.name}`}
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        to={`/hospitals/${h.id}`}
                        className="no-underline flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                          <i className="ri-hospital-line text-sm text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{h.name}</p>
                          <div className="mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                            <span className={`shrink-0 text-xs font-medium ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                              {t("hospitals.table.adminPrefix")}
                            </span>
                            <span className={`min-w-0 truncate text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                              {h.adminName?.trim() || "—"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3.5"><p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{h.address}</p></td>
                    <td className="hidden lg:table-cell px-4 py-3.5"><p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{h.phone}</p></td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-1.5"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-stethoscope-line text-emerald-400 text-sm" /></div><span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{h.doctorsCount}</span></div></td>
                    <td className="hidden sm:table-cell px-4 py-3.5"><div className="flex items-center gap-1.5"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-user-heart-line text-blue-400 text-sm" /></div><span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{h.dailyPatients}</span></div></td>
                    <td className="px-4 py-3.5"><StatusChip label={h.status === "active" ? t("common:status.active") : t("common:status.inactive")} tone={h.status === "active" ? "success" : "danger"} darkMode={darkMode} /></td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); onNavigateDetail(h.id); }} aria-label={`View hospital ${h.name}`} className={`w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${darkMode ? "hover:bg-[#0F1117] text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"}`} title={t("common:actions.view")}><i aria-hidden="true" className="ri-eye-line text-sm" /></button>
                      <button onClick={(e) => { e.stopPropagation(); onToggleStatus(h.id); }} disabled={togglingHospitalIds.has(h.id)} aria-label={`Toggle hospital status for ${h.name}`} className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${togglingHospitalIds.has(h.id) ? "" : "cursor-pointer"} ${darkMode ? "hover:bg-[#0F1117] text-gray-400 hover:text-yellow-400" : "hover:bg-gray-100 text-gray-400 hover:text-yellow-600"}`} title={t("common:actions.toggleStatus")}><i aria-hidden="true" className="ri-toggle-line text-sm" /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteRequest(h.id, e.currentTarget); }} disabled={Boolean(deletingHospitalId)} aria-label={`Delete hospital ${h.name}`} className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${deletingHospitalId ? "" : "cursor-pointer"} ${darkMode ? "hover:bg-red-500/20 text-gray-400 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`} title={t("common:buttons.delete")}><i aria-hidden="true" className="ri-delete-bin-line text-sm" /></button>
                    </div></td>
                  </tr>
                ))
              )}
            </tbody>
          </ResponsiveTable>
        </div>
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-3 border-t ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {filtered.length === 0 ? t("hospitals.pagination.totalZero") : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} / ${filtered.length}`}
          </p>
          {filtered.length > 0 && (
            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button type="button" aria-label="Go to previous hospitals page" disabled={page <= 1} onClick={() => onPageChange(clampPage(page - 1, totalPages))} className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-xs transition-colors ${page <= 1 ? darkMode ? "text-gray-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed" : darkMode ? "text-gray-400 hover:bg-[#30363D]/50 cursor-pointer" : "text-gray-500 hover:bg-gray-100 cursor-pointer"}`}><i aria-hidden="true" className="ri-arrow-left-s-line" /></button>
              <span className={`sm:hidden px-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{page} / {totalPages}</span>
              <div className="hidden sm:flex items-center gap-1">
                {paginationItems.map((item, idx) => typeof item === "number" ? (
                  <button key={`page-${item}`} type="button" onClick={() => onPageChange(item)} aria-label={`Go to hospitals page ${item}`} aria-current={item === page ? "page" : undefined} className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-xs cursor-pointer transition-colors ${item === page ? "bg-emerald-500 text-white" : darkMode ? "text-gray-400 hover:bg-[#30363D]/50" : "text-gray-500 hover:bg-gray-100"}`}>{item}</button>
                ) : (
                  <span key={`ellipsis-${idx}`} aria-hidden="true" className={`w-7 text-center text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>…</span>
                ))}
              </div>
              <button type="button" aria-label="Go to next hospitals page" disabled={page >= totalPages} onClick={() => onPageChange(clampPage(page + 1, totalPages))} className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-xs transition-colors ${page >= totalPages ? darkMode ? "text-gray-600 cursor-not-allowed" : "text-gray-300 cursor-not-allowed" : darkMode ? "text-gray-400 hover:bg-[#30363D]/50 cursor-pointer" : "text-gray-500 hover:bg-gray-100 cursor-pointer"}`}><i aria-hidden="true" className="ri-arrow-right-s-line" /></button>
            </div>
          )}
        </div>
      </div>
      ) : null}
    </>
  );
}
