import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Calendar, Download } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type PatientFlowRow = {
  date: string;
  /** YYYY-MM-DD — grafik oralig‘i filtri uchun (ixtiyoriy) */
  sortDate?: string;
  patients: number;
  appointments?: number;
  completed?: number;
  diagnoses?: number;
};

export type PatientFlowChartPeriod = "daily" | "weekly" | "monthly";

type Period = PatientFlowChartPeriod;

export type PatientFlowRechartsCardLabels = {
  periodDaily: string;
  periodWeekly: string;
  periodMonthly: string;
  patients: string;
  appointments?: string;
  completed?: string;
  diagnoses?: string;
  chartAria: string;
  calendarHint: string;
  exportCsv: string;
  /** Eski brend pill uchun; endi UI da ishlatilmaydi */
  brandShort?: string;
  /** Sana oralig‘i popover */
  dateRangeTitle?: string;
  dateRangeFrom?: string;
  dateRangeTo?: string;
  dateRangeApply?: string;
  dateRangeClear?: string;
  dateRangeTooLong?: string;
  dateRangeHint?: string;
  dateRangeFillBoth?: string;
  dateRangeOrderInvalid?: string;
};

export type PatientFlowRechartsCardProps = {
  darkMode: boolean;
  /** Kunlik / haftalik / oylik rejim */
  showPeriodTabs?: boolean;
  dailyData?: PatientFlowRow[];
  weeklyData?: PatientFlowRow[];
  monthlyData?: PatientFlowRow[];
  /** `showPeriodTabs: false` bo‘lsa — faqat shu seriya */
  flowSeries?: PatientFlowRow[];
  title: string;
  subtitle?: string;
  labels: PatientFlowRechartsCardLabels;
  csvFilenamePrefix: string;
  badge?: string;
  chartHeightClassName?: string;
  /** Tashqi boshqaruv (masalan, super admin tahlil — yuqoridagi filtr bilan sinxron) */
  period?: Period;
  onPeriodChange?: (p: Period) => void;
  /** Oraliqdagi kunlar soni (dan/gacha kunlari bilan), standart 31 */
  maxDateRangeDays?: number;
  /**
   * Super admin MainLayout: StatCard / ViewModeToggle bilan bir xil qorong‘i kartochka sirti (#21262D).
   * Doctor / kasalxona admin GitHub-palitrasi uchun `false` qoldiring.
   */
  mainLayoutDarkSurfaces?: boolean;
};

function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(url);
}

function buildCsv(rows: PatientFlowRow[]): string {
  const header = "date,patients,appointments,completed,diagnoses";
  const lines = rows.map(
    (r) =>
      `${r.date},${r.patients},${r.appointments ?? ""},${r.completed ?? ""},${r.diagnoses ?? ""}`,
  );
  return [header, ...lines].join("\n");
}

