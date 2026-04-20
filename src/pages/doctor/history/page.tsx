import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { useDocPatients } from "@/context/DocPatientsContext";
import type { RiskLevel } from "@/mocks/doc_patients";

export default function DocHistoryPage() {
  const { t } = useTranslation("doctor");
  return (
    <DocLayout title={t("sidebar.history")}>
      <DocHistoryContent />
    </DocLayout>
  );
}

export function DocHistoryContent() {
  const { t } = useTranslation("doctor");
  const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string }> = {
    low: { label: t("history.risk.low"), color: "text-green-600", bg: "bg-green-100" },
    medium: { label: t("history.risk.medium"), color: "text-amber-600", bg: "bg-amber-100" },
    high: { label: t("history.risk.high"), color: "text-orange-600", bg: "bg-orange-100" },
    critical: { label: t("history.risk.critical"), color: "text-red-600", bg: "bg-red-100" },
  };
  const { darkMode } = useDoctorTheme();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const pageTitle = darkMode ? "text-white" : "text-gray-900";
  const pageMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const cardBase = darkMode ? "bg-[#161B22] border border-[#30363D]" : "bg-white border border-gray-100";
  const inputBase = darkMode
    ? "text-sm border border-[#30363D] rounded-lg px-3 py-2 bg-[#0D1117] text-white focus:outline-none focus:border-violet-500 cursor-pointer"
    : "text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-violet-400 cursor-pointer";
  const searchInput = darkMode
    ? "pl-9 pr-4 py-2 text-sm border border-[#30363D] rounded-lg bg-[#0D1117] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 w-48"
    : "pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-violet-400 w-48";
  const segmentWrap = darkMode ? "bg-[#21262D]" : "bg-gray-100";
  const segmentActive = darkMode ? "bg-[#30363D] shadow-sm text-violet-300" : "bg-white shadow-sm text-violet-600";
  const segmentIdle = darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600";
  const diagBox = darkMode ? "bg-[#21262D]" : "bg-gray-50";
  const tableWrap = darkMode ? "bg-[#161B22] border-[#30363D]" : "bg-white border-gray-100";
  const thCls = darkMode ? "text-gray-400" : "text-gray-500";
  const tbodyDivide = darkMode ? "divide-[#30363D]" : "divide-gray-50";
  const rowHover = darkMode ? "hover:bg-[#21262D]" : "hover:bg-gray-50";
  const linkCls = darkMode ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700";

  const { patients } = useDocPatients();
  const historyPatients = patients.filter((p) => p.status === "history" || p.status === "completed");

  const matchesDateFilter = (date: string) => {
    if (dateFilter === "all") return true;
    const [y, m, d] = date.split("-").map(Number);
    const itemDate = new Date(y, (m ?? 1) - 1, d ?? 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateFilter === "today") {
      return itemDate.getTime() === today.getTime();
    }
    if (dateFilter === "week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 6);
      return itemDate >= weekStart && itemDate <= today;
    }
    if (dateFilter === "month") {
      return itemDate.getFullYear() === today.getFullYear() && itemDate.getMonth() === today.getMonth();
    }
    return true;
  };

  const filtered = historyPatients.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) || p.diagnosis.toLowerCase().includes(search.toLowerCase());
    return matchSearch && matchesDateFilter(p.date);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className={`text-xl font-bold ${pageTitle}`}>{t("history.title")}</h2>
          <p className={`text-sm mt-0.5 ${pageMuted}`}>{t("history.subtitle")} {historyPatients.length}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={inputBase}>
            <option value="all">{t("history.filters.allTime")}</option>
            <option value="today">{t("history.filters.today")}</option>
            <option value="week">{t("history.filters.week")}</option>
            <option value="month">{t("history.filters.month")}</option>
          </select>
          <div className="relative">
            <i className={`ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}></i>
            <input
              type="text"
              placeholder={t("history.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={searchInput}
            />
          </div>
          <div className={`flex items-center rounded-lg p-1 ${segmentWrap}`}>
            <button
              onClick={() => setViewMode("card")}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                viewMode === "card" ? segmentActive : segmentIdle
              }`}
            >
              <i className="ri-layout-grid-line text-sm"></i>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                viewMode === "table" ? segmentActive : segmentIdle
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
          <div key={i} className={`rounded-xl p-4 flex items-center gap-3 ${cardBase}`}>
            <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${stat.bg}`}>
              <i className={`${stat.icon} text-lg ${stat.color}`}></i>
            </div>
            <div>
              <p className={`text-xl font-bold ${pageTitle}`}>{stat.value}</p>
              <p className={`text-xs ${pageMuted}`}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${darkMode ? "bg-[#21262D]" : "bg-gray-100"}`}>
            <i className={`ri-history-line text-2xl ${darkMode ? "text-gray-500" : "text-gray-400"}`}></i>
          </div>
          <p className={`font-medium ${pageMuted}`}>{t("history.empty")}</p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((patient) => {
            const risk = riskConfig[patient.riskLevel];
            return (
              <div
                key={patient.id}
                className={`rounded-xl p-4 transition-all ${cardBase} ${
                  darkMode ? "hover:border-violet-500/40" : "hover:border-violet-200"
                }`}
              >
                <Link
                  to={`/doctor/patients/${patient.id}`}
                  className={`block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
                    darkMode ? "focus-visible:ring-offset-[#0D1117]" : "focus-visible:ring-offset-white"
                  }`}
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
                      <h3 className={`text-sm font-semibold ${pageTitle}`}>{patient.name}</h3>
                      <p className={`text-xs ${pageMuted}`}>
                        {patient.age} yosh • {patient.phone}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${risk.bg} ${risk.color}`}>{risk.label}</span>
                </div>

                {patient.diagnosis && (
                  <div className={`mb-3 p-2.5 rounded-lg ${diagBox}`}>
                    <p className={`text-xs mb-0.5 ${pageMuted}`}>{t("history.diagnosis")}</p>
                    <p className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{patient.diagnosis}</p>
                  </div>
                )}

                {patient.notes && (
                  <p className={`text-xs mb-3 line-clamp-2 ${pageMuted}`}>{patient.notes}</p>
                )}

                <div className={`flex items-center justify-between pt-3 border-t ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className={`ri-calendar-line text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}></i>
                    </div>
                    <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{patient.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className={`ri-timer-line text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}></i>
                    </div>
                    <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{patient.consultationDuration} daq</span>
                  </div>
                </div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden ${tableWrap}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className={`border-b ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Bemor</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Tashxis</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Xavf</th>
                  <th className={`hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Vaqt</th>
                  <th className={`hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Sana</th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${thCls}`}>Amal</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${tbodyDivide}`}>
                {filtered.map((patient) => {
                  const risk = riskConfig[patient.riskLevel];
                  return (
                    <tr
                      key={patient.id}
                      className={`transition-colors ${rowHover}`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/doctor/patients/${patient.id}`}
                          className={`inline-block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
                            darkMode ? "focus-visible:ring-offset-[#0D1117]" : "focus-visible:ring-offset-white"
                          }`}
                        >
                          <p className={`text-sm font-medium ${pageTitle}`}>{patient.name}</p>
                          <p className={`text-xs ${pageMuted}`}>
                            {patient.age} yosh • {patient.phone}
                          </p>
                        </Link>
                      </td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{patient.diagnosis || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${risk.bg} ${risk.color}`}>{risk.label}</span>
                      </td>
                      <td className={`hidden sm:table-cell px-4 py-3 text-sm ${pageMuted}`}>{patient.consultationDuration} daq</td>
                      <td className={`hidden md:table-cell px-4 py-3 text-sm ${pageMuted}`}>{patient.date}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/doctor/patients/${patient.id}`);
                          }}
                          className={`text-xs font-medium cursor-pointer whitespace-nowrap ${linkCls}`}
                        >
                          {t("common:actions.view")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
