/** Mahalliy sana bo'yicha YYYY-MM-DD */
export function formatLocalYMD(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** UI uchun qisqa matn (masalan: 19-aprel, 2026) */
export function formatLocalDateLabel(d: Date = new Date()): string {
  return d.toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });
}
