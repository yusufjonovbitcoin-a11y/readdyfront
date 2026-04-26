import { useTranslation } from "react-i18next";
import { useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HALayout from "@/pages/hospital-admin/components/HALayout";
import { useHospitalAdminDarkMode } from "@/context/HospitalAdminThemeContext";
import { useQuery } from "@tanstack/react-query";
import { haAnalyticsBundleQueryOptions } from "@/lib/coreQueryCache";

type Period = 'daily' | 'weekly' | 'monthly';

function BarChart({ data, valueKey, labelKey, color, darkMode, height = 140 }: {
  data: Array<Record<string, number | string> & { id?: string }>; valueKey: string; labelKey: string; color: string; darkMode: boolean; height?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const values = data.map((d) => Number(d[valueKey]));
  const max = Math.max(...values, 1);
  const topReserve = 22;
  const bottomReserve = 22;
  const barMax = Math.max(height - topReserve - bottomReserve, 32);

  return (
    <div className="flex items-end gap-1.5 sm:gap-2" style={{ height }}>
      {data.map((d, i) => {
        const isSelected = selected === i;
        const isHover = hovered === i;
        const showValue = isHover || isSelected;
        const barH = (values[i] / max) * barMax;
        return (
          <button
            type="button"
            key={d.id ?? `${String(d[labelKey])}`}
            className="flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1 rounded-sm border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered((current) => (current === i ? null : current))}
            onClick={() => setSelected((s) => (s === i ? null : i))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelected((s) => (s === i ? null : i));
              }
            }}
            aria-label={`${String(d[labelKey])}: ${values[i].toLocaleString("uz-UZ")} bemor`}
            aria-pressed={isSelected}
          >
            <div className="flex h-[22px] w-full items-end justify-center">
              {showValue && (
                <span
                  className={`text-[11px] font-semibold tabular-nums leading-none ${
                    darkMode ? "text-teal-300" : "text-teal-600"
                  }`}
                >
                  {values[i].toLocaleString("uz-UZ")}
                </span>
              )}
            </div>
            <div
              className={`w-full max-w-[48px] rounded-t-md transition-all ${color} ${showValue ? "ring-2 ring-teal-400/45" : ""}`}
              style={{ height: `${barH}px`, minHeight: barH > 0 ? 3 : 0 }}
            />
            <span
              className={`text-[9px] whitespace-nowrap ${showValue ? (darkMode ? "text-gray-300" : "text-gray-600") : darkMode ? "text-gray-500" : "text-gray-400"}`}
            >
              {String(d[labelKey])}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LineChart({ data, darkMode }: { data: { id?: string; month: string; patients: number }[]; darkMode: boolean }) {
  const gradId = useId().replace(/:/g, "");
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const vals = data.map((d) => d.patients);
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals);
  /* Keng viewBox — SVG `meet` bilan asosiy maydon bo‘yicha kattaroq chiziladi (560px cheklovi yo‘qoladi) */
  const w = 1000;
  const h = 220;
  const pad = { l: 44, r: 44, t: 36, b: 30 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;
  const denom = Math.max(data.length - 1, 1);
  const span = max - min || 1;

  const pts = data.map((d, i) => ({
    x: pad.l + (i / denom) * cw,
    y: pad.t + ch - ((d.patients - min) / span) * ch,
    ...d,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${pad.t + ch} L ${pts[0].x} ${pad.t + ch} Z`;

  const valueFill = darkMode ? "#5eead4" : "#0d9488";
  const labelFill = darkMode ? "#6b7280" : "#9ca3af";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      className="aspect-[1000/220] h-auto w-full max-w-full select-none touch-manipulation"
      role="img"
      aria-label="Yillik bemorlar dinamikasi — nuqtani bosing yoki ustiga keltiring"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => {
        const showValue = hovered !== null ? hovered === i : selected === i;
        return (
          <g
            key={p.id ?? p.month}
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
                y={p.y - 14}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={valueFill}
                style={{ pointerEvents: "none" }}
              >
                {p.patients.toLocaleString("uz-UZ")}
              </text>
            )}
            <circle cx={p.x} cy={p.y} r={20} fill="transparent" pointerEvents="all" />
            <circle
              cx={p.x}
              cy={p.y}
              r={showValue ? 6 : 4}
              fill={darkMode ? "#141824" : "#ffffff"}
              stroke="#14b8a6"
              strokeWidth={showValue ? 2.5 : 2}
              style={{ pointerEvents: "none" }}
            />
            <text
              x={p.x}
              y={h - 6}
              textAnchor="middle"
              fontSize="13"
              fontWeight={showValue ? 600 : 500}
              fill={showValue ? valueFill : labelFill}
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
  const darkMode = useHospitalAdminDarkMode();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('daily');
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

  const periodData = useMemo(
    () => (period === "daily" ? haAnalyticsDailyData : period === "weekly" ? haAnalyticsWeeklyData : haAnalyticsMonthlyData),
    [period, haAnalyticsDailyData, haAnalyticsWeeklyData, haAnalyticsMonthlyData],
  );
  const valueKey = 'patients';
  const labelKey = period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month';

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

  const cardBase = `rounded-xl border p-5 ${darkMode ? "bg-[#141824] border-[#1E2130]" : "bg-white border-gray-100"}`;

  if (
    analyticsState.isLoading
  ) {
    return (
      <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-[#141824] border border-[#1E2130] text-gray-400" : "bg-white border border-gray-100 text-gray-500"}`}>
        Yuklanmoqda...
      </div>
    );
  }

  if (
    analyticsState.isError
  ) {
    return (
      <div className={`rounded-xl p-8 text-center ${darkMode ? "bg-[#141824] border border-[#1E2130] text-gray-300" : "bg-white border border-gray-100 text-gray-700"}`}>
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

        {/* Period chart */}
        <div className={cardBase}>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h3 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{t("analytics.patientFlow")}</h3>
              <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{t("analytics.timeStats")}</p>
            </div>
            <div className={`flex items-center gap-1 p-1 rounded-xl ${darkMode ? "bg-[#1A2235]" : "bg-gray-100"}`}>
              {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    period === p ? darkMode ? "bg-[#141824] text-teal-400" : "bg-white text-teal-600" : darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {p === 'daily' ? t("analytics.period.daily") : p === 'weekly' ? t("analytics.period.weekly") : t("analytics.period.monthly")}
                </button>
              ))}
            </div>
          </div>
          <BarChart
            key={period}
            data={periodData as Record<string, number | string>[]}
            valueKey={valueKey}
            labelKey={labelKey}
            color="bg-teal-500"
            darkMode={darkMode}
            height={160}
          />
        </div>

        <div className={cardBase}>
          <h3 className={`text-sm font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>{t("analytics.yearlyTrend")}</h3>
          <LineChart data={haAnalyticsMonthlyData} darkMode={darkMode} />
        </div>

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
                  <th scope="col" className="text-left pb-3 font-medium">{t("analytics.table.rating")}</th>
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
                        darkMode ? "border-[#1E2130]" : "border-gray-50"
                      } ${
                        doctorId
                          ? `cursor-pointer ${darkMode ? "hover:bg-[#1A2235]/80 focus-visible:bg-[#1A2235]/80" : "hover:bg-gray-50 focus-visible:bg-gray-50"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50`
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
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-star-fill text-amber-400 text-xs"></i>
                          </div>
                          <span className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>{doc.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 w-32">
                        <div className={`h-1.5 rounded-full ${darkMode ? "bg-[#1A2235]" : "bg-gray-100"}`}>
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
