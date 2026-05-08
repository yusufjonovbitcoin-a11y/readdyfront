import { useTranslation } from "react-i18next";
import { useCallback, useMemo, useState } from "react";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { getDoctorAnalytics } from "@/api/doctor";
import type { DoctorAnalyticsDto, DoctorAnalyticsPeriod } from "@/api/types/doctor.types";
import { usePageState } from "@/hooks/usePageState";
import PageStateBoundary from "@/components/ui/PageStateBoundary";
import { useAuth } from "@/hooks/useAuth";

type Period = DoctorAnalyticsPeriod;

interface DoctorAnalyticsPageData {
  analytics: DoctorAnalyticsDto[];
}

type ChartPoint = { label: string; patients: number; diagnoses: number; avgDuration: number };
type PeakPoint = { hour: string; count: number };

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
    const byDay = new Map(rows.map((row) => [row.date, row]));
    const now = new Date();
    const points: ChartPoint[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const key = formatYmd(day);
      const row = byDay.get(key);
      points.push({
        label: formatMd(day),
        patients: row?.patients ?? 0,
        diagnoses: row?.diagnoses ?? 0,
        avgDuration: row?.avgDuration ?? 0,
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

    const maxVal = Math.max(...chartData.map((d) => d.patients), 1);

    const peakHours: PeakPoint[] = chartData.map((d) => ({ hour: d.label, count: d.patients }));
    const maxPeak = Math.max(...peakHours.map((h) => h.count), 1);
    const peakSlot =
      peakHours.length > 0
        ? peakHours.reduce((best, current) => (current.count > best.count ? current : best), peakHours[0])
        : { hour: "--:--", count: 0 };

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
      maxVal,
      peakHours,
      maxPeak,
      peakSlot,
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
    maxVal,
    peakHours,
    maxPeak,
    peakSlot,
    diagnosisList,
    totalDiagListed,
    trends,
  } = analytics;

  const cardBase = darkMode ? "bg-[#161B22] border-[#30363D]" : "bg-white border-gray-100";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const titleText = darkMode ? "text-white" : "text-gray-900";

  const statCards = [
    { label: "Jami bemorlar", value: totalPatients, icon: "ri-user-heart-line", color: "text-violet-600", bg: "bg-violet-50", trend: trends.patients },
    { label: "Tashxislar", value: totalDiagnoses, icon: "ri-stethoscope-line", color: "text-green-600", bg: "bg-green-50", trend: trends.diagnoses },
    { label: "O'rtacha vaqt", value: `${avgMinutes} daq`, icon: "ri-timer-line", color: "text-blue-600", bg: "bg-blue-50", trend: trends.avgTime },
    { label: "Samaradorlik", value: `${efficiencyPct}%`, icon: "ri-bar-chart-line", color: "text-amber-600", bg: "bg-amber-50", trend: trends.efficiency },
  ];

  const trendClass = (t: string) => {
    if (t.startsWith("-")) return darkMode ? "text-rose-400" : "text-rose-600";
    if (t.includes("daq")) return darkMode ? "text-emerald-400" : "text-emerald-600";
    return darkMode ? "text-emerald-400" : "text-emerald-600";
  };
  const hasChartData = chartData.length > 0;
  const hasPeakData = peakHours.length > 0;
  const flowEmptyText = t("analytics.emptyFlow", "Ma'lumot hali mavjud emas");
  const peakEmptyText = t("analytics.emptyPeakHours", "Soatlik ma'lumot hali mavjud emas");

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
        <div
          key={`${period}-${darkMode ? "dark" : "light"}`}
          className={`rounded-xl border p-5 lg:col-span-2 ${cardBase}`}
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className={`text-base font-semibold ${titleText}`}>{t("analytics.flow")}</h3>
            <div className={`flex items-center gap-3 text-xs ${mutedText}`}>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-violet-500"></span>
                {t("analytics.patients")}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-green-400"></span>
                {t("analytics.diagnoses")}
              </span>
            </div>
          </div>
          {hasChartData ? (
            <div className={`flex h-48 items-end gap-2 rounded-xl p-3 ${darkMode ? "bg-[#101623]" : "bg-gray-50"}`}>
              {chartData.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-40 w-full items-end gap-0.5">
                    <div
                      className="flex-1 rounded-t-md bg-gradient-to-t from-violet-700 via-violet-500 to-violet-300 transition-all"
                      style={{ height: `${Math.max(6, (d.patients / maxVal) * 100)}%` }}
                    ></div>
                    <div
                      className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-700 via-emerald-500 to-teal-300 transition-all"
                      style={{ height: `${Math.max(6, (d.diagnoses / maxVal) * 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{d.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`flex h-48 items-center justify-center rounded-lg border border-dashed ${
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

      <div className={`rounded-xl border p-5 ${cardBase}`}>
        <h3 className={`mb-4 text-base font-semibold ${titleText}`}>{t("analytics.peakHours")}</h3>
        {hasPeakData ? (
          <>
            <div className={`flex h-36 items-end gap-2 rounded-xl p-2 ${darkMode ? "bg-[#101623]" : "bg-gray-50"}`}>
              {peakHours.map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className={`text-xs font-medium ${mutedText}`}>{h.count}</span>
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      h.count === maxPeak
                        ? "bg-gradient-to-t from-violet-700 via-violet-500 to-fuchsia-300"
                        : h.count >= maxPeak * 0.7
                          ? "bg-gradient-to-t from-violet-600 to-violet-300"
                          : "bg-gradient-to-t from-violet-500/60 to-violet-300/50"
                    }`}
                    style={{ height: `${Math.max(8, (h.count / maxPeak) * 92)}px` }}
                  ></div>
                  <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{h.hour}</span>
                </div>
              ))}
            </div>
            <p className={`mt-3 text-xs ${mutedText}`}>
              {t("analytics.peakTime")}{" "}
              <span className="font-semibold text-violet-600">
                {peakSlot.hour} ({peakSlot.count} bemor)
              </span>
            </p>
          </>
        ) : (
          <div
            className={`flex h-32 items-center justify-center rounded-lg border border-dashed ${
              darkMode ? "border-[#30363D] text-gray-400" : "border-gray-200 text-gray-500"
            }`}
          >
            <span className="text-sm">{peakEmptyText}</span>
          </div>
        )}
      </div>
        </div>
      )}
    </PageStateBoundary>
  );
}
