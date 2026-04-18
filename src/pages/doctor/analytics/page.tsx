import { useMemo, useState } from "react";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { docAnalytics } from "@/mocks/doc_patients";
import { useDoctorTheme } from "@/context/DoctorThemeContext";

type Period = 'daily' | 'weekly' | 'monthly';

const weeklyData = [
  { label: 'Du', patients: 14, diagnoses: 12 },
  { label: 'Se', patients: 11, diagnoses: 9 },
  { label: 'Ch', patients: 16, diagnoses: 14 },
  { label: 'Pa', patients: 9, diagnoses: 8 },
  { label: 'Ju', patients: 13, diagnoses: 11 },
  { label: 'Sh', patients: 15, diagnoses: 13 },
  { label: 'Ya', patients: 7, diagnoses: 4 },
];

const monthlyData = [
  { label: '1-hafta', patients: 68, diagnoses: 58 },
  { label: '2-hafta', patients: 74, diagnoses: 63 },
  { label: '3-hafta', patients: 61, diagnoses: 52 },
  { label: '4-hafta', patients: 85, diagnoses: 71 },
];

const peakHours = [
  { hour: '08:00', count: 3 },
  { hour: '09:00', count: 8 },
  { hour: '10:00', count: 12 },
  { hour: '11:00', count: 10 },
  { hour: '12:00', count: 5 },
  { hour: '13:00', count: 2 },
  { hour: '14:00', count: 9 },
  { hour: '15:00', count: 11 },
  { hour: '16:00', count: 7 },
  { hour: '17:00', count: 4 },
];

const diagnosisList = [
  { name: 'Arterial gipertenziya', count: 28, color: 'bg-violet-500' },
  { name: 'Stenokardiya', count: 19, color: 'bg-blue-500' },
  { name: 'Yurak yetishmovchiligi', count: 14, color: 'bg-red-500' },
  { name: 'Aritmiya', count: 11, color: 'bg-amber-500' },
  { name: 'Boshqa', count: 13, color: 'bg-gray-400' },
];

export default function DocAnalyticsPage() {
  return (
    <DocLayout title="Tahlil">
      <DocAnalyticsContent />
    </DocLayout>
  );
}

function DocAnalyticsContent() {
  const [period, setPeriod] = useState<Period>('weekly');
  const { darkMode } = useDoctorTheme();

  const chartData = useMemo(() => {
    if (period === "daily") {
      return docAnalytics.map((d) => ({
        label: d.date.slice(5),
        patients: d.patients,
        diagnoses: d.diagnoses,
      }));
    }
    return period === "weekly" ? weeklyData : monthlyData;
  }, [period]);

  const maxVal = Math.max(...chartData.map(d => d.patients));
  const totalPatients = chartData.reduce((s, d) => s + d.patients, 0);
  const totalDiagnoses = chartData.reduce((s, d) => s + d.diagnoses, 0);
  const maxPeak = Math.max(...peakHours.map(h => h.count));
  const totalDiagCount = diagnosisList.reduce((s, d) => s + d.count, 0);
  const cardBase = darkMode ? "bg-[#161B22] border-[#30363D]" : "bg-white border-gray-100";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const titleText = darkMode ? "text-white" : "text-gray-900";

  return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className={`text-xl font-bold ${titleText}`}>Mening Tahlilim</h2>
            <p className={`text-sm mt-0.5 ${mutedText}`}>Dr. Alisher Karimov — Kardiologiya</p>
          </div>
          <div className={`flex items-center rounded-xl p-1 ${darkMode ? "bg-[#21262D]" : "bg-gray-100"}`}>
            {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  period === p
                    ? darkMode
                      ? 'bg-[#30363D] text-violet-300 shadow-sm'
                      : 'bg-white text-violet-700 shadow-sm'
                    : darkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p === 'daily' ? 'Kunlik' : p === 'weekly' ? 'Haftalik' : 'Oylik'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Jami bemorlar", value: totalPatients, icon: "ri-user-heart-line", color: "text-violet-600", bg: "bg-violet-50", trend: "+12%" },
            { label: "Tashxislar", value: totalDiagnoses, icon: "ri-stethoscope-line", color: "text-green-600", bg: "bg-green-50", trend: "+8%" },
            { label: "O'rtacha vaqt", value: "19 daq", icon: "ri-timer-line", color: "text-blue-600", bg: "bg-blue-50", trend: "-2 daq" },
            { label: "Samaradorlik", value: `${Math.round((totalDiagnoses / totalPatients) * 100)}%`, icon: "ri-bar-chart-line", color: "text-amber-600", bg: "bg-amber-50", trend: "+3%" },
          ].map((stat, i) => (
            <div key={i} className={`rounded-xl border p-4 ${cardBase}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${stat.bg}`}>
                  <i className={`${stat.icon} text-lg ${stat.color}`}></i>
                </div>
                <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
              </div>
              <p className={`text-2xl font-bold ${titleText}`}>{stat.value}</p>
              <p className={`text-xs mt-0.5 ${mutedText}`}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Patient Flow Chart */}
          <div key={`${period}-${darkMode ? "dark" : "light"}`} className={`lg:col-span-2 rounded-xl border p-5 ${cardBase}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-base font-semibold ${titleText}`}>Bemor Oqimi</h3>
              <div className={`flex items-center gap-3 text-xs ${mutedText}`}>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-violet-500 inline-block"></span>
                  Bemorlar
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
                  Tashxislar
                </span>
              </div>
            </div>
            <div className="flex items-end gap-2 h-48">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5 h-40">
                    <div
                      className="flex-1 bg-violet-500 rounded-t-md transition-all"
                      style={{ height: `${(d.patients / maxVal) * 100}%` }}
                    ></div>
                    <div
                      className="flex-1 bg-green-400 rounded-t-md transition-all"
                      style={{ height: `${(d.diagnoses / maxVal) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnosis Distribution */}
          <div className={`rounded-xl border p-5 ${cardBase}`}>
            <h3 className={`text-base font-semibold mb-4 ${titleText}`}>Tashxislar</h3>
            <div className="space-y-3">
              {diagnosisList.map((d, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{d.name}</span>
                    <span className={`text-xs ${mutedText}`}>{d.count}</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${darkMode ? "bg-[#21262D]" : "bg-gray-100"}`}>
                    <div
                      className={`h-full ${d.color} rounded-full transition-all`}
                      style={{ width: `${(d.count / totalDiagCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className={`mt-4 pt-4 border-t ${darkMode ? "border-[#30363D]" : "border-gray-100"}`}>
              <p className={`text-xs ${mutedText}`}>Jami tashxislar: <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{totalDiagCount}</span></p>
            </div>
          </div>
        </div>

        {/* Peak Hours */}
        <div className={`rounded-xl border p-5 ${cardBase}`}>
          <h3 className={`text-base font-semibold mb-4 ${titleText}`}>Eng Yuqori Soatlar</h3>
          <div className="flex items-end gap-2 h-32">
            {peakHours.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className={`text-xs font-medium ${mutedText}`}>{h.count}</span>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    h.count === maxPeak ? 'bg-violet-500' : h.count >= maxPeak * 0.7 ? 'bg-violet-300' : 'bg-violet-100'
                  }`}
                  style={{ height: `${(h.count / maxPeak) * 80}px` }}
                ></div>
                <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{h.hour.slice(0, 2)}</span>
              </div>
            ))}
          </div>
          <p className={`text-xs mt-3 ${mutedText}`}>
            Eng band vaqt: <span className="font-semibold text-violet-600">10:00 — 11:00</span> (12 bemor)
          </p>
        </div>
      </div>
  );
}
