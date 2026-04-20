export interface LocalDayRange {
  startMs: number;
  endMs: number;
}

function isValidDateInput(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseDateInputParts(value: string): { year: number; month: number; day: number } | null {
  if (!isValidDateInput(value)) return null;
  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  return { year, month, day };
}

export function getLocalDayRange(dateInput: string): LocalDayRange | null {
  const parsed = parseDateInputParts(dateInput);
  if (!parsed) return null;

  const { year, month, day } = parsed;
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (
    start.getFullYear() !== year ||
    start.getMonth() !== month - 1 ||
    start.getDate() !== day
  ) {
    return null;
  }

  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  return { startMs: start.getTime(), endMs: end.getTime() };
}

export function getTimestampMs(timestamp: string): number | null {
  const ms = new Date(timestamp).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export function resolveDateFilterRange(
  dateFrom: string,
  dateTo: string,
): { fromMs: number | null; toMs: number | null } {
  const fromRange = dateFrom ? getLocalDayRange(dateFrom) : null;
  const toRange = dateTo ? getLocalDayRange(dateTo) : null;

  let fromMs = fromRange?.startMs ?? null;
  let toMs = toRange?.endMs ?? null;

  // Keep filtering usable even if the user chooses dates in reverse order.
  if (fromMs != null && toMs != null && fromMs > toMs) {
    const nextFrom = new Date(toMs);
    nextFrom.setHours(0, 0, 0, 0);
    const nextTo = new Date(fromMs);
    nextTo.setHours(23, 59, 59, 999);
    fromMs = nextFrom.getTime();
    toMs = nextTo.getTime();
  }

  return { fromMs, toMs };
}

export function formatLocalDateForFileName(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
