/** Qisqa nisbiy vaqt (sozlamalar kirish tarixi). */
export function formatRelativeTime(iso: string, lang: "uz" | "ru"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const sec = Math.round((Date.now() - d.getTime()) / 1000);
  if (sec < 45) return lang === "ru" ? "только что" : "hozirgina";
  const min = Math.floor(sec / 60);
  if (min < 60) return lang === "ru" ? `${min} мин назад` : `${min} daqiqa oldin`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return lang === "ru" ? `${hr} ч назад` : `${hr} soat oldin`;
  const days = Math.floor(hr / 24);
  if (days < 7) return lang === "ru" ? `${days} дн назад` : `${days} kun oldin`;
  return d.toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
