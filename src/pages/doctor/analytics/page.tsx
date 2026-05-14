import { useTranslation } from "react-i18next";
import { useCallback, useMemo, useState } from "react";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { getDoctorAnalytics } from "@/api/doctor";
import type { DoctorAnalyticsDto, DoctorAnalyticsPeriod } from "@/api/types/doctor.types";
import { usePageState } from "@/hooks/usePageState";
import PageStateBoundary from "@/components/ui/PageStateBoundary";
import { useAuth } from "@/hooks/useAuth";
import { PatientFlowRechartsCard } from "@/components/charts/PatientFlowRechartsCard";
import { PeakHoursRechartsBar } from "@/components/charts/PeakHoursRechartsBar";

type Period = DoctorAnalyticsPeriod;

interface DoctorAnalyticsPageData {
  analytics: DoctorAnalyticsDto[];
}

type ChartPoint = { label: string; isoDate: string; patients: number; diagnoses: number; avgDuration: number };

function formatPercentTrend(current: number, previous: number): string {
  if (previous <= 0) return current > 0 ? "+100%" : "0%";
  const delta = Math.round(((current - previous) / previous) * 100);
  return `${delta > 0 ? "+" : ""}${delta}%`;
}

function formatMinutesTrend(current: number, previous: number): string {
  const delta = current - previous;
  if (delta === 0) return "0 daq";
  return `${delta > 0 ? "+" : ""}${delta} daq`;
}

