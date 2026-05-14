import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import { useQuery } from "@tanstack/react-query";
import { haAnalyticsBundleQueryOptions } from "@/lib/coreQueryCache";
import { PatientFlowRechartsCard } from "@/components/charts/PatientFlowRechartsCard";

type Period = "daily" | "weekly" | "monthly";

export default function HAAnalyticsPage() {
  const { t } = useTranslation("hospital");
  return (
    <HALayout title={t("sidebar.analytics")}>
      <HAAnalyticsPageContent />
    </HALayout>
  );
}

export function HAAnalyticsPageContent() {
  const { t } = useTranslation("hospital");
  const { t: ta } = useTranslation("admin");
  const darkMode = useHospitalAdminDarkMode();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("daily");
  const analyticsState = useQuery(haAnalyticsBundleQueryOptions());
  const analyticsData = analyticsState.data ?? null;
  const haDoctors = useMemo(() => analyticsData?.doctors ?? [], [analyticsData]);
  const haAnalyticsDailyData = useMemo(() => analyticsData?.daily ?? [], [analyticsData]);
  const haAnalyticsWeeklyData = useMemo(() => analyticsData?.weekly ?? [], [analyticsData]);
  const haAnalyticsMonthlyData = useMemo(() => analyticsData?.monthly ?? [], [analyticsData]);
  const haPeakHoursData = useMemo(() => analyticsData?.peakHours ?? [], [analyticsData]);
  const haDoctorPerformance = useMemo(() => analyticsData?.doctorPerformance ?? [], [analyticsData]);
  const haDoctorPerformanceWithIds = useMemo(
    () =>
      haDoctorPerformance.map((item) => ({
        ...item,
        doctorId: haDoctors.find((doctor) => doctor.name === item.name)?.id ?? null,
      })),
    [haDoctorPerformance, haDoctors],
  );
  const maxPatients = useMemo(
    () => Math.max(1, ...haDoctorPerformanceWithIds.map((d) => d.patients)),
    [haDoctorPerformanceWithIds],
  );

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

  const flowLabels = useMemo(
    () => ({
      periodDaily: t("analytics.period.daily"),
      periodWeekly: t("analytics.period.weekly"),
      periodMonthly: t("analytics.period.monthly"),
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

  const totalPatients = useMemo(
    () => haAnalyticsDailyData.reduce((sum, day) => sum + day.patients, 0),
    [haAnalyticsDailyData],
  );
  const avgPerDay = useMemo(() => Math.round(totalPatients / 7), [totalPatients]);
  const peakHour = useMemo(
    () =>
      haPeakHoursData.reduce(
        (maxHour, currentHour) => (maxHour.count > currentHour.count ? maxHour : currentHour),
        { hour: "-", count: 0 },
      ),
    [haPeakHoursData],
  );

  const cardBase = `rounded-xl border p-5 ${darkMode ? "bg-[#21262D] border-[#30363D]" : "bg-white border-gray-100"}`;

  if (
    analyticsState.isLoading
  ) {
    return (
      <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-[#21262D] border border-[#30363D] text-gray-400" : "bg-white border border-gray-100 text-gray-500"}`}>
        Yuklanmoqda...
      </div>
    );
  }

  if (
    analyticsState.isError
  ) {
    return (
      <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-[#21262D] border border-[#30363D] text-gray-300" : "bg-white border border-gray-100 text-gray-700"}`}>
        <p className="mb-4">
          {analyticsState.error instanceof Error ? analyticsState.error.message : "Ma'lumotlarni yuklashda xatolik yuz berdi."}
        </p>
        <button
          type="button"
          onClick={() => {
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
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("analytics.summary.weeklyPatients"), value: totalPatients, icon: 'ri-user-heart-line', color: 'bg-teal-500' },
            { label: t("analytics.summary.dailyAverage"), value: avgPerDay, icon: 'ri-calendar-line', color: 'bg-indigo-500' },
            { label: t("analytics.summary.peakHour"), value: peakHour.hour, icon: 'ri-time-line', color: 'bg-amber-500' },
            { label: t("analytics.summary.activeDoctors"), value: 5, icon: 'ri-stethoscope-line', color: 'bg-emerald-500' },
          ].map((item) => (
            <div key={item.label} className={cardBase}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.label}</p>
                  <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{item.value}</p>
                </div>
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${item.color}`}>
                  <i className={`${item.icon} text-white text-lg`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        <PatientFlowRechartsCard
          darkMode={darkMode}
          period={period}
          onPeriodChange={setPeriod}
          dailyData={haDailyRows}
          weeklyData={haWeeklyRows}
          monthlyData={haMonthlyRows}
          title={t("analytics.patientFlow")}
          subtitle={t("analytics.timeStats")}
          csvFilenamePrefix="ha-tahlil-bemor-oqimi"
          labels={flowLabels}
        />

        <PatientFlowRechartsCard
          darkMode={darkMode}
          showPeriodTabs={false}
          flowSeries={haMonthlyRows}
          title={t("analytics.yearlyTrend")}
          csvFilenamePrefix="ha-tahlil-yillik"
          chartHeightClassName="h-[280px] w-full md:h-[320px]"
          labels={flowLabels}
        />

        {/* Doctor performance */}
        <div className={cardBase}>
          <h3 className={`text-sm font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{t("analytics.doctorPerformance")}</h3>
          <p className={`text-xs mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("analytics.rowHint")}</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <caption className="sr-only">Shifokorlar samaradorligi jadvali</caption>
              <thead>
                <tr className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <th scope="col" className="text-left pb-3 font-medium">#</th>
                  <th scope="col" className="text-left pb-3 font-medium">{t("analytics.table.doctor")}</th>
                  <th scope="col" className="text-left pb-3 font-medium">{t("analytics.table.specialty")}</th>
                  <th scope="col" className="text-left pb-3 font-medium">{t("analytics.table.todayPatients")}</th>
                  <th scope="col" className="text-left pb-3 font-medium">{t("analytics.table.activity")}</th>
                </tr>
              </thead>
              <tbody>
                {haDoctorPerformanceWithIds.map((doc, i) => {
                  const doctorId = doc.doctorId;
                  const openProfile = () => {
                    if (doctorId) navigate(`/hospital-admin/doctors/${doctorId}`);
                  };
                  return (
                    <tr
                      key={doc.name}
                      onClick={openProfile}
                      onKeyDown={(e) => {
                        if (doctorId && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          openProfile();
                        }
                      }}
                      tabIndex={doctorId ? 0 : undefined}
                      className={`group border-t transition-colors ${
                        darkMode ? "border-[#30363D]" : "border-gray-50"
                      } ${
                        doctorId
                          ? `cursor-pointer ${darkMode ? "hover:bg-[#21262D]/80 focus-visible:bg-[#21262D]/80" : "hover:bg-gray-50 focus-visible:bg-gray-50"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50`
                          : ""
                      }`}
                    >
                      <td className={`py-3 text-sm font-bold ${i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : darkMode ? "text-gray-500" : "text-gray-400"}`}>{i + 1}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium transition-colors ${darkMode ? "text-white group-hover:text-teal-300" : "text-gray-900 group-hover:text-teal-700"}`}>{doc.name}</span>
                          {doctorId && (
                            <i className="ri-arrow-right-s-line text-teal-500 text-base opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden />
                          )}
                        </div>
                      </td>
                      <td className={`py-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{doc.specialty}</td>
                      <td className={`py-3 text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{doc.patients}</td>
                      <td className="py-3 w-32">
                        <div className={`h-1.5 rounded-full ${darkMode ? "bg-[#21262D]" : "bg-gray-100"}`}>
                          <div className="h-full rounded-full bg-teal-500 transition-all group-hover:bg-teal-400" style={{ width: `${(doc.patients / maxPatients) * 100}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}
