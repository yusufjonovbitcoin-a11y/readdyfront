import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import { getHAPatients } from "@/api/services/hospitalAdminData.service";
import { usePageState } from "@/hooks/usePageState";
import { layoutSystem } from "@/styles/layoutSystem";
import { useQuery } from "@tanstack/react-query";
import { doctorsQueryOptions, haAnalyticsBundleQueryOptions } from "@/lib/coreQueryCache";
import { PatientFlowRechartsCard } from "@/components/charts/PatientFlowRechartsCard";

type FlowPeriod = "daily" | "weekly" | "monthly";

function StatCard({ icon, label, value, sub, color, darkMode }: {
  icon: string; label: string; value: string | number; sub: string; color: string; darkMode: boolean;
}) {
  return (
    <div className={`rounded-xl ${layoutSystem.cardPadding} ${darkMode ? "bg-[#21262D] border border-[#30363D]" : "bg-white border border-gray-100"}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
          <p className={`text-2xl font-bold tabular-nums ${darkMode ? "text-white" : "text-gray-900"}`}>{value}</p>
          <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{sub}</p>
        </div>
        <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${color}`}>
          <i className={`${icon} text-white text-base`}></i>
        </div>
      </div>
    </div>
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
  const { t: ta } = useTranslation("admin");
  const darkMode = useHospitalAdminDarkMode();
  const doctorsState = useQuery(doctorsQueryOptions());
  const patientsState = usePageState(getHAPatients);
  const analyticsState = useQuery(haAnalyticsBundleQueryOptions());
  const haDoctors = useMemo(() => doctorsState.data ?? [], [doctorsState.data]);
  const haPatients = useMemo(() => patientsState.data ?? [], [patientsState.data]);
  const analyticsData = analyticsState.data ?? null;
  const haAnalyticsDailyData = useMemo(() => analyticsData?.daily ?? [], [analyticsData]);
  const haAnalyticsWeeklyData = useMemo(() => analyticsData?.weekly ?? [], [analyticsData]);
  const haAnalyticsMonthlyData = useMemo(() => analyticsData?.monthly ?? [], [analyticsData]);
  const haDoctorPerformance = useMemo(() => analyticsData?.doctorPerformance ?? [], [analyticsData]);
  const [flowPeriod, setFlowPeriod] = useState<FlowPeriod>("daily");

  const haDailyRows = useMemo(
    () =>
      haAnalyticsDailyData.map((d) => ({
        date: d.day,
        patients: d.patients,
        appointments: d.appointments,
        completed: d.completed,
      })),
    [haAnalyticsDailyData],
  );
  const haWeeklyRows = useMemo(
    () =>
      haAnalyticsWeeklyData.map((d) => ({
        date: d.week,
        patients: d.patients,
        appointments: d.appointments,
        completed: d.completed,
      })),
    [haAnalyticsWeeklyData],
  );
  const haMonthlyRows = useMemo(
    () =>
      haAnalyticsMonthlyData.map((d) => ({
        date: d.month,
        patients: d.patients,
        appointments: d.appointments,
        completed: d.completed,
      })),
    [haAnalyticsMonthlyData],
  );

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

  const flowLabels = useMemo(
    () => ({
      periodDaily: t("dashboard.flow.period.daily"),
      periodWeekly: t("dashboard.flow.period.weekly"),
      periodMonthly: t("dashboard.flow.period.monthly"),
      patients: ta("admin:analytics.patients"),
      appointments: ta("admin:analytics.appointments"),
      completed: ta("admin:analytics.summary.completed"),
      chartAria: t("analytics.flowCard.chartAria"),
      calendarHint: t("analytics.flowCard.calendarHint"),
      dateRangeTitle: t("analytics.flowCard.dateRangeTitle"),
      dateRangeFrom: t("analytics.flowCard.dateRangeFrom"),
      dateRangeTo: t("analytics.flowCard.dateRangeTo"),
      dateRangeApply: t("analytics.flowCard.dateRangeApply"),
      dateRangeClear: t("analytics.flowCard.dateRangeClear"),
      dateRangeTooLong: t("analytics.flowCard.dateRangeTooLong"),
      dateRangeHint: t("analytics.flowCard.dateRangeHint"),
      dateRangeFillBoth: t("analytics.flowCard.dateRangeFillBoth"),
      dateRangeOrderInvalid: t("analytics.flowCard.dateRangeOrderInvalid"),
      exportCsv: t("analytics.flowCard.exportCsv"),
      brandShort: t("analytics.flowCard.brandShort"),
    }),
    [t, ta],
  );

  if (
    doctorsState.isLoading ||
    patientsState.status === "loading" ||
    analyticsState.isLoading
  ) {
    return (
      <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-[#21262D] border border-[#30363D] text-gray-400" : "bg-white border border-gray-100 text-gray-500"}`}>
        Yuklanmoqda...
      </div>
    );
  }

  if (
    doctorsState.isError ||
    patientsState.status === "error" ||
    analyticsState.isError
  ) {
    return (
      <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-[#21262D] border border-[#30363D] text-gray-300" : "bg-white border border-gray-100 text-gray-700"}`}>
        <p className="mb-4">
          {(doctorsState.error instanceof Error ? doctorsState.error.message : null) ??
            patientsState.error ??
            (analyticsState.error instanceof Error ? analyticsState.error.message : null)}
        </p>
        <button
          type="button"
          onClick={() => {
            void doctorsState.refetch();
            void patientsState.reload();
            void analyticsState.refetch();
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
          <div className="min-w-0 self-start lg:col-span-2">
            <PatientFlowRechartsCard
              darkMode={darkMode}
              period={flowPeriod}
              onPeriodChange={setFlowPeriod}
              dailyData={haDailyRows}
              weeklyData={haWeeklyRows}
              monthlyData={haMonthlyRows}
              title={t("dashboard.flow.title")}
              subtitle={flowSubtitle}
              badge={t("dashboard.flow.growth")}
              csvFilenamePrefix="ha-boshqaruv-bemor-oqimi"
              labels={flowLabels}
              chartHeightClassName="h-[220px] w-full sm:h-[260px] md:h-[300px]"
            />
          </div>

          {/* Top doctors: lg da qator balandligi diagramma bilan teng; past — "Barcha shifokorlar" havolasi */}
          <div className="flex w-full flex-col self-stretch lg:h-full lg:min-h-0">
            <div
              className={`flex h-full min-h-0 flex-1 flex-col rounded-xl p-4 ${darkMode ? "bg-[#21262D] border border-[#30363D]" : "bg-white border border-gray-100"}`}
            >
              <h3 className={`text-sm font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>{t("dashboard.topDoctors.title")}</h3>
              <div className="min-h-0 flex-1 space-y-2.5">
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
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-xs font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{doc.name}</p>
                      <p className={`truncate text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{doc.specialty}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className={`text-xs font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{doc.patients}</p>
                      <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("dashboard.topDoctors.patientUnit")}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/hospital-admin/doctors"
                className={`mt-auto border-t pt-3 text-xs font-medium ${darkMode ? "border-[#30363D] text-teal-400 hover:text-teal-300" : "border-gray-100 text-teal-600 hover:text-teal-700"}`}
              >
                {t("dashboard.topDoctors.viewAll")}
              </Link>
            </div>
          </div>
        </div>

        <PatientFlowRechartsCard
          darkMode={darkMode}
          showPeriodTabs={false}
          flowSeries={haMonthlyRows}
          title={t("dashboard.yearlyTrend.title")}
          subtitle={t("dashboard.yearlyTrend.subtitle")}
          csvFilenamePrefix="ha-boshqaruv-yillik"
          chartHeightClassName="h-[220px] w-full sm:h-[240px] md:h-[260px]"
          labels={flowLabels}
        />

        {/* Recent patients */}
        <div className={`rounded-xl ${layoutSystem.cardPadding} ${darkMode ? "bg-[#21262D] border border-[#30363D]" : "bg-white border border-gray-100"}`}>
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
                className={`rounded-lg border p-3 ${darkMode ? "border-[#30363D] bg-[#0F1117]/40" : "border-gray-100 bg-white"}`}
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
                  <tr key={p.id} className={`border-t ${darkMode ? "border-[#30363D]" : "border-gray-50"}`}>
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