function parseDateOnly(value: string): Date | null {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatYmd(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatMd(value: Date): string {
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${m}-${d}`;
}

function mondayOf(value: Date): Date {
  const day = value.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(value);
  monday.setDate(value.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function bucketByPeriod(rows: DoctorAnalyticsDto[], period: Period): ChartPoint[] {
  if (period === "daily") {
    const byDay = new Map<string, { patients: number; diagnoses: number; durationWeighted: number; weight: number }>();
    for (const row of rows) {
      const d = parseDateOnly(row.date);
      if (!d) continue;
      const key = formatYmd(d);
      const cur = byDay.get(key) ?? { patients: 0, diagnoses: 0, durationWeighted: 0, weight: 0 };
      cur.patients += row.patients;
      cur.diagnoses += row.diagnoses;
      const w = Math.max(row.patients, 0);
      cur.durationWeighted += row.avgDuration * w;
      cur.weight += w;
      byDay.set(key, cur);
    }
    const now = new Date();
    const points: ChartPoint[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const key = formatYmd(day);
      const agg = byDay.get(key);
      points.push({
        label: formatMd(day),
        isoDate: key,
        patients: agg?.patients ?? 0,
        diagnoses: agg?.diagnoses ?? 0,
        avgDuration:
          agg && agg.weight > 0 ? Math.round(agg.durationWeighted / agg.weight) : 0,
      });
    }
    return points;
  }

  const bucketMap = new Map<string, { label: string; patients: number; diagnoses: number; durationWeighted: number; weight: number }>();
  for (const row of rows) {
    const d = parseDateOnly(row.date);
    if (!d) continue;

    let key = "";
    let label = "";
    if (period === "weekly") {
      const monday = mondayOf(d);
      key = formatYmd(monday);
      label = formatMd(monday);
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      label = key;
    }

    const current = bucketMap.get(key) ?? { label, patients: 0, diagnoses: 0, durationWeighted: 0, weight: 0 };
    current.patients += row.patients;
    current.diagnoses += row.diagnoses;
    const weight = Math.max(row.patients, 0);
    current.durationWeighted += row.avgDuration * weight;
    current.weight += weight;
    bucketMap.set(key, current);
  }

  if (period === "weekly") {
    const nowMonday = mondayOf(new Date());
    const points: ChartPoint[] = [];
    for (let i = 3; i >= 0; i -= 1) {
      const monday = new Date(nowMonday);
      monday.setDate(nowMonday.getDate() - i * 7);
      const key = formatYmd(monday);
      const item = bucketMap.get(key);
      points.push({
        label: formatMd(monday),
        isoDate: key,
        patients: item?.patients ?? 0,
        diagnoses: item?.diagnoses ?? 0,
        avgDuration:
          item && item.weight > 0
            ? Math.round(item.durationWeighted / item.weight)
            : 0,
      });
    }
    return points;
  }

  const now = new Date();
  const points: ChartPoint[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    const item = bucketMap.get(key);
    points.push({
      label: key,
      isoDate: `${key}-01`,
      patients: item?.patients ?? 0,
      diagnoses: item?.diagnoses ?? 0,
      avgDuration:
        item && item.weight > 0
          ? Math.round(item.durationWeighted / item.weight)
          : 0,
    });
  }
  return points;
}

export default function DocAnalyticsPage() {
  const { t } = useTranslation("doctor");
  return (
    <DocLayout title={t("sidebar.analytics")}>
      <DocAnalyticsContent />
    </DocLayout>
  );
}

export function DocAnalyticsContent() {
  const { t } = useTranslation("doctor");
  const [period, setPeriod] = useState<Period>("weekly");
  const { darkMode } = useDoctorTheme();
  const { user } = useAuth();
  const fetchAnalyticsPageData = useCallback(async (): Promise<DoctorAnalyticsPageData> => {
    const analytics = await getDoctorAnalytics();
    return { analytics };
  }, []);
  const pageState = usePageState<DoctorAnalyticsPageData>(fetchAnalyticsPageData);

  const analytics = useMemo(() => {
    const docAnalytics = pageState.data?.analytics ?? [];
    const chartData = bucketByPeriod(docAnalytics, period);
    const previousPeriodData =
      period === "daily" ? bucketByPeriod(docAnalytics, "weekly") : bucketByPeriod(docAnalytics, "daily");

    const totalPatients = chartData.reduce((s, d) => s + d.patients, 0);
    const totalDiagnoses = chartData.reduce((s, d) => s + d.diagnoses, 0);
    const avgMinutes =
      chartData.length > 0
        ? Math.round(chartData.reduce((s, d) => s + d.avgDuration, 0) / chartData.length)
        : 0;

    const efficiencyPct =
      totalPatients > 0 ? Math.round((totalDiagnoses / totalPatients) * 100) : 0;

    const diagnosisList = chartData
      .filter((row) => row.diagnoses > 0)
      .slice(0, 6)
      .map((row, idx) => ({
        name: row.label,
        color: idx % 2 === 0 ? "bg-violet-500" : "bg-green-400",
        count: row.diagnoses,
      }));
    const totalDiagListed = diagnosisList.reduce((s, d) => s + d.count, 0);

    const previousPatients = previousPeriodData.reduce((sum, row) => sum + row.patients, 0);
    const previousDiagnoses = previousPeriodData.reduce((sum, row) => sum + row.diagnoses, 0);
    const previousAvgMinutes =
      previousPeriodData.length > 0
        ? Math.round(previousPeriodData.reduce((s, d) => s + d.avgDuration, 0) / previousPeriodData.length)
        : 0;
    const previousEfficiency =
      previousPatients > 0 ? Math.round((previousDiagnoses / previousPatients) * 100) : 0;

    const trends = {
      patients: formatPercentTrend(totalPatients, previousPatients),
      diagnoses: formatPercentTrend(totalDiagnoses, previousDiagnoses),
      avgTime: formatMinutesTrend(avgMinutes, previousAvgMinutes),
      efficiency: formatPercentTrend(efficiencyPct, previousEfficiency),
    };

    return {
      chartData,
      totalPatients,
      totalDiagnoses,
      avgMinutes,
      efficiencyPct,
      diagnosisList,
      totalDiagListed,
      trends,
    };
  }, [period, pageState.data]);

  const {
    chartData,
    totalPatients,
    totalDiagnoses,
    avgMinutes,
    efficiencyPct,
    diagnosisList,
    totalDiagListed,
    trends,
  } = analytics;

  const docAnalytics = pageState.data?.analytics ?? [];
  const peakRanges = useMemo(() => {
    const toBar = (pts: ChartPoint[]) => pts.map((p) => ({ label: p.label, count: p.patients }));
    return {
      "24h": toBar(bucketByPeriod(docAnalytics, "daily")),
      "7d": toBar(bucketByPeriod(docAnalytics, "weekly")),
      "30d": toBar(bucketByPeriod(docAnalytics, "monthly")),
    };
  }, [docAnalytics]);

  const cardBase = darkMode ? "bg-[#21262D] border-[#30363D]" : "bg-white border-gray-100";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const titleText = darkMode ? "text-white" : "text-gray-900";

  const statCards = [
    { label: "Jami bemorlar", value: totalPatients, icon: "ri-user-heart-line", color: "text-violet-600", bg: "bg-violet-50", trend: trends.patients },
    { label: "Tashxislar", value: totalDiagnoses, icon: "ri-stethoscope-line", color: "text-green-600", bg: "bg-green-50", trend: trends.diagnoses },
    { label: "O'rtacha vaqt", value: `${avgMinutes} daq`, icon: "ri-timer-line", color: "text-blue-600", bg: "bg-blue-50", trend: trends.avgTime },
    { label: "Samaradorlik", value: `${efficiencyPct}%`, icon: "ri-bar-chart-line", color: "text-amber-600", bg: "bg-amber-50", trend: trends.efficiency },
  ];

  const trendClass = (trend: string) => {
    if (trend.startsWith("-")) return darkMode ? "text-rose-400" : "text-rose-600";
    if (trend.includes("daq")) return darkMode ? "text-emerald-400" : "text-emerald-600";
    return darkMode ? "text-emerald-400" : "text-emerald-600";
  };
  const hasChartData = chartData.length > 0;
  const flowEmptyText = t("analytics.emptyFlow", "Ma'lumot hali mavjud emas");
  const peakEmptyText = t("analytics.emptyPeakHours", "Soatlik ma'lumot hali mavjud emas");

  const doctorFlowSeries = useMemo(
    () => chartData.map((d) => ({ date: d.label, sortDate: d.isoDate, patients: d.patients, diagnoses: d.diagnoses })),
    [chartData],
  );

  const doctorFlowLabels = useMemo(
    () => ({
      periodDaily: t("analytics.period.daily"),
      periodWeekly: t("analytics.period.weekly"),
      periodMonthly: t("analytics.period.monthly"),
      patients: t("analytics.patients"),
      diagnoses: t("analytics.diagnoses"),
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
    [t],
  );

  return (
    <PageStateBoundary state={pageState}>
      {() => (
        <div className="min-w-0 space-y-5">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold ${titleText}`}>{t("analytics.title")}</h2>
          <p className={`text-sm mt-0.5 ${mutedText}`}>{user?.name ?? "Doctor"}</p>
        </div>
        <div className={`flex items-center rounded-xl p-1 ${darkMode ? "bg-[#21262D]" : "bg-gray-100"}`}>
          {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                period === p
                  ? darkMode
                    ? "bg-[#30363D] text-violet-300 shadow-sm"
                    : "bg-white text-violet-700 shadow-sm"
                  : darkMode
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p === "daily" ? t("analytics.period.daily") : p === "weekly" ? t("analytics.period.weekly") : t("analytics.period.monthly")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((stat, i) => (
          <div key={i} className={`rounded-xl border p-4 ${cardBase}`}>
            <div className="mb-3 flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                <i className={`${stat.icon} text-lg ${stat.color}`}></i>
              </div>
              <span className={`text-xs font-medium ${trendClass(stat.trend)}`}>{stat.trend}</span>
            </div>
            <p className={`text-2xl font-bold ${titleText}`}>{stat.value}</p>
            <p className={`mt-0.5 text-xs ${mutedText}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div key={`${period}-${darkMode ? "dark" : "light"}`} className="lg:col-span-2">
          {hasChartData ? (
            <PatientFlowRechartsCard
              darkMode={darkMode}
              showPeriodTabs={false}
              flowSeries={doctorFlowSeries}
              title={t("analytics.flow")}
              csvFilenamePrefix="shifokor-tahlil-oqim"
              chartHeightClassName="h-[320px] w-full md:h-[360px]"
              labels={doctorFlowLabels}
            />
          ) : (
            <div
              className={`flex h-64 items-center justify-center rounded-2xl border border-dashed p-5 ${
                darkMode ? "border-[#30363D] text-gray-400" : "border-gray-200 text-gray-500"
              }`}
            >
              <span className="text-sm">{flowEmptyText}</span>
            </div>
          )}
        </div>

        <div className={`rounded-xl border p-5 ${cardBase}`}>
          <h3 className={`mb-4 text-base font-semibold ${titleText}`}>{t("analytics.diagnoses")}</h3>
          <div className="space-y-3">
            {diagnosisList.map((d, i) => (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between">
                  <span className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{d.name}</span>
                  <span className={`text-xs ${mutedText}`}>{d.count}</span>
                </div>
                <div className={`h-2 overflow-hidden rounded-full ${darkMode ? "bg-[#21262D]" : "bg-gray-100"}`}>
                  <div
                    className={`h-full ${d.color} rounded-full transition-all`}
                    style={{ width: `${totalDiagListed > 0 ? (d.count / totalDiagListed) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-4 border-t pt-4 ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
            <p className={`text-xs ${mutedText}`}>
              {t("analytics.totalDiagnoses")}{" "}
              <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{totalDiagnoses}</span>
            </p>
          </div>
        </div>
      </div>

      <PeakHoursRechartsBar
        key={`peak-${darkMode ? "dark" : "light"}-${docAnalytics.length}`}
        darkMode={darkMode}
        ranges={peakRanges}
        rangeTabLabels={{
          "24h": t("analytics.peakRange24h"),
          "7d": t("analytics.peakRange7d"),
          "30d": t("analytics.peakRange30d"),
        }}
        defaultRange="7d"
        title={t("analytics.peakHours")}
        subtitle={t("analytics.peakHoursSubtitle")}
        emptyText={peakEmptyText}
        seriesName={t("analytics.patients")}
        chartHeightClassName="h-[300px] w-full md:h-[340px]"
        summaryFormatter={(slot) => (
          <>
            {t("analytics.peakTime")}{" "}
            <span className={darkMode ? "font-semibold text-emerald-300" : "font-semibold text-emerald-600"}>
              {slot.label} ({t("analytics.peakSlotPatients", { count: slot.count })})
            </span>
          </>
        )}
      />
        </div>
      )}
    </PageStateBoundary>
  );
}
