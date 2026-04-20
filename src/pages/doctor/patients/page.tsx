import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DocLayout from "@/pages/doctor/components/DocLayout";
import PatientCard from "./components/PatientCard";
import PatientTableRow from "./components/PatientTableRow";
import QueueDraggableGrid from "./components/QueueDraggableGrid";
import type { DocPatient } from "@/mocks/doc_patients";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { useDocPatients } from "@/context/DocPatientsContext";
import { formatLocalYMD } from "@/utils/date";
import { layoutSystem } from "@/styles/layoutSystem";

type TabType = "queue" | "in_progress" | "completed";
const VALID_TABS: readonly TabType[] = ["queue", "in_progress", "completed"];

function resolveTab(tab: string | null): TabType | null {
  if (tab === "taxlil") return "in_progress";
  return tab !== null && (VALID_TABS as readonly string[]).includes(tab) ? (tab as TabType) : null;
}

export default function DocPatientsPage() {
  const { t } = useTranslation("doctor");
  return (
    <DocLayout title={t("titles.newPatients")}>
      <DocPatientsContent />
    </DocLayout>
  );
}

export function DocPatientsContent() {
  const { t } = useTranslation("doctor");
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "queue", label: t("patients.tabs.queue"), icon: "ri-time-line" },
    { id: "in_progress", label: t("patients.tabs.inProgress"), icon: "ri-flask-line" },
    { id: "completed", label: t("patients.tabs.completed"), icon: "ri-checkbox-circle-line" },
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [search, setSearch] = useState("");
  const { patients, transitionPatientStatus, reorderQueuePatients } = useDocPatients();
  const { darkMode } = useDoctorTheme();
  const rawTab = searchParams.get("tab");
  const activeTab: TabType = resolveTab(rawTab) ?? "queue";

  useEffect(() => {
    const resolved = resolveTab(rawTab);
    if (rawTab !== null && resolved === rawTab) return;
    const next = new URLSearchParams(searchParams);
    next.set("tab", resolved ?? "queue");
    setSearchParams(next, { replace: true });
  }, [rawTab, searchParams, setSearchParams]);

  const handleTabChange = (nextTab: TabType) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", nextTab);
    setSearchParams(next, { replace: true });
  };

  const todayStr = formatLocalYMD();
  const todayPatients = patients.filter((p) => p.date === todayStr);

  const searchLower = search.toLowerCase();
  const filtered = (() => {
    const list = todayPatients.filter(
      (p) => p.status === activeTab && p.name.toLowerCase().includes(searchLower)
    );
    if (activeTab === "queue") {
      return [...list].sort((a, b) => a.queueNumber - b.queueNumber);
    }
    return list;
  })();

  const canReorderQueueCards = activeTab === "queue" && !search.trim();

  const counts = {
    queue: todayPatients.filter((p) => p.status === "queue").length,
    in_progress: todayPatients.filter((p) => p.status === "in_progress").length,
    completed: todayPatients.filter((p) => p.status === "completed").length,
  };

  const handleStatusChange = (id: string, newStatus: DocPatient["status"]) => {
    transitionPatientStatus(id, newStatus);
  };

  const titleCls = darkMode ? "text-white" : "text-gray-900";
  const mutedCls = darkMode ? "text-gray-400" : "text-gray-500";
  const inputCls = darkMode
    ? "pl-9 pr-4 py-2 text-sm rounded-lg bg-[#0D1117] border border-[#30363D] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 w-52"
    : "pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-violet-400 w-52";
  const searchIconCls = darkMode ? "text-gray-500" : "text-gray-400";
  const segmentWrap = darkMode ? "bg-[#21262D]" : "bg-gray-100";
  const segmentBtnActive = darkMode ? "bg-[#30363D] shadow-sm text-violet-400" : "bg-white shadow-sm text-violet-600";
  const segmentBtnIdle = darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600";
  const tabsWrap = darkMode ? "bg-[#21262D]" : "bg-gray-100";
  const tabActive = darkMode ? "bg-[#30363D] text-violet-300 shadow-sm" : "bg-white text-violet-700 shadow-sm";
  const tabIdle = darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700";
  const tableWrap = darkMode ? "bg-[#21262D] border-[#30363D]" : "bg-white border-gray-100";
  const tableHeadBorder = darkMode ? "border-[#30363D]" : "border-gray-100";
  const thCls = darkMode ? "text-gray-400" : "text-gray-500";
  const tbodyDivide = darkMode ? "divide-[#30363D]" : "divide-gray-50";

  return (
      <div className={`min-w-0 ${layoutSystem.sectionStack}`}>
        <div className={`flex min-w-0 flex-wrap items-center justify-between ${layoutSystem.toolbarGap}`}>
          <div>
            <h2 className={`text-xl font-bold ${titleCls}`}>{t("patients.todayPatients")}</h2>
          </div>
          <div className="flex min-w-0 w-full sm:w-auto items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <i className={`ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm ${searchIconCls}`}></i>
              <input
                type="text"
                placeholder={t("patients.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls} w-full sm:w-52`}
              />
            </div>
            <div className={`flex shrink-0 items-center rounded-lg p-1 ${segmentWrap}`}>
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  viewMode === "card" ? segmentBtnActive : segmentBtnIdle
                }`}
                aria-label="Kartochka ko'rinishiga o'tish"
                aria-pressed={viewMode === "card"}
              >
                <i className="ri-layout-grid-line text-sm" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  viewMode === "table" ? segmentBtnActive : segmentBtnIdle
                }`}
                aria-label="Jadval ko'rinishiga o'tish"
                aria-pressed={viewMode === "table"}
              >
                <i className="ri-list-check text-sm" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>

        <div className={`flex max-w-full min-w-0 items-center gap-1 overflow-x-auto rounded-xl p-1 ${tabsWrap}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id ? tabActive : tabIdle
              }`}
            >
              <i className={`${tab.icon} text-sm`}></i>
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === tab.id
                    ? tab.id === "queue"
                      ? darkMode
                        ? "bg-violet-900/50 text-violet-300"
                        : "bg-violet-100 text-violet-700"
                      : tab.id === "in_progress"
                        ? darkMode
                          ? "bg-sky-900/40 text-sky-300"
                          : "bg-sky-100 text-sky-700"
                        : darkMode
                          ? "bg-emerald-900/40 text-emerald-300"
                          : "bg-green-100 text-green-700"
                    : darkMode
                      ? "bg-[#30363D] text-gray-400"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {canReorderQueueCards && viewMode === "card" && filtered.length > 1 && (
          <p className={`text-xs ${mutedCls}`}>
            {t("patients.reorderHint")}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${
                darkMode ? "bg-[#21262D]" : "bg-gray-100"
              }`}
            >
              <i className={`ri-user-heart-line text-2xl ${darkMode ? "text-gray-500" : "text-gray-400"}`}></i>
            </div>
            <p className={`font-medium ${mutedCls}`}>{t("patients.empty.title")}</p>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {activeTab === "queue"
                ? t("patients.empty.queue")
                : activeTab === "in_progress"
                  ? t("patients.empty.inProgress")
                  : t("patients.empty.completed")}
            </p>
          </div>
        ) : viewMode === "card" ? (
          canReorderQueueCards ? (
            <QueueDraggableGrid
              patients={filtered}
              darkMode={darkMode}
              onReorder={reorderQueuePatients}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  darkMode={darkMode}
                />
              ))}
            </div>
          )
        ) : (
          <div className={`rounded-xl border overflow-hidden ${tableWrap}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className={`border-b ${tableHeadBorder}`}>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Bemor</th>
                    <th className={`hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Telefon</th>
                    <th className={`hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Yosh</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Xavf</th>
                    <th className={`hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Vaqt</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Amal</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tbodyDivide}`}>
                  {filtered.map((patient) => (
                    <PatientTableRow
                      key={patient.id}
                      patient={patient}
                      darkMode={darkMode}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
  );
}