const ISO_YMD = /^\d{4}-\d{2}-\d{2}$/;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDaysYmd(ymd: string, delta: number): string {
  const d = new Date(`${ymd}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return toYmd(d);
}

function startOfYmdTs(ymd: string): number {
  return new Date(`${ymd}T00:00:00`).getTime();
}

function endOfYmdTs(ymd: string): number {
  return new Date(`${ymd}T23:59:59.999`).getTime();
}

function inclusiveDayCount(fromYmd: string, toYmd: string): number {
  const a = startOfYmdTs(fromYmd);
  const b = startOfYmdTs(toYmd);
  return Math.floor((b - a) / 86400000) + 1;
}

/** Qator vaqt oralig‘i (oylik seriya — oyning birinchi/oxirgi kuni) */
function rowFilterInterval(row: PatientFlowRow): { start: number; end: number } | null {
  const sort = row.sortDate?.trim();
  if (sort && ISO_YMD.test(sort)) {
    const t = startOfYmdTs(sort);
    return { start: t, end: endOfYmdTs(sort) };
  }
  const d = row.date.trim();
  if (ISO_YMD.test(d)) {
    const t = startOfYmdTs(d);
    return { start: t, end: endOfYmdTs(d) };
  }
  const ym = d.match(/^(\d{4})-(\d{2})$/);
  if (ym) {
    const y = Number(ym[1]);
    const m = Number(ym[2]);
    const start = startOfYmdTs(`${ym[1]}-${ym[2]}-01`);
    const last = new Date(y, m, 0);
    const end = endOfYmdTs(toYmd(last));
    return { start, end };
  }
  const mdOnly = d.match(/^(\d{2})-(\d{2})$/);
  if (mdOnly) {
    const y = new Date().getFullYear();
    const ymd = `${y}-${mdOnly[1]}-${mdOnly[2]}`;
    if (!ISO_YMD.test(ymd)) return null;
    return { start: startOfYmdTs(ymd), end: endOfYmdTs(ymd) };
  }
  return null;
}

function rowOverlapsRange(row: PatientFlowRow, fromYmd: string, toYmd: string): boolean {
  const iv = rowFilterInterval(row);
  if (!iv) return false;
  const r0 = startOfYmdTs(fromYmd);
  const r1 = endOfYmdTs(toYmd);
  return iv.start <= r1 && iv.end >= r0;
}

export function PatientFlowRechartsCard({
  darkMode,
  showPeriodTabs = true,
  dailyData = [],
  weeklyData = [],
  monthlyData = [],
  flowSeries,
  title,
  subtitle,
  labels,
  csvFilenamePrefix,
  badge,
  chartHeightClassName = "h-[360px] w-full md:h-[400px]",
  period: controlledPeriod,
  onPeriodChange,
  maxDateRangeDays = 31,
  mainLayoutDarkSurfaces = false,
}: PatientFlowRechartsCardProps) {
  const gradId = useId().replace(/:/g, "");
  const adminDark = darkMode && mainLayoutDarkSurfaces;
  const [internalPeriod, setInternalPeriod] = useState<Period>("daily");
  const period = controlledPeriod ?? internalPeriod;
  const setPeriod = onPeriodChange ?? setInternalPeriod;

  const maxDays = Math.max(1, maxDateRangeDays);

  const raw = useMemo(() => {
    if (!showPeriodTabs && flowSeries) return flowSeries;
    const map = { daily: dailyData, weekly: weeklyData, monthly: monthlyData };
    return map[period];
  }, [showPeriodTabs, flowSeries, period, dailyData, weeklyData, monthlyData]);

  const [appliedRange, setAppliedRange] = useState<{ from: string; to: string } | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);
  const calendarRootRef = useRef<HTMLDivElement>(null);

  const series = useMemo(() => {
    if (!appliedRange) return raw;
    return raw.filter((row) => rowOverlapsRange(row, appliedRange.from, appliedRange.to));
  }, [raw, appliedRange]);

  const data = series.length > 0 ? series : [{ date: "—", patients: 0 }];

  const maxPatients = Math.max(5, ...data.map((d) => d.patients));
  const yMax = Math.ceil(maxPatients * 1.12);

  const hasAppointments = series.some((r) => typeof r.appointments === "number");
  const hasCompleted = series.some((r) => typeof r.completed === "number");
  const hasDiagnoses = series.some((r) => typeof r.diagnoses === "number");

  const lr = useMemo(
    () => ({
      title: labels.dateRangeTitle ?? "Date range",
      from: labels.dateRangeFrom ?? "From",
      to: labels.dateRangeTo ?? "To",
      apply: labels.dateRangeApply ?? "Apply",
      clear: labels.dateRangeClear ?? "Clear",
      tooLong: labels.dateRangeTooLong ?? `Choose at most ${maxDays} days.`,
      hint: labels.dateRangeHint ?? `Up to ${maxDays} calendar days.`,
      fillBoth: labels.dateRangeFillBoth ?? "Select start and end dates.",
      orderInvalid: labels.dateRangeOrderInvalid ?? "Start date must be before end date.",
    }),
    [labels, maxDays],
  );

  const openCalendar = useCallback(() => {
    setRangeError(null);
    if (appliedRange) {
      setDraftFrom(appliedRange.from);
      setDraftTo(appliedRange.to);
    } else {
      const today = toYmd(new Date());
      setDraftFrom(addDaysYmd(today, -6));
      setDraftTo(today);
    }
    setCalendarOpen(true);
  }, [appliedRange]);

  const applyDraftRange = useCallback(() => {
    if (!draftFrom || !draftTo) {
      setRangeError(lr.fillBoth);
      return;
    }
    if (draftFrom > draftTo) {
      setRangeError(lr.orderInvalid);
      return;
    }
    if (inclusiveDayCount(draftFrom, draftTo) > maxDays) {
      setRangeError(lr.tooLong);
      return;
    }
    setAppliedRange({ from: draftFrom, to: draftTo });
    setRangeError(null);
    setCalendarOpen(false);
  }, [draftFrom, draftTo, maxDays, lr.fillBoth, lr.orderInvalid, lr.tooLong]);

  const clearDateRange = useCallback(() => {
    setAppliedRange(null);
    setRangeError(null);
    setCalendarOpen(false);
  }, []);

  const onChangeDraftFrom = useCallback(
    (v: string) => {
      setRangeError(null);
      setDraftFrom(v);
      if (!v) return;
      const capTo = addDaysYmd(v, maxDays - 1);
      setDraftTo((prev) => {
        if (!prev || prev < v) return v;
        return prev > capTo ? capTo : prev;
      });
    },
    [maxDays],
  );

  const onChangeDraftTo = useCallback(
    (v: string) => {
      setRangeError(null);
      setDraftTo(v);
      if (!v) return;
      const capFrom = addDaysYmd(v, -(maxDays - 1));
      setDraftFrom((prev) => {
        if (!prev || prev > v) return v;
        return prev < capFrom ? capFrom : prev;
      });
    },
    [maxDays],
  );

  useEffect(() => {
    setAppliedRange(null);
  }, [period]);

  useEffect(() => {
    if (!calendarOpen) return;
    const onDocDown = (e: MouseEvent) => {
      const root = calendarRootRef.current;
      if (root && !root.contains(e.target as Node)) setCalendarOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCalendarOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [calendarOpen]);

  const periodLabel = (p: Period) =>
    p === "daily" ? labels.periodDaily : p === "weekly" ? labels.periodWeekly : labels.periodMonthly;

  const shell = darkMode
    ? adminDark
      ? "rounded-xl bg-[#21262D] p-5 sm:p-6"
      : "rounded-xl border border-[#30363D] bg-[#21262D] p-5 sm:p-6"
    : "rounded-xl border border-gray-100 bg-white p-5 sm:p-6";

  const pillGroup = darkMode
    ? adminDark
      ? "rounded-lg border border-[#30363D] bg-[#21262D] p-1"
      : "rounded-lg border border-[#30363D] bg-[#21262D] p-1"
    : "rounded-lg border border-gray-200 bg-gray-100 p-1";
  const pillIdle = darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900";
  const pillActive = darkMode
    ? adminDark
      ? "bg-[#30363D] text-white shadow-sm"
      : "bg-[#30363D] text-white shadow-sm"
    : "bg-white text-gray-900 shadow-sm border border-gray-200";

  const iconBtn = darkMode
    ? adminDark
      ? "rounded-lg border border-[#30363D] bg-[#21262D] p-2 text-gray-400 transition-colors hover:bg-[#30363D]/50 hover:text-white"
      : "rounded-lg border border-[#30363D] bg-[#21262D] p-2 text-gray-400 transition-colors hover:text-white"
    : "rounded-lg border border-gray-200 bg-gray-100 p-2 text-gray-500 transition-colors hover:text-gray-900";

  const gridStroke = adminDark ? "#252a3a" : darkMode ? "#1F1F1F" : "#e2e8f0";
  const tickFill = darkMode ? "#737373" : "#64748b";

  const onExportCsv = () => {
    if (raw.length === 0 || series.length === 0) return;
    const slug = !showPeriodTabs ? "seriya" : period === "daily" ? "kunlik" : period === "weekly" ? "haftalik" : "oylik";
    downloadText(`${csvFilenamePrefix}-${slug}.csv`, buildCsv(series), "text/csv;charset=utf-8");
  };

  const colCount = 1 + (hasAppointments ? 1 : 0) + (hasCompleted ? 1 : 0) + (hasDiagnoses ? 1 : 0);

  const draftToMax = draftFrom ? addDaysYmd(draftFrom, maxDays - 1) : "";
  const draftFromMin = draftTo ? addDaysYmd(draftTo, -(maxDays - 1)) : "";

  return (
    <div className={`flex flex-col gap-5 ${shell}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between md:gap-2 lg:gap-4">
        <h2
          className={`min-w-0 max-w-full shrink text-xl font-medium tracking-tight sm:max-w-[min(100%,36rem)] ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          {title}
        </h2>
        <div className="flex min-w-0 flex-wrap items-center gap-2 md:gap-3 lg:gap-4">
          {showPeriodTabs ? (
            <div className={`flex items-center ${pillGroup}`}>
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`cursor-pointer whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-colors md:px-2 md:text-xs lg:px-3 lg:text-sm ${
                    period === p ? pillActive : pillIdle
                  }`}
                >
                  {periodLabel(p)}
                </button>
              ))}
            </div>
          ) : null}
          {badge ? (
            <span
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                darkMode ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {badge}
            </span>
          ) : null}
          <div className="relative flex items-center gap-2" ref={calendarRootRef}>
            <button
              type="button"
              disabled={raw.length === 0}
              className={`${iconBtn} ${appliedRange ? "ring-1 ring-emerald-500/60" : ""} ${raw.length === 0 ? "cursor-not-allowed opacity-50" : ""}`}
              title={labels.calendarHint}
              aria-label={labels.calendarHint}
              aria-expanded={calendarOpen}
              aria-haspopup="dialog"
              onClick={() => {
                if (raw.length === 0) return;
                if (calendarOpen) setCalendarOpen(false);
                else openCalendar();
              }}
            >
              <Calendar className="h-5 w-5" aria-hidden />
            </button>
            {calendarOpen ? (
              <div
                role="dialog"
                aria-label={lr.title}
                className={`absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,20rem)] rounded-xl border p-4 shadow-xl ${
                  darkMode
                    ? adminDark
                      ? "border-[#30363D] bg-[#21262D]"
                      : "border-[#30363D] bg-[#21262D]"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className={`mb-3 text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{lr.title}</p>
                <p className={`mb-3 text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>{lr.hint}</p>
                <div className="flex flex-col gap-2">
                  <label className={`flex flex-col gap-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    <span>{lr.from}</span>
                    <input
                      type="date"
                      value={draftFrom}
                      max={draftTo || undefined}
                      min={draftTo ? draftFromMin : undefined}
                      onChange={(e) => onChangeDraftFrom(e.target.value)}
                      className={`rounded-lg border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                        darkMode
                          ? adminDark
                            ? "border-[#30363D] bg-[#0F1117] text-white"
                            : "border-[#30363D] bg-[#0D1117] text-white"
                          : "border-gray-200 bg-white text-gray-900"
                      }`}
                    />
                  </label>
                  <label className={`flex flex-col gap-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    <span>{lr.to}</span>
                    <input
                      type="date"
                      value={draftTo}
                      min={draftFrom || draftFromMin || undefined}
                      max={draftFrom ? draftToMax : undefined}
                      onChange={(e) => onChangeDraftTo(e.target.value)}
                      className={`rounded-lg border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                        darkMode
                          ? adminDark
                            ? "border-[#30363D] bg-[#0F1117] text-white"
                            : "border-[#30363D] bg-[#0D1117] text-white"
                          : "border-gray-200 bg-white text-gray-900"
                      }`}
                    />
                  </label>
                </div>
                {rangeError ? (
                  <p className={`mt-2 text-xs ${darkMode ? "text-amber-400" : "text-amber-700"}`} role="alert">
                    {rangeError}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={applyDraftRange}
                    className="min-h-9 flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                  >
                    {lr.apply}
                  </button>
                  <button
                    type="button"
                    onClick={clearDateRange}
                    className={`min-h-9 flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      darkMode
                        ? adminDark
                          ? "border-[#30363D] text-gray-300 hover:bg-[#30363D]/50"
                          : "border-[#30363D] text-gray-300 hover:bg-[#30363D]"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {lr.clear}
                  </button>
                </div>
              </div>
            ) : null}
            <button
              type="button"
              className={`${iconBtn} ${raw.length === 0 || series.length === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              title={labels.exportCsv}
              aria-label={labels.exportCsv}
              disabled={raw.length === 0 || series.length === 0}
              onClick={onExportCsv}
            >
              <Download className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {subtitle ? <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{subtitle}</p> : null}

      <div className={chartHeightClassName}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`${gradId}-pat`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#86efac" stopOpacity={darkMode ? 0.35 : 0.28} />
                <stop offset="95%" stopColor="#86efac" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: tickFill, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              domain={[0, yMax]}
              orientation="right"
              tick={{ fill: tickFill, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: darkMode ? "rgba(148,163,184,0.35)" : "rgba(100,116,139,0.35)", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as PatientFlowRow;
                return (
                  <div
                    className={`rounded-lg border p-2.5 shadow-xl ${
                      darkMode
                        ? adminDark
                          ? "border-[#30363D] bg-[#21262D] text-white"
                          : "border-[#30363D] bg-[#21262D] text-white"
                        : "border-gray-200 bg-white text-gray-900"
                    }`}
                  >
                    <p className="text-sm font-semibold text-emerald-400">{row.date}</p>
                    <div
                      className="mt-1.5 grid gap-x-3 gap-y-0.5 text-xs"
                      style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0,1fr))` }}
                    >
                      <span className={darkMode ? "text-gray-500" : "text-gray-500"}>{labels.patients}</span>
                      {hasAppointments && labels.appointments ? (
                        <span className={darkMode ? "text-gray-500" : "text-gray-500"}>{labels.appointments}</span>
                      ) : null}
                      {hasCompleted && labels.completed ? (
                        <span className={darkMode ? "text-gray-500" : "text-gray-500"}>{labels.completed}</span>
                      ) : null}
                      {hasDiagnoses && labels.diagnoses ? (
                        <span className={darkMode ? "text-gray-500" : "text-gray-500"}>{labels.diagnoses}</span>
                      ) : null}
                      <span className="font-bold tabular-nums text-emerald-300">{row.patients}</span>
                      {hasAppointments ? (
                        <span className="font-bold tabular-nums text-cyan-400">{row.appointments ?? "—"}</span>
                      ) : null}
                      {hasCompleted ? (
                        <span className="font-bold tabular-nums text-violet-400">{row.completed ?? "—"}</span>
                      ) : null}
                      {hasDiagnoses ? (
                        <span className="font-bold tabular-nums text-green-400">{row.diagnoses ?? "—"}</span>
                      ) : null}
                    </div>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="patients"
              name={labels.patients}
              stroke="#86efac"
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradId}-pat)`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: "#86efac" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div
        className={`flex flex-wrap items-center gap-4 border-t pt-3 ${
          darkMode ? (adminDark ? "border-[#30363D]" : "border-[#30363D]") : "border-gray-100"
        }`}
        aria-label={labels.chartAria}
      >
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{labels.patients}</span>
        </div>
        {hasAppointments && labels.appointments ? (
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{labels.appointments}</span>
          </div>
        ) : null}
        {hasCompleted && labels.completed ? (
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-violet-400" />
            <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{labels.completed}</span>
          </div>
        ) : null}
        {hasDiagnoses && labels.diagnoses ? (
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{labels.diagnoses}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
