import { useMemo, useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type PeakHoursBarRow = { label: string; count: number };

export type PeakHoursRangeId = "24h" | "7d" | "30d";

const RANGE_ORDER: PeakHoursRangeId[] = ["24h", "7d", "30d"];

export type PeakHoursRechartsBarProps = {
  darkMode: boolean;
  data?: PeakHoursBarRow[];
  ranges?: Record<PeakHoursRangeId, PeakHoursBarRow[]>;
  defaultRange?: PeakHoursRangeId;
  rangeTabLabels?: Record<PeakHoursRangeId, string>;
  title: string;
  subtitle?: string;
  emptyText: string;
  summaryFormatter?: (slot: { label: string; count: number }) => ReactNode;
  seriesName: string;
  brandShort?: string;
  brandFull?: string;
  showBrand?: boolean;
  chartHeightClassName?: string;
};

/** Bemor oqimi (area) bilan uyg‘un yashil */
const BAR_DIM = "#047857";
const BAR_MID = "#10b981";
const BAR_MAX = "#86efac";

export function PeakHoursRechartsBar({
  darkMode,
  data: dataProp,
  ranges,
  defaultRange = "7d",
  rangeTabLabels,
  title,
  subtitle,
  emptyText,
  summaryFormatter,
  seriesName,
  brandShort = "MC",
  brandFull = "MedCore",
  showBrand,
  chartHeightClassName = "h-[280px] w-full md:h-[320px]",
}: PeakHoursRechartsBarProps) {
  const hasRanges = Boolean(ranges && RANGE_ORDER.some((k) => ranges[k] !== undefined));
  const showBrandRow = showBrand ?? !hasRanges;

  const [rangeId, setRangeId] = useState<PeakHoursRangeId>(defaultRange);

  const data = useMemo(() => {
    if (hasRanges && ranges) return ranges[rangeId] ?? [];
    return dataProp ?? [];
  }, [hasRanges, ranges, rangeId, dataProp]);

  const maxCount = useMemo(() => data.reduce((m, d) => Math.max(m, d.count), 0), [data]);
  const yMax = Math.max(4, Math.ceil(maxCount * 1.12) || 4);

  const bestSlot = useMemo(() => {
    if (!data.length) return { label: "—", count: 0 };
    return data.reduce((best, d) => (d.count > best.count ? d : best), data[0]);
  }, [data]);

  /** Boshqa kartalar (masalan Tashxislar) bilan bir xil — barcha rollarda PatientFlow ishlatiladi */
  const shell = darkMode
    ? "rounded-xl border border-[#30363D] bg-[#21262D] p-5 sm:p-6"
    : "rounded-xl border border-gray-100 bg-white p-5 sm:p-6";

  const brandPill = darkMode
    ? "flex items-center gap-2 rounded-full border border-[#30363D] bg-[#21262D] px-3 py-1"
    : "flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-1";

  const pillWrap = darkMode
    ? "flex w-fit flex-wrap items-center gap-0.5 rounded-lg border border-[#30363D] bg-[#21262D] p-1"
    : "flex w-fit flex-wrap items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-100 p-1";

  const pillIdle = darkMode
    ? "rounded-md px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 transition-colors hover:text-white"
    : "rounded-md px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600 transition-colors hover:text-gray-900";

  const pillActive = darkMode
    ? "rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm"
    : "rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm";

  const gridStroke = darkMode ? "#1F1F1F" : "#e2e8f0";
  const tickFill = darkMode ? "#737373" : "#64748b";
  const axisLineStroke = darkMode ? "#30363D" : "#e2e8f0";

  const footerBorder = darkMode ? "border-[#30363D]" : "border-gray-100";

  const labels: Record<PeakHoursRangeId, string> = {
    "24h": rangeTabLabels?.["24h"] ?? "24H",
    "7d": rangeTabLabels?.["7d"] ?? "7D",
    "30d": rangeTabLabels?.["30d"] ?? "30D",
  };

  const showEmptyChart = !data.length;

  if (showEmptyChart) {
    return (
      <div className={`flex flex-col gap-5 ${shell}`}>
        <HeaderRow
          darkMode={darkMode}
          title={title}
          showBrandRow={showBrandRow}
          brandPill={brandPill}
          brandShort={brandShort}
          brandFull={brandFull}
        />
        {subtitle ? <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{subtitle}</p> : null}
        {hasRanges && ranges ? (
          <div className={pillWrap}>
            {RANGE_ORDER.map((id) =>
              ranges[id] === undefined ? null : (
                <button key={id} type="button" onClick={() => setRangeId(id)} className={rangeId === id ? pillActive : pillIdle}>
                  {labels[id]}
                </button>
              ),
            )}
          </div>
        ) : null}
        <div
          className={`flex min-h-[200px] flex-1 items-center justify-center rounded-xl border border-dashed text-sm ${
            darkMode ? "border-[#30363D] text-gray-500" : "border-gray-200 text-gray-500"
          }`}
        >
          {emptyText}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-5 ${shell}`}>
      <HeaderRow
        darkMode={darkMode}
        title={title}
        showBrandRow={showBrandRow}
        brandPill={brandPill}
        brandShort={brandShort}
        brandFull={brandFull}
      />

      {subtitle ? <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>{subtitle}</p> : null}

      {hasRanges && ranges ? (
        <div className={pillWrap}>
          {RANGE_ORDER.map((id) =>
            ranges[id] === undefined ? null : (
              <button key={id} type="button" onClick={() => setRangeId(id)} className={rangeId === id ? pillActive : pillIdle}>
                {labels[id]}
              </button>
            ),
          )}
        </div>
      ) : null}

      <div className={chartHeightClassName}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 6, right: 6, left: 2, bottom: 2 }}
            barCategoryGap={4}
            barGap={0}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis
              dataKey="label"
              tick={{ fill: tickFill, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: axisLineStroke }}
              interval={0}
            />
            <YAxis
              domain={[0, yMax]}
              allowDecimals={false}
              orientation="left"
              tick={{ fill: tickFill, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: darkMode ? "rgba(134,239,172,0.08)" : "rgba(16,185,129,0.12)" }}
              contentStyle={{
                backgroundColor: darkMode ? "#21262D" : "#ffffff",
                border: darkMode ? "1px solid #30363D" : "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                fontSize: "12px",
                color: darkMode ? "#fff" : "#111827",
              }}
              labelStyle={{ color: tickFill }}
              formatter={(value: number | string) => [String(value), seriesName]}
            />
            <Bar dataKey="count" name={seriesName} radius={[4, 4, 0, 0]} maxBarSize={72}>
              {data.map((entry, i) => (
                <Cell
                  key={`${entry.label}-${i}`}
                  fill={
                    entry.count === maxCount && maxCount > 0
                      ? BAR_MAX
                      : maxCount > 0 && entry.count >= maxCount * 0.7
                        ? BAR_MID
                        : BAR_DIM
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={`flex flex-col gap-3 border-t pt-3 ${footerBorder}`} aria-label={seriesName}>
        {summaryFormatter && maxCount > 0 ? (
          <div className={`text-xs leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {summaryFormatter(bestSlot)}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{seriesName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderRow({
  darkMode,
  title,
  showBrandRow,
  brandPill,
  brandShort,
  brandFull,
}: {
  darkMode: boolean;
  title: string;
  showBrandRow: boolean;
  brandPill: string;
  brandShort: string;
  brandFull: string;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3">
      <h2 className={`text-lg font-semibold tracking-tight sm:text-xl ${darkMode ? "text-white" : "text-gray-900"}`}>
        {title}
      </h2>
      {showBrandRow ? (
        <div className={brandPill}>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white ${
              darkMode ? "bg-emerald-600" : "bg-emerald-500"
            }`}
          >
            {brandShort}
          </div>
          <span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{brandFull}</span>
        </div>
      ) : null}
    </div>
  );
}
