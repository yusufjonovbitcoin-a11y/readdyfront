import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { docPatients, type RiskLevel } from "@/mocks/doc_patients";

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  low: { label: "Past", color: "text-green-600", bg: "bg-green-100" },
  medium: { label: "O'rta", color: "text-amber-600", bg: "bg-amber-100" },
  high: { label: "Yuqori", color: "text-orange-600", bg: "bg-orange-100" },
  critical: { label: "Kritik", color: "text-red-600", bg: "bg-red-100" },
};

export default function DocHistoryPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const historyPatients = docPatients.filter((p) => p.status === "history");

  const filtered = historyPatients.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <DocLayout title="Tarix">
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bemorlar Tarixi</h2>
            <p className="text-sm text-gray-500 mt-0.5">Jami {historyPatients.length} ta arxivlangan bemor</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-violet-400 cursor-pointer"
            >
              <option value="all">Barcha vaqt</option>
              <option value="today">Bugun</option>
              <option value="week">Bu hafta</option>
              <option value="month">Bu oy</option>
            </select>
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder="Qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-violet-400 w-48"
              />
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("card")}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  viewMode === "card" ? "bg-white shadow-sm text-violet-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <i className="ri-layout-grid-line text-sm"></i>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                  viewMode === "table" ? "bg-white shadow-sm text-violet-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <i className="ri-list-check text-sm"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Jami bemorlar", value: historyPatients.length, icon: "ri-user-heart-line", color: "text-violet-600", bg: "bg-violet-50" },
            { label: "O'rtacha vaqt", value: "19 daq", icon: "ri-timer-line", color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Tashxislar", value: historyPatients.filter((p) => p.diagnosis).length, icon: "ri-stethoscope-line", color: "text-green-600", bg: "bg-green-50" },
            {
              label: "Yuqori xavf",
              value: historyPatients.filter((p) => p.riskLevel === "high" || p.riskLevel === "critical").length,
              icon: "ri-alarm-warning-line",
              color: "text-red-600",
              bg: "bg-red-50",
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${stat.bg}`}>
                <i className={`${stat.icon} text-lg ${stat.color}`}></i>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
              <i className="ri-history-line text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-500 font-medium">Tarix topilmadi</p>
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((patient) => {
              const risk = riskConfig[patient.riskLevel];
              return (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                  className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:border-violet-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          patient.gender === "male" ? "bg-blue-100" : "bg-pink-100"
                        }`}
                      >
                        <i
                          className={`ri-user-3-line text-base ${patient.gender === "male" ? "text-blue-600" : "text-pink-600"}`}
                        ></i>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{patient.name}</h3>
                        <p className="text-xs text-gray-500">
                          {patient.age} yosh • {patient.phone}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${risk.bg} ${risk.color}`}>{risk.label}</span>
                  </div>

                  {patient.diagnosis && (
                    <div className="mb-3 p-2.5 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-0.5">Tashxis</p>
                      <p className="text-sm font-medium text-gray-800">{patient.diagnosis}</p>
                    </div>
                  )}

                  {patient.notes && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{patient.notes}</p>}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-calendar-line text-xs text-gray-400"></i>
                      </div>
                      <span className="text-xs text-gray-400">{patient.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-timer-line text-xs text-gray-400"></i>
                      </div>
                      <span className="text-xs text-gray-400">{patient.consultationDuration} daq</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Bemor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tashxis</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Xavf</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vaqt</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Sana</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((patient) => {
                  const risk = riskConfig[patient.riskLevel];
                  return (
                    <tr
                      key={patient.id}
                      onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-500">
                            {patient.age} yosh • {patient.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{patient.diagnosis || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${risk.bg} ${risk.color}`}>{risk.label}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{patient.consultationDuration} daq</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{patient.date}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/doctor/patients/${patient.id}`);
                          }}
                          className="text-xs text-violet-600 font-medium hover:text-violet-700 cursor-pointer whitespace-nowrap"
                        >
                          Ko'rish
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DocLayout>
  );
}
