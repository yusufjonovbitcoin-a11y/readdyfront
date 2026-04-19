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

type TabType = "queue" | "in_progress" | "completed";

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: "queue", label: "Navbat", icon: "ri-time-line" },
  { id: "in_progress", label: "Taxlil", icon: "ri-flask-line" },
  { id: "completed", label: "Tugallandi", icon: "ri-checkbox-circle-line" },
];

export default function DocPatientsPage() {
  return (
    <DocLayout title="Yangi Bemorlar">
      <DocPatientsContent />
    </DocLayout>
  );
}

function DocPatientsContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("queue");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [search, setSearch] = useState("");
  const { patients, updatePatient, reorderQueuePatients } = useDocPatients();
  const { darkMode } = useDoctorTheme();

  useEffect(() => {
    if (searchParams.get("tab") === "taxlil") {
      setActiveTab("in_progress");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
    updatePatient(id, { status: newStatus });
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
      <div className="min-w-0 space-y-5">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={`text-xl font-bold ${titleCls}`}>Bugungi Bemorlar</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <i className={`ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm ${searchIconCls}`}></i>
              <input
                type="text"
                placeholder="Bemor qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className={`flex items-center rounded-lg p-1 ${segmentWrap}`}>
              <button
                onClick={() => setViewMode("card")}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  viewMode === "card" ? segmentBtnActive : segmentBtnIdle
                }`}
              >
                <i className="ri-layout-grid-line text-sm"></i>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  viewMode === "table" ? segmentBtnActive : segmentBtnIdle
                }`}
              >
                <i className="ri-list-check text-sm"></i>
              </button>
            </div>
          </div>
        </div>

        <div className={`flex max-w-full min-w-0 items-center gap-1 overflow-x-auto rounded-xl p-1 ${tabsWrap}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
            Navbat tartibini o&apos;zgartirish: kartani ushlab sudrang.
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
            <p className={`font-medium ${mutedCls}`}>Bemor topilmadi</p>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {activeTab === "queue"
                ? "Navbatda hech kim yo'q"
                : activeTab === "in_progress"
                  ? "Taxlilda bemor yo'q — navbatdan tahlilga yuboring"
                  : "Tugallangan ko'rik yo'q"}
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
            <table className="w-full">
              <thead>
                <tr className={`border-b ${tableHeadBorder}`}>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Bemor</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Telefon</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Yosh</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Xavf</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Vaqt</th>
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
        )}
      </div>
  );
}
