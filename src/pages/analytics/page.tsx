import { useTranslation } from "react-i18next";
import { useEffect, useId, useRef, useState } from "react";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { getAnalyticsDashboard } from "@/api/analytics";
import type { AnalyticsDashboardDto } from "@/api/types/analytics.types";

type Period = "daily" | "weekly" | "monthly";

const EMPTY_ANALYTICS: AnalyticsDashboardDto = {
  daily: [],
  weekly: [],
  monthly: [],
  doctorPerformance: [],
  topHospitals: [],
};

function nearestIndex(vx: number, pts: { x: number }[]) {
  let best = 0;
  let bestDist = Infinity;
  pts.forEach((p, i) => {
    const d = Math.abs(p.x - vx);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

function vxFromPointer(e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<SVGSVGElement>) {
  const svg = e.currentTarget;
  const rect = svg.getBoundingClientRect();
  const xPx = e.clientX - rect.left;
  const ratio = rect.width > 0 ? xPx / rect.width : 0;
  return ratio * 100;
}

export function AnalyticsPageContent() {
  const { t } = useTranslation("admin");
  const dm = useMainLayoutDarkMode();
  const gradId = useId().replace(/:/g, "");
  const hospitalFilterHelpId = useId().replace(/:/g, "") + "-hospital-filter-help";
  const [period, setPeriod] = useState<Period>("daily");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const isHospitalFilterReady = false;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const scrubbingRef = useRef(false);
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
  const maxVal = Math.max(...data.map((d) => d.patients), 1);
  const chartW = 100;
  const chartH = 180;
  const xDenom = Math.max(1, data.length - 1);

  const pts = data.map((d, i) => {
    const x = (i / xDenom) * chartW;
    const y = chartH - (d.patients / maxVal) * chartH;
    return { x, y, ...d };
  });
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `0,${chartH} ${polyline} ${chartW},${chartH}`;

  const applyPointerX = (e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<SVGSVGElement>) => {
    const vx = vxFromPointer(e);
    setHoverIndex(nearestIndex(vx, pts));
  };

  const tooltipRow = hoverIndex !== null ? data[hoverIndex] : null;
  const tooltipPt = hoverIndex !== null ? pts[hoverIndex] : null;
  const crossStroke = dm ? "rgba(148, 163, 184, 0.55)" : "rgba(100, 116, 139, 0.55)";

  const totalPatients = data.reduce((s, d) => s + d.patients, 0);
  const totalAppointments = data.reduce((s, d) => s + d.appointments, 0);
  const totalCompleted = data.reduce((s, d) => s + d.completed, 0);
  const completionRate = totalAppointments > 0 ? Math.round((totalCompleted / totalAppointments) * 100) : 0;

  return (
    <div className="space-y-5">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className={`flex items-center gap-1 p-1 rounded-lg ${dm ? "bg-[#1A2235]" : "bg-white border border-gray-200"}`}>
            {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeriod(p);
                  setHoverIndex(null);
                  scrubbingRef.current = false;
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-none whitespace-nowrap ${period === p ? "bg-emerald-500 text-white" : dm ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
              >
                {p === "daily" ? t("admin:analytics.period.daily") : p === "weekly" ? t("admin:analytics.period.weekly") : t("admin:analytics.period.monthly")}
              </button>
            ))}
          </div>

          <select
            value={hospitalFilter}
            onChange={(e) => {
              if (!isHospitalFilterReady) return;
              setHospitalFilter(e.target.value);
            }}
            disabled={!isHospitalFilterReady}
            aria-describedby={!isHospitalFilterReady ? hospitalFilterHelpId : undefined}
            className={`px-3 py-2 rounded-lg text-sm outline-none cursor-pointer ${dm ? "bg-[#1A2235] text-white border border-[#1E2A3A]" : "bg-white text-gray-900 border border-gray-200"}`}
          >
            <option value="all">{t("admin:analytics.allHospitals")}</option>
            {analytics.topHospitals.map((h, i) => (
              <option key={i} value={h.name}>{h.name}</option>
            ))}
          </select>
        </div>
        {!isHospitalFilterReady && (
          <p
            id={hospitalFilterHelpId}
            className={`text-xs -mt-1 ${dm ? "text-amber-400" : "text-amber-700"}`}
          >
            Kasalxona bo'yicha kesim filtr funksiyasi tez orada faollashadi.
          </p>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("admin:analytics.summary.totalPatients"), value: totalPatients.toLocaleString(), icon: "ri-user-heart-line", color: "text-emerald-400", bg: "bg-emerald-500/20" },
            { label: t("admin:analytics.summary.appointments"), value: totalAppointments.toLocaleString(), icon: "ri-calendar-check-line", color: "text-blue-400", bg: "bg-blue-500/20" },
            { label: t("admin:analytics.summary.completed"), value: totalCompleted.toLocaleString(), icon: "ri-checkbox-circle-line", color: "text-violet-400", bg: "bg-violet-500/20" },
            { label: t("admin:analytics.summary.completionRate"), value: `${completionRate}%`, icon: "ri-percent-line", color: "text-orange-400", bg: "bg-orange-500/20" },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl p-4 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
              <div className={`w-9 h-9 flex items-center justify-center rounded-lg ${s.bg} mb-3`}>
                <i className={`${s.icon} ${s.color} text-base`}></i>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className={`text-xs mt-1 ${dm ? "text-gray-400" : "text-gray-500"}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Main Chart */}
        <div className={`rounded-xl p-5 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold ${dm ? "text-white" : "text-gray-900"}`}>{t("admin:analytics.flowDynamics")}</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                <span className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>{t("admin:analytics.patients")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                <span className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>{t("admin:analytics.appointments")}</span>
              </div>
            </div>
          </div>

          <div className="relative select-none">
            {tooltipRow && tooltipPt && (
              <div
                className="absolute z-20 pointer-events-none px-2 max-w-[calc(100%-8px)] transition-opacity duration-150"
                style={{
                  left: `${(tooltipPt.x / chartW) * 100}%`,
                  top: `${(tooltipPt.y / chartH) * 100}%`,
                  transform: "translate(-50%, calc(-100% - 8px))",
                }}
                role="tooltip"
              >
                <div
                  className={`rounded-lg px-3 py-2 shadow-xl border text-center min-w-[150px] ${
                    dm ? "bg-[#0F1117] border-[#2A3448] text-white" : "bg-white border-gray-200 text-gray-900 shadow-md"
                  }`}
                >
                  <p className={`text-sm font-semibold mb-1.5 ${dm ? "text-emerald-400" : "text-emerald-600"}`}>{tooltipRow.date}</p>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-sm leading-tight">
                    <span className={dm ? "text-gray-500" : "text-gray-500"}>{t("admin:analytics.patients")}</span>
                    <span className={dm ? "text-gray-500" : "text-gray-500"}>{t("admin:analytics.appointmentShort")}</span>
                    <span className={dm ? "text-gray-500" : "text-gray-500"}>{t("admin:analytics.completeShort")}</span>
                    <span className="font-bold tabular-nums text-emerald-400">{tooltipRow.patients}</span>
                    <span className="font-bold tabular-nums text-blue-400">{tooltipRow.appointments}</span>
                    <span className="font-bold tabular-nums text-violet-400">{tooltipRow.completed}</span>
                  </div>
                </div>
              </div>
            )}
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full touch-none cursor-crosshair"
              style={{ height: 200 }}
              preserveAspectRatio="none"
              onMouseMove={applyPointerX}
              onMouseLeave={() => {
                if (!scrubbingRef.current) setHoverIndex(null);
              }}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                scrubbingRef.current = true;
                applyPointerX(e);
              }}
              onPointerMove={applyPointerX}
              onPointerUp={(e) => {
                scrubbingRef.current = false;
                try {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                } catch {
                  /* ignore */
                }
              }}
              onPointerCancel={() => {
                scrubbingRef.current = false;
              }}
              role="img"
              aria-label={t("admin:analytics.flowChartAria")}
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1="0"
                  y1={chartH * f}
                  x2={chartW}
                  y2={chartH * f}
                  stroke={dm ? "#1E2A3A" : "#f0f0f0"}
                  strokeWidth="0.5"
                />
              ))}
              <polygon points={area} fill={`url(#${gradId})`} />
              <polyline
                points={polyline}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {tooltipPt && (
                <g pointerEvents="none" aria-hidden="true">
                  <line
                    x1={tooltipPt.x}
                    y1={0}
                    x2={tooltipPt.x}
                    y2={chartH}
                    stroke={crossStroke}
                    strokeWidth={0.45}
                    strokeDasharray="1.8 1.8"
                    vectorEffect="nonScalingStroke"
                  />
                </g>
              )}
              {pts.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={hoverIndex === i ? "2.8" : "1.5"}
                  fill="#10b981"
                  className="pointer-events-none"
                />
              ))}
              {tooltipPt && (
                <circle
                  cx={tooltipPt.x}
                  cy={tooltipPt.y}
                  r={4}
                  fill="none"
                  stroke="#6ee7b7"
                  strokeWidth={0.5}
                  opacity={0.95}
                  className="pointer-events-none"
                  vectorEffect="nonScalingStroke"
                />
              )}
            </svg>
          </div>

          <div className="flex justify-between mt-2">
            {data.map((d, i) => (
              <span key={i} className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>{d.date}</span>
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Doctor Performance */}
          <div className={`rounded-xl p-5 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
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
                      <div className="flex items-center gap-0.5">
                        <div className="w-3 h-3 flex items-center justify-center">
                          <i className="ri-star-fill text-yellow-400 text-xs"></i>
                        </div>
                        <span className="text-xs text-yellow-400">{d.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart - Hospitals */}
          <div className={`rounded-xl p-5 ${dm ? "bg-[#1A2235]" : "bg-white"}`}>
            <h3 className={`text-sm font-semibold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>{t("admin:analytics.hospitalComparison")}</h3>
            <div className="space-y-4">
              {analytics.topHospitals.map((h, i) => (
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
            <div className={`mt-5 pt-4 border-t ${dm ? "border-[#1E2130]" : "border-gray-100"}`}>
              <p className={`text-xs font-semibold mb-3 ${dm ? "text-gray-400" : "text-gray-500"}`}>{t("admin:analytics.peakHours")}</p>
              <div className="flex items-end gap-1 h-12">
                {[20, 45, 80, 95, 100, 88, 72, 60, 55, 48, 35, 25].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full rounded-sm bg-emerald-500/60" style={{ height: `${v * 0.44}px` }}></div>
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
