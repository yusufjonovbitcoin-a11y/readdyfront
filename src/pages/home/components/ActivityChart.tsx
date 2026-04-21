import { useId, useRef, useState } from "react";
import type { AnalyticsPeriodPointDto } from "@/api/types/analytics.types";

interface ActivityChartProps {
  darkMode: boolean;
  dailyData: AnalyticsPeriodPointDto[];
  weeklyData: AnalyticsPeriodPointDto[];
  monthlyData: AnalyticsPeriodPointDto[];
}

type Period = "daily" | "weekly" | "monthly";

function nearestIndex(vx: number, pts: { x: number }[]): number {
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

export default function ActivityChart({ darkMode, dailyData, weeklyData, monthlyData }: ActivityChartProps) {
  const gradId = useId().replace(/:/g, "");
  const [period, setPeriod] = useState<Period>("daily");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const scrubbingRef = useRef(false);
  const dataMap = {
    daily: dailyData,
    weekly: weeklyData,
    monthly: monthlyData,
  };

  const data = dataMap[period];
  const maxVal = Math.max(...data.map((d) => d.patients), 1);

  const chartH = 160;
  const chartW = 100;
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

  const crossStroke = darkMode ? "rgba(148, 163, 184, 0.55)" : "rgba(100, 116, 139, 0.55)";

  return (
    <div className={`rounded-xl p-5 ${darkMode ? "bg-[#1A2235]" : "bg-white"}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-base font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Bemor Oqimi</h3>
          <p className={`text-sm mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Barcha kasalxonalar bo'yicha</p>
        </div>
        <div className={`flex items-center gap-1 p-1 rounded-lg ${darkMode ? "bg-[#0F1117]" : "bg-gray-100"}`}>
          {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                setHoverIndex(null);
                scrubbingRef.current = false;
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-none cursor-pointer whitespace-nowrap ${
                period === p
                  ? "bg-emerald-500 text-white"
                  : darkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {p === "daily" ? "Kunlik" : p === "weekly" ? "Haftalik" : "Oylik"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
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
                darkMode ? "bg-[#0F1117] border-[#2A3448] text-white" : "bg-white border-gray-200 text-gray-900 shadow-md"
              }`}
            >
              <p className={`text-sm font-semibold mb-1.5 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>{tooltipRow.date}</p>
              <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-sm leading-tight">
                <span className={darkMode ? "text-gray-500" : "text-gray-500"}>Bemorlar</span>
                <span className={darkMode ? "text-gray-500" : "text-gray-500"}>Uchrashuv</span>
                <span className={darkMode ? "text-gray-500" : "text-gray-500"}>Yakun</span>
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
          style={{ height: 160 }}
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
          aria-label="Bemor oqimi grafigi — crosshair"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1="0"
              y1={chartH * f}
              x2={chartW}
              y2={chartH * f}
              stroke={darkMode ? "#1E2A3A" : "#f0f0f0"}
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
          {/* Trading-style crosshair */}
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

      {/* X labels */}
      <div className="flex justify-between mt-2">
        {data.map((d, i) => (
          <span key={i} className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {d.date}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dashed border-opacity-20" style={{ borderColor: darkMode ? "#1E2A3A" : "#e5e7eb" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Bemorlar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Uchrashuvlar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>
          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Yakunlangan</span>
        </div>
      </div>
    </div>
  );
}
