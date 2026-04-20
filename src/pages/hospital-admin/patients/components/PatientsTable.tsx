import type { HAPatient } from "@/mocks/ha_patients";
import StatusChip from "@/components/ui/StatusChip";
import ResponsiveTable from "@/components/ui/ResponsiveTable";

interface PatientsTableProps {
  darkMode: boolean;
  cardClass: string;
  paginated: HAPatient[];
  poolCount: number;
  filteredCount: number;
  statusCounts: { active: number; scheduled: number; discharged: number };
  filterStatus: "all" | "active" | "scheduled" | "discharged";
  setFilterStatus: (status: "all" | "active" | "scheduled" | "discharged") => void;
  setPage: (value: number | ((prev: number) => number)) => void;
  page: number;
  perPage: number;
  totalPages: number;
  onEdit: (patient: HAPatient) => void;
  onDelete: (id: string) => void;
  onOpenDischargeDetail: (patient: HAPatient) => void;
  t: (key: string) => string;
}

type PageItem = number | "ellipsis-left" | "ellipsis-right";

function getWindowedPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);
  if (currentPage <= 3) {
    start = 2;
    end = 4;
  } else if (currentPage >= totalPages - 2) {
    start = totalPages - 3;
    end = totalPages - 1;
  }

  const items: PageItem[] = [1];
  if (start > 2) items.push("ellipsis-left");
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < totalPages - 1) items.push("ellipsis-right");
  items.push(totalPages);
  return items;
}

