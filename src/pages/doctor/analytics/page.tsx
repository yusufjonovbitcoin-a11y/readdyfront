import { useMemo, useState } from "react";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { docAnalytics } from "@/mocks/doc_patients";
import { useDoctorTheme } from "@/context/DoctorThemeContext";

type Period = "daily" | "weekly" | "monthly";

const weeklyData = [
  { label: "Du", patients: 14, diagnoses: 12, avgDuration: 18 },
  { label: "Se", patients: 11, diagnoses: 9, avgDuration: 20 },
  { label: "Ch", patients: 16, diagnoses: 14, avgDuration: 17 },
  { label: "Pa", patients: 9, diagnoses: 8, avgDuration: 22 },
  { label: "Ju", patients: 13, diagnoses: 11, avgDuration: 19 },
  { label: "Sh", patients: 15, diagnoses: 13, avgDuration: 16 },
  { label: "Ya", patients: 7, diagnoses: 4, avgDuration: 21 },
];

const monthlyData = [
  { label: "1-hafta", patients: 68, diagnoses: 58, avgDuration: 19 },
  { label: "2-hafta", patients: 74, diagnoses: 63, avgDuration: 18 },
  { label: "3-hafta", patients: 61, diagnoses: 52, avgDuration: 20 },
  { label: "4-hafta", patients: 85, diagnoses: 71, avgDuration: 17 },
];

/** Tashxis ulushi (%) — jami tashxis soniga qarab count hisoblanadi */
const diagnosisShares: Record<
  Period,
  { name: string; share: number; color: string }[]
> = {
  daily: [
    { name: "Arterial gipertenziya", share: 32, color: "bg-violet-500" },
    { name: "Stenokardiya", share: 22, color: "bg-blue-500" },
    { name: "Yurak yetishmovchiligi", share: 18, color: "bg-red-500" },
    { name: "Aritmiya", share: 14, color: "bg-amber-500" },
    { name: "Boshqa", share: 14, color: "bg-gray-400" },
  ],
  weekly: [
    { name: "Arterial gipertenziya", share: 30, color: "bg-violet-500" },
    { name: "Stenokardiya", share: 21, color: "bg-blue-500" },
    { name: "Yurak yetishmovchiligi", share: 16, color: "bg-red-500" },
    { name: "Aritmiya", share: 12, color: "bg-amber-500" },
    { name: "Boshqa", share: 21, color: "bg-gray-400" },
  ],
  monthly: [
    { name: "Arterial gipertenziya", share: 28, color: "bg-violet-500" },
    { name: "Stenokardiya", share: 20, color: "bg-blue-500" },
    { name: "Yurak yetishmovchiligi", share: 18, color: "bg-red-500" },
    { name: "Aritmiya", share: 15, color: "bg-amber-500" },
    { name: "Boshqa", share: 19, color: "bg-gray-400" },
  ],
};

const peakHoursByPeriod: Record<Period, { hour: string; count: number }[]> = {
  daily: [
    { hour: "08:00", count: 2 },
    { hour: "09:00", count: 6 },
    { hour: "10:00", count: 10 },
    { hour: "11:00", count: 8 },
    { hour: "12:00", count: 4 },
    { hour: "13:00", count: 2 },
    { hour: "14:00", count: 7 },
    { hour: "15:00", count: 9 },
    { hour: "16:00", count: 6 },
    { hour: "17:00", count: 3 },
  ],
  weekly: [
    { hour: "08:00", count: 3 },
    { hour: "09:00", count: 8 },
    { hour: "10:00", count: 12 },
    { hour: "11:00", count: 10 },
    { hour: "12:00", count: 5 },
    { hour: "13:00", count: 2 },
    { hour: "14:00", count: 9 },
    { hour: "15:00", count: 11 },
    { hour: "16:00", count: 7 },
    { hour: "17:00", count: 4 },
  ],
  monthly: [
    { hour: "08:00", count: 5 },
    { hour: "09:00", count: 12 },
    { hour: "10:00", count: 18 },
    { hour: "11:00", count: 15 },
    { hour: "12:00", count: 9 },
    { hour: "13:00", count: 4 },
    { hour: "14:00", count: 14 },
    { hour: "15:00", count: 16 },
    { hour: "16:00", count: 11 },
    { hour: "17:00", count: 7 },
  ],
};

/** Oldingi davr bilan taqqoslash (mock) — tugmalar o‘zgarganda yangilanadi */
const trendByPeriod: Record<
  Period,
  { patients: string; diagnoses: string; avgTime: string; efficiency: string }
> = {
  daily: { patients: "+4%", diagnoses: "+2%", avgTime: "-1 daq", efficiency: "+1%" },
  weekly: { patients: "+12%", diagnoses: "+8%", avgTime: "-2 daq", efficiency: "+3%" },
  monthly: { patients: "+18%", diagnoses: "+14%", avgTime: "-3 daq", efficiency: "+5%" },
};

export default function DocAnalyticsPage() {
  return (
    <DocLayout title="Tahlil">
      <DocAnalyticsContent />
    </DocLayout>
  );
}

function DocAnalyticsContent() {
  const [period, setPeriod] = useState<Period>("weekly");
  const { darkMode } = useDoctorTheme();

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
      chartData = weeklyData;
    } else {
      chartData = monthlyData;
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

    const peakHours = peakHoursByPeriod[period];
    const maxPeak = Math.max(...peakHours.map((h) => h.count), 1);
    const peakIdx = peakHours.reduce((best, h, i, arr) => (h.count > arr[best].count ? i : best), 0);
    const peakSlot = peakHours[peakIdx];

    const shares = diagnosisShares[period];
    const diagnosisList = shares.map((row) => ({
      name: row.name,
      color: row.color,
      count: totalDiagnoses > 0 ? Math.max(1, Math.round((row.share / 100) * totalDiagnoses)) : 0,
    }));
    const totalDiagListed = diagnosisList.reduce((s, d) => s + d.count, 0);

    const trends = trendByPeriod[period];

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
  }, [period]);

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
    <div className="min-w-0 space-y-5">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold ${titleText}`}>Mening Tahlilim</h2>
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
              {p === "daily" ? "Kunlik" : p === "weekly" ? "Haftalik" : "Oylik"}
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
            <h3 className={`text-base font-semibold ${titleText}`}>Bemor Oqimi</h3>
            <div className={`flex items-center gap-3 text-xs ${mutedText}`}>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-violet-500"></span>
                Bemorlar
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full bg-green-400"></span>
                Tashxislar
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
          <h3 className={`mb-4 text-base font-semibold ${titleText}`}>Tashxislar</h3>
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
              Jami tashxislar:{" "}
              <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{totalDiagnoses}</span>
            </p>
          </div>
        </div>
      </div>

      <div className={`rounded-xl border p-5 ${cardBase}`}>
        <h3 className={`mb-4 text-base font-semibold ${titleText}`}>Eng Yuqori Soatlar</h3>
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
          Eng band vaqt:{" "}
          <span className="font-semibold text-violet-600">
            {peakSlot.hour} ({peakSlot.count} bemor)
          </span>
        </p>
      </div>
    </div>
  );
}
