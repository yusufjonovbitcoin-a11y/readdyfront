import { useTranslation } from "react-i18next";
import { useCallback, useMemo, useState } from "react";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { getDoctorAnalytics, getDoctorAnalyticsPresets } from "@/api/doctor";
import type {
  DoctorAnalyticsDto,
  DoctorAnalyticsPeriod,
  DoctorAnalyticsPresetsDto,
} from "@/api/types/doctor.types";
import { usePageState } from "@/hooks/usePageState";
import PageStateBoundary from "@/components/ui/PageStateBoundary";

type Period = DoctorAnalyticsPeriod;

interface DoctorAnalyticsPageData {
  analytics: DoctorAnalyticsDto[];
  presets: DoctorAnalyticsPresetsDto;
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
  const fetchAnalyticsPageData = useCallback(async (): Promise<DoctorAnalyticsPageData> => {
    const [analytics, presets] = await Promise.all([getDoctorAnalytics(), getDoctorAnalyticsPresets()]);
    return { analytics, presets };
  }, []);
  const pageState = usePageState<DoctorAnalyticsPageData>(fetchAnalyticsPageData);
  const docAnalytics = pageState.data?.analytics ?? [];
  const presets = pageState.data?.presets;

  const analytics = useMemo(() => {
    let chartData: { label: string; patients: number; diagnoses: number; avgDuration?: number }[];

    if (period === "daily") {
      chartData = docAnalytics.map((d) => ({
        label: d.date.slice(5),
        patients: d.patients,
        diagnoses: d.diagnoses,
        avgDuration: d.avgDuration,
      }));
    } else if (period === "weekly") {
      chartData = presets?.weekly ?? [];
    } else {
      chartData = presets?.monthly ?? [];
    }

    const totalPatients = chartData.reduce((s, d) => s + d.patients, 0);
    const totalDiagnoses = chartData.reduce((s, d) => s + d.diagnoses, 0);

    let avgMinutes: number;
    if (period === "daily") {
      const withAvg = chartData.filter((d): d is typeof d & { avgDuration: number } => d.avgDuration != null);
      avgMinutes =
        withAvg.length > 0
          ? Math.round(withAvg.reduce((s, d) => s + d.avgDuration, 0) / withAvg.length)
          : 0;
    } else {
      const withAvg = chartData as { avgDuration: number }[];
      avgMinutes =
        withAvg.length > 0
          ? Math.round(withAvg.reduce((s, d) => s + (d as { avgDuration: number }).avgDuration, 0) / withAvg.length)
          : 0;
    }

    const efficiencyPct =
      totalPatients > 0 ? Math.round((totalDiagnoses / totalPatients) * 100) : 0;

    const maxVal = Math.max(...chartData.map((d) => d.patients), 1);

    const peakHours = presets?.peakHours[period] ?? [];
    const maxPeak = Math.max(...peakHours.map((h) => h.count), 1);
    const peakSlot =
      peakHours.length > 0
        ? peakHours.reduce((best, current) => (current.count > best.count ? current : best), peakHours[0])
        : { hour: "--:--", count: 0 };

    const shares = presets?.diagnosisShares[period] ?? [];
    const diagnosisList = shares.map((row) => ({
      name: row.name,
      color: row.color,
      count: totalDiagnoses > 0 ? Math.max(1, Math.round((row.share / 100) * totalDiagnoses)) : 0,
    }));
    const totalDiagListed = diagnosisList.reduce((s, d) => s + d.count, 0);

    const trends =
      presets?.trends[period] ?? { patients: "0%", diagnoses: "0%", avgTime: "0 daq", efficiency: "0%" };

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
  }, [period, docAnalytics, presets]);

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

  return (
    <PageStateBoundary state={pageState}>
      {() => (
        <div className="min-w-0 space-y-5">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold ${titleText}`}>{t("analytics.title")}</h2>
          <p className={`text-sm mt-0.5 ${mutedText}`}>Dr. Alisher Karimov — Kardiologiya</p>
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
          <div className="flex h-48 items-end gap-2">
            {chartData.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-40 w-full items-end gap-0.5">
                  <div
                    className="flex-1 rounded-t-md bg-violet-500 transition-all"
                    style={{ height: `${(d.patients / maxVal) * 100}%` }}
                  ></div>
                  <div
                    className="flex-1 rounded-t-md bg-green-400 transition-all"
                    style={{ height: `${(d.diagnoses / maxVal) * 100}%` }}
                  ></div>
                </div>
                <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{d.label}</span>
              </div>
            ))}
          </div>
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
        <div className="flex h-32 items-end gap-2">
          {peakHours.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className={`text-xs font-medium ${mutedText}`}>{h.count}</span>
              <div
                className={`w-full rounded-t-md transition-all ${
                  h.count === maxPeak
                    ? "bg-violet-500"
                    : h.count >= maxPeak * 0.7
                      ? "bg-violet-300"
                      : "bg-violet-100"
                }`}
                style={{ height: `${(h.count / maxPeak) * 80}px` }}
              ></div>
              <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{h.hour.slice(0, 2)}</span>
            </div>
          ))}
        </div>
        <p className={`mt-3 text-xs ${mutedText}`}>
          {t("analytics.peakTime")}{" "}
          <span className="font-semibold text-violet-600">
            {peakSlot.hour} ({peakSlot.count} bemor)
          </span>
        </p>
      </div>
        </div>
      )}
    </PageStateBoundary>
  );
}