export default function PatientsTable({
  darkMode,
  cardClass,
  paginated,
  poolCount,
  filteredCount,
  statusCounts,
  filterStatus,
  setFilterStatus,
  setPage,
  page,
  perPage,
  totalPages,
  onEdit,
  onDelete,
  onOpenDischargeDetail,
  t,
}: PatientsTableProps) {
  const statusLabel = (s: string) => s === "active" ? t("common:status.active") : s === "scheduled" ? t("patients.status.scheduled") : t("patients.status.discharged");
  const statusColor = (s: string) => s === "active" ? "bg-teal-50 text-teal-700" : s === "scheduled" ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-600";
  const statusTone = (s: string): "success" | "info" | "neutral" =>
    s === "active" ? "success" : s === "scheduled" ? "info" : "neutral";
  const paginationItems = getWindowedPageItems(page, totalPages);

  const statusPillInteractive = (s: "active" | "scheduled" | "discharged") => {
    const selected = filterStatus === s;
    const base = darkMode
      ? s === "active"
        ? "bg-teal-500/15 text-teal-300"
        : s === "scheduled"
          ? "bg-indigo-500/15 text-indigo-300"
          : "bg-gray-500/20 text-gray-300"
      : statusColor(s);
    return `${base} ${selected ? (darkMode ? "ring-2 ring-teal-400" : "ring-2 ring-teal-600 ring-offset-2 ring-offset-white") : ""}`;
  };

  return (
    <>
      <div className="flex items-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={() => {
            setFilterStatus("all");
            setPage(1);
          }}
          className={`text-sm rounded-lg px-2 py-1 -mx-2 transition-colors cursor-pointer text-left border-0 ${
            filterStatus === "all"
              ? darkMode
                ? "text-white bg-white/10 ring-2 ring-teal-500/50"
                : "text-gray-900 bg-gray-100 ring-2 ring-teal-500/40"
              : darkMode
                ? "text-gray-400 hover:text-white hover:bg-white/5"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Jami: <strong className={darkMode ? "text-white" : "text-gray-900"}>{poolCount}</strong> ta bemor
        </button>
        {(["active", "scheduled", "discharged"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setFilterStatus(s);
              setPage(1);
            }}
            className={`text-xs px-2 py-0.5 rounded-full cursor-pointer border-0 transition-all hover:opacity-90 ${statusPillInteractive(s)}`}
          >
            {statusLabel(s)}: {statusCounts[s]}
          </button>
        ))}
      </div>

      <div className="space-y-3 md:hidden">
        {paginated.length === 0 ? (
          <div className={`${cardClass} text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {t("patients.empty")}
          </div>
        ) : (
          paginated.map((p) => (
            <article key={p.id} className={cardClass}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${p.gender === "female" ? "bg-pink-100" : "bg-teal-100"}`}>
                    <span className={`text-xs font-bold ${p.gender === "female" ? "text-pink-700" : "text-teal-700"}`}>{p.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{p.name}</p>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{p.phone}</p>
                  </div>
                </div>
                <StatusChip label={statusLabel(p.status)} tone={statusTone(p.status)} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Yosh/Jins: <span className={darkMode ? "text-gray-200" : "text-gray-700"}>{p.age} / {p.gender === "male" ? "Erkak" : "Ayol"}</span></p>
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Shifokor: <span className={darkMode ? "text-gray-200" : "text-gray-700"}>{p.doctorName}</span></p>
                <p className={`col-span-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tashxis: <span className={darkMode ? "text-gray-200" : "text-gray-700"}>{p.diagnosis}</span></p>
              </div>
              <div className="mt-3 flex items-center justify-end gap-1">
                {p.status === "discharged" && (
                  <button
                    type="button"
                    title="AI tahlil, shifokor yozuvi va savol-javoblar"
                    aria-label={`View patient ${p.name}`}
                    onClick={() => onOpenDischargeDetail(p)}
                    className={`h-10 px-3 flex items-center gap-1 rounded-md cursor-pointer text-xs font-medium transition-colors ${darkMode ? "bg-teal-500/15 text-teal-400 hover:bg-teal-500/25" : "bg-teal-50 text-teal-700 hover:bg-teal-100"}`}
                  >
                    <i className="ri-eye-line text-sm" aria-hidden="true"></i>
                    <span>Ko‘rish</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onEdit(p)}
                  className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition-colors ${darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                  aria-label={`Edit patient ${p.name}`}
                >
                  <i className="ri-edit-line text-sm" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(p.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-md cursor-pointer hover:bg-red-50 text-red-500 transition-colors"
                  aria-label={`Delete patient ${p.name}`}
                >
                  <i className="ri-delete-bin-line text-sm" aria-hidden="true"></i>
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`}>
        <div className="hidden overflow-x-auto md:block">
          <ResponsiveTable minWidthClassName="min-w-[760px]" caption="Hospital admin patients table">
            <thead>
              <tr className={`text-xs border-b ${darkMode ? "border-[#1E2130] text-gray-400" : "border-gray-100 text-gray-500"}`}>
                <th scope="col" className="text-left px-5 py-3 font-medium">Bemor</th>
                <th scope="col" className="hidden sm:table-cell text-left px-5 py-3 font-medium">Yosh / Jins</th>
                <th scope="col" className="hidden md:table-cell text-left px-5 py-3 font-medium">Shifokor</th>
                <th scope="col" className="hidden lg:table-cell text-left px-5 py-3 font-medium">Tashxis</th>
                <th scope="col" className="hidden lg:table-cell text-left px-5 py-3 font-medium">So'nggi tashrif</th>
                <th scope="col" className="text-left px-5 py-3 font-medium">Holat</th>
                <th scope="col" className="text-left px-5 py-3 font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p.id} className={`border-b last:border-0 transition-colors ${darkMode ? "border-[#1E2130] hover:bg-[#1A2235]" : "border-gray-50 hover:bg-gray-50"}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${p.gender === "female" ? "bg-pink-100" : "bg-teal-100"}`}>
                        <span className={`text-xs font-bold ${p.gender === "female" ? "text-pink-700" : "text-teal-700"}`}>{p.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{p.name}</p>
                        <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{p.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`hidden sm:table-cell px-5 py-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {p.age} yosh / {p.gender === "male" ? "Erkak" : "Ayol"}
                  </td>
                  <td className={`hidden md:table-cell px-5 py-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{p.doctorName}</td>
                  <td className={`hidden lg:table-cell px-5 py-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{p.diagnosis}</td>
                  <td className={`hidden lg:table-cell px-5 py-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{p.lastVisit}</td>
                  <td className="px-5 py-3">
                    <StatusChip label={statusLabel(p.status)} tone={statusTone(p.status)} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      {p.status === "discharged" && (
                        <button
                          type="button"
                          title="AI tahlil, shifokor yozuvi va savol-javoblar"
                          aria-label={`View patient ${p.name}`}
                          onClick={() => onOpenDischargeDetail(p)}
                          className={`h-10 px-3 flex items-center gap-1 rounded-md cursor-pointer text-xs font-medium transition-colors ${darkMode ? "bg-teal-500/15 text-teal-400 hover:bg-teal-500/25" : "bg-teal-50 text-teal-700 hover:bg-teal-100"}`}
                        >
                          <i className="ri-eye-line text-sm" aria-hidden="true"></i>
                          <span className="hidden sm:inline">Ko‘rish</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        aria-label={`Edit patient ${p.name}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition-colors ${darkMode ? "hover:bg-[#1E2A3A] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                      >
                        <i className="ri-edit-line text-sm" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p.id)}
                        aria-label={`Delete patient ${p.name}`}
                        className="w-10 h-10 flex items-center justify-center rounded-md cursor-pointer hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <i className="ri-delete-bin-line text-sm" aria-hidden="true"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className={`px-5 py-12 text-center text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {t("patients.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </ResponsiveTable>
        </div>

        {totalPages > 1 && (
          <div className={`flex items-center justify-between px-5 py-3 border-t ${darkMode ? "border-[#1E2130]" : "border-gray-100"}`}>
            <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, filteredCount)} / {filteredCount}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={`w-10 h-10 flex items-center justify-center rounded-md text-sm cursor-pointer disabled:opacity-40 ${darkMode ? "hover:bg-[#1A2235] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <span className={`sm:hidden px-2 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {page} / {totalPages}
              </span>
              <div className="hidden sm:flex items-center gap-1">
                {paginationItems.map((item) =>
                  typeof item === "number" ? (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      aria-label={`Go to patients page ${item}`}
                      aria-current={item === page ? "page" : undefined}
                      className={`w-10 h-10 flex items-center justify-center rounded-md text-xs cursor-pointer ${item === page ? "bg-teal-500 text-white" : darkMode ? "text-gray-400 hover:bg-[#1A2235]" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={item} aria-hidden="true" className={`w-10 text-center text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                      …
                    </span>
                  ),
                )}
              </div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={`w-10 h-10 flex items-center justify-center rounded-md text-sm cursor-pointer disabled:opacity-40 ${darkMode ? "hover:bg-[#1A2235] text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
