import { useTranslation } from "react-i18next";
import { useId, useMemo, useState } from "react";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import {
  getHaAnalyticsBundle,
} from "@/api/services/haAnalytics.service";
import { getHADoctors, getHAPatients } from "@/api/services/hospitalAdminData.service";
import { usePageState } from "@/hooks/usePageState";
import { layoutSystem } from "@/styles/layoutSystem";

type FlowPeriod = "daily" | "weekly" | "monthly";

function StatCard({ icon, label, value, sub, color, darkMode }: {
  icon: string; label: string; value: string | number; sub: string; color: string; darkMode: boolean;
}) {
  return (
    <div className={`rounded-xl ${layoutSystem.cardPadding} ${darkMode ? "bg-[#141824] border border-[#1E2130]" : "bg-white border border-gray-100"}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
          <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{value}</p>
          <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{sub}</p>
        </div>
        <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${color}`}>
          <i className={`${icon} text-white text-lg`}></i>
        </div>
      </div>
    </div>
  );
}

function FlowBarChart({ data, darkMode }: { data: { label: string; patients: number }[]; darkMode: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.patients), 1);

  return (
    <div className="flex items-end gap-1 sm:gap-1.5 min-h-[88px] pt-1">
      {data.map((d, i) => {
        const isSel = selected === i;
        const isHover = hovered === i;
        const showValue = isHover || isSel;
        const barH = (d.patients / max) * 56;
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-1 flex-1 min-w-0"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="h-[22px] flex items-end justify-center w-full">
              {showValue ? (
                <span
                  className={`text-[11px] font-semibold tabular-nums leading-none ${
                    darkMode ? "text-teal-300" : "text-teal-600"
                  }`}
                >
                  {d.patients.toLocaleString("uz-UZ")}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setSelected(isSel ? null : i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected((s) => (s === i ? null : i));
                }
              }}
              className="flex flex-col items-center w-full max-w-[40px] mx-auto group cursor-pointer p-0 border-0 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 rounded-sm"
              aria-label={`${d.label}: ${d.patients} bemor`}
              aria-pressed={isSel}
            >
              <div
                className={`w-full max-w-[36px] mx-auto rounded-sm transition-all ${
                  showValue
                    ? darkMode
                      ? "bg-teal-400 shadow-[0_0_0_2px_rgba(45,212,191,0.35)]"
                      : "bg-teal-500 shadow-[0_0_0_2px_rgba(20,184,166,0.35)]"
                    : "bg-teal-500/80 group-hover:bg-teal-500 group-hover:opacity-95"
                }`}
                style={{ height: `${barH}px`, minHeight: barH > 0 ? 4 : 0 }}
              />
            </button>
            <span
              className={`text-[8px] sm:text-[9px] truncate w-full text-center leading-tight pointer-events-none ${
                darkMode ? "text-gray-500" : "text-gray-400"
              } ${showValue ? (darkMode ? "text-gray-300" : "text-gray-600") : ""}`}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MonthlyChart({ data, darkMode }: { data: { month: string; patients: number }[]; darkMode: boolean }) {
  const gradId = useId().replace(/:/g, "");
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const max = Math.max(...data.map((d) => d.patients), 1);
  const width = 960;
  const height = 200;
  const padding = { left: 52, right: 28, top: 44, bottom: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const denom = Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: padding.left + (i / denom) * chartW,
    y: padding.top + chartH - (d.patients / max) * chartH,
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const labelFill = darkMode ? "#6b7280" : "#9ca3af";
  const valueFill = darkMode ? "#5eead4" : "#0d9488";
  const dotStroke = darkMode ? "#2dd4bf" : "#14b8a6";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full min-w-0 select-none"
      style={{ height: 200, minHeight: 200 }}
      role="img"
      aria-label="Yillik bemor dinamikasi grafigi, nuqtalarni bosing yoki ustiga keltiring"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke="#14b8a6" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => {
        const showValue = hovered !== null ? hovered === i : selected === i;
        return (
          <g
            key={i}
            className="cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setSelected((s) => (s === i ? null : i))}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered((current) => (current === i ? null : current))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelected((s) => (s === i ? null : i));
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${p.month}: ${p.patients.toLocaleString("uz-UZ")} bemor`}
            aria-pressed={selected === i}
          >
            <title>{`${p.month}: ${p.patients.toLocaleString("uz-UZ")} bemor`}</title>
            {showValue && (
              <text
                x={p.x}
                y={p.y - 16}
                textAnchor="middle"
                fontSize="15"
                fontWeight="600"
                fill={valueFill}
                style={{ pointerEvents: "none" }}
              >
                {p.patients.toLocaleString("uz-UZ")}
              </text>
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={20}
              fill="transparent"
              style={{ pointerEvents: "all" }}
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={showValue ? 6.5 : 4.5}
              fill={darkMode ? "#0f1117" : "#ffffff"}
              stroke={dotStroke}
              strokeWidth={showValue ? 3 : 2.25}
              style={{ pointerEvents: "none" }}
            />
            <text
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              fontSize="13"
              fill={showValue ? valueFill : labelFill}
              fontWeight={showValue ? 600 : 500}
              style={{ pointerEvents: "none" }}
            >
              {p.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function HADashboardPage() {
  const { t } = useTranslation("hospital");
  return (
    <HALayout title={t("titles.dashboard")}>
      <HADashboardContent />
    </HALayout>
  );
}

export function HADashboardContent() {
  const { t } = useTranslation("hospital");
  const darkMode = useHospitalAdminDarkMode();
  const doctorsState = usePageState(getHADoctors);
  const patientsState = usePageState(getHAPatients);
  const analyticsState = usePageState(getHaAnalyticsBundle);
  const haDoctors = doctorsState.data ?? [];
  const haPatients = patientsState.data ?? [];
  const haAnalyticsDailyData = analyticsState.data?.daily ?? [];
  const haAnalyticsWeeklyData = analyticsState.data?.weekly ?? [];
  const haAnalyticsMonthlyData = analyticsState.data?.monthly ?? [];
  const haDoctorPerformance = analyticsState.data?.doctorPerformance ?? [];
  const [flowPeriod, setFlowPeriod] = useState<FlowPeriod>("daily");

  const flowChartData = useMemo(() => {
    if (flowPeriod === "daily") {
      return haAnalyticsDailyData.map((d) => ({ label: d.day, patients: d.patients }));
    }
    if (flowPeriod === "weekly") {
      return haAnalyticsWeeklyData.map((d) => ({ label: d.week, patients: d.patients }));
    }
    return haAnalyticsMonthlyData.map((d) => ({ label: d.month, patients: d.patients }));
  }, [flowPeriod, haAnalyticsDailyData, haAnalyticsMonthlyData, haAnalyticsWeeklyData]);

  const flowSubtitle =
    flowPeriod === "daily"
      ? t("dashboard.flow.subtitle.daily")
      : flowPeriod === "weekly"
        ? t("dashboard.flow.subtitle.weekly")
        : t("dashboard.flow.subtitle.monthly");

  const summaryStats = useMemo(() => {
    const activeDoctors = haDoctors.filter((doctor) => doctor.status === "active").length;
    const todayTotal = haDoctors.reduce((sum, doctor) => sum + doctor.todayPatients, 0);
    const weeklyTotal = haAnalyticsDailyData.reduce((sum, row) => sum + row.patients, 0);
    const monthlyTotal = haAnalyticsMonthlyData[3]?.patients ?? 0;
    return { activeDoctors, todayTotal, weeklyTotal, monthlyTotal };
  }, [haAnalyticsDailyData, haAnalyticsMonthlyData, haDoctors]);

  const topDoctors = useMemo(() => haDoctorPerformance.slice(0, 4), [haDoctorPerformance]);
  const recentPatients = useMemo(() => haPatients.slice(0, 5), [haPatients]);

  const periodTabs: { key: FlowPeriod; label: string }[] = [
    { key: "daily", label: t("dashboard.flow.period.daily") },
    { key: "weekly", label: t("dashboard.flow.period.weekly") },
    { key: "monthly", label: t("dashboard.flow.period.monthly") },
  ];

  if (
    doctorsState.status === "loading" ||
    patientsState.status === "loading" ||
    analyticsState.status === "loading"
  ) {
    return (
      <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-[#141824] border border-[#1E2130] text-gray-400" : "bg-white border border-gray-100 text-gray-500"}`}>
        Yuklanmoqda...
      </div>
    );
  }

  if (
    doctorsState.status === "error" ||
    patientsState.status === "error" ||
    analyticsState.status === "error"
  ) {
    return (
      <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-[#141824] border border-[#1E2130] text-gray-300" : "bg-white border border-gray-100 text-gray-700"}`}>
        <p className="mb-4">
          {doctorsState.error ??
            patientsState.error ??
            analyticsState.error}
        </p>
        <button
          type="button"
          onClick={() => {
            void doctorsState.reload();
            void patientsState.reload();
            void analyticsState.reload();
          }}
          className="min-h-[44px] px-4 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium"
        >
          Qayta yuklash
        </button>
      </div>
    );
  }

  return (
      <div className={layoutSystem.pageStack}>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="ri-user-heart-line" label={t("dashboard.stats.todayPatients.label")} value={summaryStats.todayTotal} sub={t("dashboard.stats.todayPatients.sub")} color="bg-teal-500" darkMode={darkMode} />
          <StatCard icon="ri-calendar-check-line" label={t("dashboard.stats.weeklyPatients.label")} value={summaryStats.weeklyTotal} sub={t("dashboard.stats.weeklyPatients.sub")} color="bg-indigo-500" darkMode={darkMode} />
          <StatCard icon="ri-bar-chart-line" label={t("dashboard.stats.monthlyPatients.label")} value={summaryStats.monthlyTotal} sub={t("dashboard.stats.monthlyPatients.sub")} color="bg-amber-500" darkMode={darkMode} />
          <StatCard icon="ri-stethoscope-line" label={t("dashboard.stats.activeDoctors.label")} value={summaryStats.activeDoctors} sub={t("dashboard.stats.activeDoctors.sub", { total: haDoctors.length })} color="bg-emerald-500" darkMode={darkMode} />
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-3 ${layoutSystem.sectionGridGap}`}>
          {/* Bemor oqimi — kunlik / haftalik / oylik */}
          <div className={`lg:col-span-2 rounded-xl ${layoutSystem.cardPadding} ${darkMode ? "bg-[#141824] border border-[#1E2130]" : "bg-white border border-gray-100"}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{t("dashboard.flow.title")}</h3>
                <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{flowSubtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={`flex gap-0.5 p-0.5 rounded-lg ${darkMode ? "bg-[#1A2235]" : "bg-gray-100"}`}
                  role="tablist"
                  aria-label={t("dashboard.flow.periodAriaLabel")}
                >
                  {periodTabs.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={flowPeriod === t.key}
                      onClick={() => setFlowPeriod(t.key)}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        flowPeriod === t.key
                          ? darkMode
                            ? "bg-[#141824] text-teal-400 shadow-sm"
                            : "bg-white text-teal-600 shadow-sm"
                          : darkMode
                            ? "text-gray-400 hover:text-gray-200"
                            : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    darkMode ? "bg-teal-500/15 text-teal-400" : "bg-teal-50 text-teal-600"
                  }`}
                >
                  {t("dashboard.flow.growth")}
                </span>
              </div>
            </div>
            <FlowBarChart key={flowPeriod} data={flowChartData} darkMode={darkMode} />
          </div>

          {/* Top doctors */}
          <div className={`rounded-xl ${layoutSystem.cardPadding} ${darkMode ? "bg-[#141824] border border-[#1E2130]" : "bg-white border border-gray-100"}`}>
            <h3 className={`text-sm font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>{t("dashboard.topDoctors.title")}</h3>
            <div className="space-y-3">
              {topDoctors.map((doc, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                      darkMode
                        ? i === 0
                          ? "bg-amber-500/20 text-amber-400"
                          : i === 1
                            ? "bg-gray-500/25 text-gray-300"
                            : "bg-orange-500/20 text-orange-400"
                        : i === 0
                          ? "bg-amber-100 text-amber-600"
                          : i === 1
                            ? "bg-gray-100 text-gray-600"
                            : "bg-orange-50 text-orange-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{doc.name}</p>
                    <p className={`text-xs truncate ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{doc.specialty}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{doc.patients}</p>
                    <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("dashboard.topDoctors.patientUnit")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly trend */}
        <div className={`rounded-xl ${layoutSystem.cardPadding} ${darkMode ? "bg-[#141824] border border-[#1E2130]" : "bg-white border border-gray-100"}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{t("dashboard.yearlyTrend.title")}</h3>
              <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("dashboard.yearlyTrend.subtitle")}</p>
            </div>
          </div>
          <MonthlyChart data={haAnalyticsMonthlyData} darkMode={darkMode} />
        </div>

        {/* Recent patients */}
        <div className={`rounded-xl ${layoutSystem.cardPadding} ${darkMode ? "bg-[#141824] border border-[#1E2130]" : "bg-white border border-gray-100"}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{t("dashboard.recentPatients.title")}</h3>
            <a
              href="/hospital-admin/patients"
              className={`text-xs font-medium cursor-pointer ${
                darkMode ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700"
              }`}
            >
              {t("dashboard.recentPatients.viewAll")}
            </a>
          </div>
          <div className="space-y-3 md:hidden">
            {recentPatients.map((p) => (
              <article
                key={p.id}
                className={`rounded-lg border p-3 ${darkMode ? "border-[#1E2130] bg-[#0F1117]/40" : "border-gray-100 bg-white"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        darkMode ? "bg-teal-500/20" : "bg-teal-100"
                      }`}
                    >
                      <span className={`text-xs font-bold ${darkMode ? "text-teal-300" : "text-teal-700"}`}>
                        {p.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-medium truncate ${darkMode ? "text-white" : "text-gray-900"}`}>{p.name}</p>
                      <p className={`text-xs truncate ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{p.phone}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                      p.status === "active"
                        ? darkMode
                          ? "bg-teal-500/15 text-teal-400"
                          : "bg-teal-50 text-teal-700"
                        : p.status === "scheduled"
                          ? darkMode
                            ? "bg-indigo-500/15 text-indigo-400"
                            : "bg-indigo-50 text-indigo-700"
                          : darkMode
                            ? "bg-gray-500/20 text-gray-400"
                            : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.status === "active" ? t("dashboard.recentPatients.status.active") : p.status === "scheduled" ? t("dashboard.recentPatients.status.scheduled") : t("dashboard.recentPatients.status.discharged")}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    <span className="font-medium">{t("dashboard.recentPatients.table.doctor")}:</span> {p.doctorName}
                  </p>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    <span className="font-medium">{t("dashboard.recentPatients.table.lastVisit")}:</span> {p.lastVisit}
                  </p>
                </div>
                <p className={`mt-2 text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="font-medium">{t("dashboard.recentPatients.table.diagnosis")}:</span> {p.diagnosis}
                </p>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <caption className="sr-only">So'nggi bemorlar ro'yxati</caption>
              <thead>
                <tr className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  <th scope="col" className="text-left pb-3 font-medium">{t("dashboard.recentPatients.table.patient")}</th>
                  <th scope="col" className="text-left pb-3 font-medium">{t("dashboard.recentPatients.table.doctor")}</th>
                  <th scope="col" className="text-left pb-3 font-medium">{t("dashboard.recentPatients.table.diagnosis")}</th>
                  <th scope="col" className="text-left pb-3 font-medium">{t("dashboard.recentPatients.table.lastVisit")}</th>
                  <th scope="col" className="text-left pb-3 font-medium">{t("dashboard.recentPatients.table.status")}</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {recentPatients.map((p) => (
                  <tr key={p.id} className={`border-t ${darkMode ? "border-[#1E2130]" : "border-gray-50"}`}>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            darkMode ? "bg-teal-500/20" : "bg-teal-100"
                          }`}
                        >
                          <span className={`text-xs font-bold ${darkMode ? "text-teal-300" : "text-teal-700"}`}>
                            {p.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className={`text-xs font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{p.name}</p>
                          <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{p.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{p.doctorName}</td>
                    <td className={`py-3 text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{p.diagnosis}</td>
                    <td className={`py-3 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{p.lastVisit}</td>
                    <td className="py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.status === "active"
                            ? darkMode
                              ? "bg-teal-500/15 text-teal-400"
                              : "bg-teal-50 text-teal-700"
                            : p.status === "scheduled"
                              ? darkMode
                                ? "bg-indigo-500/15 text-indigo-400"
                                : "bg-indigo-50 text-indigo-700"
                              : darkMode
                                ? "bg-gray-500/20 text-gray-400"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.status === "active" ? t("dashboard.recentPatients.status.active") : p.status === "scheduled" ? t("dashboard.recentPatients.status.scheduled") : t("dashboard.recentPatients.status.discharged")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}
