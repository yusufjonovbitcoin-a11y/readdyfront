import { useTranslation } from "react-i18next";
import { useEffect, useId, useState } from "react";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { getAnalyticsDashboard } from "@/api/analytics";
import type { AnalyticsDashboardDto } from "@/api/types/analytics.types";
import { PatientFlowRechartsCard } from "@/components/charts/PatientFlowRechartsCard";

type Period = "daily" | "weekly" | "monthly";

const EMPTY_ANALYTICS: AnalyticsDashboardDto = {
  daily: [],
  weekly: [],
  monthly: [],
  doctorPerformance: [],
  topHospitals: [],
  dailyBookings: [],
  weeklyBookings: [],
  cityStats: [],
};

export function AnalyticsPageContent() {
  const { t } = useTranslation("admin");
  const dm = useMainLayoutDarkMode();
  const hospitalFilterHelpId = useId().replace(/:/g, "") + "-hospital-filter-help";
  const [period, setPeriod] = useState<Period>("daily");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const isHospitalFilterReady = true;
  const [analytics, setAnalytics] = useState<AnalyticsDashboardDto>(EMPTY_ANALYTICS);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const data = await getAnalyticsDashboard();
        if (!mounted) return;
        setAnalytics(data);
      } catch {
        if (!mounted) return;
        setAnalytics(EMPTY_ANALYTICS);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const dataMap = { daily: analytics.daily, weekly: analytics.weekly, monthly: analytics.monthly };
  const data = dataMap[period];
  const maxVal = Math.max(1, ...data.map((d) => d.patients));

  const totalPatients = data.reduce((s, d) => s + d.patients, 0);
  const totalAppointments = data.reduce((s, d) => s + d.appointments, 0);
  const totalCompleted = data.reduce((s, d) => s + d.completed, 0);
  const completionRate = totalAppointments > 0 ? Math.round((totalCompleted / totalAppointments) * 100) : 0;

  const filteredHospitals =
    hospitalFilter === "all"
      ? analytics.topHospitals
      : analytics.topHospitals.filter((h) => h.name === hospitalFilter);

  const fallbackPeakValues = Array.from({ length: 12 }, () => 8);
  const normalizedPeakValues =
    data.length > 0
      ? Array.from({ length: 12 }, (_, i) => {
          const row = data[i % data.length];
          return Math.max(8, Math.min(100, Math.round((row?.appointments ?? 0) / Math.max(maxVal, 1) * 100)));
        })
      : fallbackPeakValues;

  return (
    <div className="space-y-5">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <select
            value={hospitalFilter}
            onChange={(e) => {
              if (!isHospitalFilterReady) return;
              setHospitalFilter(e.target.value);
            }}
            disabled={!isHospitalFilterReady}
            aria-describedby={!isHospitalFilterReady ? hospitalFilterHelpId : undefined}
            className={`px-3 py-2 rounded-lg text-sm outline-none cursor-pointer ${dm ? "bg-[#21262D] text-white border border-[#30363D]" : "bg-white text-gray-900 border border-gray-200"}`}
          >
            <option value="all">{t("admin:analytics.allHospitals")}</option>
            {analytics.topHospitals.map((h, i) => (
              <option key={i} value={h.name}>{h.name}</option>
            ))}
          </select>
        </div>
        {!isHospitalFilterReady ? (
          <p
            id={hospitalFilterHelpId}
            className={`text-xs -mt-1 ${dm ? "text-amber-400" : "text-amber-700"}`}
          >
            Kasalxona bo'yicha kesim filtr funksiyasi tez orada faollashadi.
          </p>
        ) : null}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("admin:analytics.summary.totalPatients"), value: totalPatients.toLocaleString(), icon: "ri-user-heart-line", color: "text-emerald-400", bg: "bg-emerald-500/20" },
            { label: t("admin:analytics.summary.appointments"), value: totalAppointments.toLocaleString(), icon: "ri-calendar-check-line", color: "text-blue-400", bg: "bg-blue-500/20" },
            { label: t("admin:analytics.summary.completed"), value: totalCompleted.toLocaleString(), icon: "ri-checkbox-circle-line", color: "text-violet-400", bg: "bg-violet-500/20" },
            { label: t("admin:analytics.summary.completionRate"), value: `${completionRate}%`, icon: "ri-percent-line", color: "text-orange-400", bg: "bg-orange-500/20" },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border p-4 ${dm ? "border-[#30363D] bg-[#21262D]" : "border-gray-100 bg-white"}`}>
              <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                <i className={`${s.icon} ${s.color} text-sm`}></i>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
              <p className={`mt-1 text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>{s.label}</p>
            </div>
          ))}
        </div>

        <PatientFlowRechartsCard
          darkMode={dm}
          mainLayoutDarkSurfaces
          period={period}
          onPeriodChange={setPeriod}
          dailyData={analytics.daily}
          weeklyData={analytics.weekly}
          monthlyData={analytics.monthly}
          title={t("admin:analytics.flowDynamics")}
          subtitle={t("admin:analytics.flowDynamicsSubtitle")}
          badge={t("admin:analytics.liveBadge")}
          csvFilenamePrefix="super-admin-tahlil"
          labels={{
            periodDaily: t("admin:analytics.period.daily"),
            periodWeekly: t("admin:analytics.period.weekly"),
            periodMonthly: t("admin:analytics.period.monthly"),
            patients: t("admin:analytics.patients"),
            appointments: t("admin:analytics.appointments"),
            completed: t("admin:analytics.summary.completed"),
            chartAria: t("admin:analytics.flowChartAria"),
            calendarHint: t("home.activityChart.calendarHint"),
            dateRangeTitle: t("home.activityChart.dateRangeTitle"),
            dateRangeFrom: t("home.activityChart.dateRangeFrom"),
            dateRangeTo: t("home.activityChart.dateRangeTo"),
            dateRangeApply: t("home.activityChart.dateRangeApply"),
            dateRangeClear: t("home.activityChart.dateRangeClear"),
            dateRangeTooLong: t("home.activityChart.dateRangeTooLong"),
            dateRangeHint: t("home.activityChart.dateRangeHint"),
            dateRangeFillBoth: t("home.activityChart.dateRangeFillBoth"),
            dateRangeOrderInvalid: t("home.activityChart.dateRangeOrderInvalid"),
            exportCsv: t("home.activityChart.exportCsv"),
            brandShort: t("home.activityChart.brandShort"),
          }}
        />

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Doctor Performance */}
          <div className={`rounded-xl p-5 ${dm ? "bg-[#21262D]" : "bg-white"}`}>
            <h3 className={`text-sm font-semibold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>{t("admin:analytics.doctorPerformance")}</h3>
            <div className="space-y-3">
              {analytics.doctorPerformance.map((d, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${dm ? "bg-[#0F1117]" : "bg-gray-50"}`}>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 text-xs font-bold">{d.name.split(" ").slice(-1)[0][0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium truncate ${dm ? "text-white" : "text-gray-900"}`}>{d.name}</p>
                      <span className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>{d.patients} {t("admin:analytics.patientUnit")}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>{d.specialty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart - Hospitals */}
          <div className={`rounded-xl p-5 ${dm ? "bg-[#21262D]" : "bg-white"}`}>
            <h3 className={`text-sm font-semibold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>{t("admin:analytics.hospitalComparison")}</h3>
            <div className="space-y-4">
              {filteredHospitals.map((h, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-medium ${dm ? "text-gray-300" : "text-gray-700"}`}>{h.name}</span>
                    <span className={`text-xs font-semibold ${dm ? "text-white" : "text-gray-900"}`}>{h.patients}</span>
                  </div>
                  <div className={`h-2 rounded-full ${dm ? "bg-[#0F1117]" : "bg-gray-100"}`}>
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${(h.patients / h.max) * 100}%`,
                        background: `hsl(${160 - i * 20}, 70%, 50%)`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Peak Hours */}
            <div className={`mt-5 pt-4 border-t ${dm ? "border-[#30363D]" : "border-gray-100"}`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-semibold ${dm ? "text-gray-300" : "text-gray-600"}`}>{t("admin:analytics.peakHours")}</p>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${dm ? "bg-teal-900/40 text-teal-300" : "bg-teal-100 text-teal-700"}`}>
                  Live trend
                </span>
              </div>
              <div className={`flex items-end gap-1 h-16 rounded-lg p-2 ${dm ? "bg-[#101623]" : "bg-gray-50"}`}>
                {normalizedPeakValues.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className="w-full rounded-sm bg-gradient-to-t from-teal-600/80 via-emerald-400/70 to-cyan-300/70"
                      style={{ height: `${v * 0.52}px` }}
                    ></div>
                    <span className={`text-xs ${dm ? "text-gray-600" : "text-gray-400"}`}>{8 + i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function AnalyticsPage() {
  const { t } = useTranslation("admin");
  return (
    <MainLayout title={t("admin:titles.analytics")}>
      <AnalyticsPageContent />
    </MainLayout>
  );
}
