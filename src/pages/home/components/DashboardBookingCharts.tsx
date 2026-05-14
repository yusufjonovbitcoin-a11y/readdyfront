import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CityStatPointDto, DailyBookingPointDto, WeeklyBookingPointDto } from "@/api/types/analytics.types";

const PIE_COLORS = ["#14b8a6", "#22d3ee", "#6366f1", "#a855f7", "#f59e0b", "#f472b6", "#38bdf8", "#94a3b8", "#34d399", "#818cf8"];

interface DashboardBookingChartsProps {
  darkMode: boolean;
  dailyBookings: DailyBookingPointDto[];
  cityStats: CityStatPointDto[];
  weeklyBookings: WeeklyBookingPointDto[];
}

function cardClass(darkMode: boolean): string {
  return `rounded-xl border p-4 md:p-5 ${darkMode ? "border-[#30363D] bg-[#21262D]" : "border-gray-100 bg-white"}`;
}

export function DashboardBookingCharts({
  darkMode,
  dailyBookings,
  cityStats,
  weeklyBookings,
}: DashboardBookingChartsProps) {
  const { t } = useTranslation("admin");
  const axisStroke = darkMode ? "#6b7280" : "#9ca3af";
  const tickFill = darkMode ? "#9ca3ab" : "#4b5563";
  const gridStroke = darkMode ? "#30363D" : "#e5e7eb";
  const tooltipStyle = useMemo(
    () => ({
      backgroundColor: darkMode ? "#0F1117" : "#ffffff",
      border: darkMode ? "1px solid #30363D" : "1px solid #e5e7eb",
      borderRadius: 8,
      color: darkMode ? "#e5e7eb" : "#111827",
    }),
    [darkMode],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={cardClass(darkMode)}>
          <h3 className={`mb-4 text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
            {t("home.charts.bookingsByDay")}
          </h3>
          <div className="h-[280px] w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyBookings} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickFill }} stroke={axisStroke} />
                <YAxis tick={{ fontSize: 11, fill: tickFill }} stroke={axisStroke} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: tickFill }} />
                <Bar
                  dataKey="successful"
                  name={t("home.charts.successful")}
                  fill="#14b8a6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="failed"
                  name={t("home.charts.failed")}
                  fill="#f87171"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardClass(darkMode)}>
          <h3 className={`mb-4 text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
            {t("home.charts.distributionByRegion")}
          </h3>
          <div className="h-[280px] w-full min-h-[220px]">
            {cityStats.length === 0 ? (
              <p className={`flex h-full items-center justify-center text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                {t("home.charts.noData")}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cityStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={92}
                    dataKey="successful"
                    nameKey="city"
                    paddingAngle={1}
                    label={({ city, percent }) =>
                      `${String(city).length > 14 ? `${String(city).slice(0, 12)}…` : city} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={{ stroke: axisStroke }}
                  >
                    {cityStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: tickFill }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${cardClass(darkMode)} lg:col-span-2`}>
          <h3 className={`mb-4 text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
            {t("home.charts.weeklyTrend")}
          </h3>
          <div className="h-[280px] w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyBookings} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: tickFill }} stroke={axisStroke} />
                <YAxis tick={{ fontSize: 11, fill: tickFill }} stroke={axisStroke} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: tickFill }} />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  name={t("home.charts.bookings")}
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#14b8a6" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
