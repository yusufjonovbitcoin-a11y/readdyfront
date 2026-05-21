/** Qisqa, o‘qilishi oson qurilma yorlig‘i (to‘liq User-Agent emas). */
export function formatAuditDeviceLabel(userAgent: string | null | undefined): string {
  const raw = String(userAgent ?? "").trim();
  if (!raw) return "Noma'lum qurilma";

  const browser = detectBrowser(raw);
  const os = detectOs(raw);

  if (browser && os) return `${browser} · ${os}`;
  if (browser) return browser;
  if (os) return os;

  if (raw.length > 56) return `${raw.slice(0, 53)}…`;
  return raw;
}

function detectBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return "Opera";
  if (/crios/i.test(ua)) return "Chrome";
  if (/fxios/i.test(ua)) return "Firefox";
  if (/chrome|chromium/i.test(ua) && !/edg\//i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua) && !/chrome|chromium|crios/i.test(ua)) return "Safari";
  if (/msie|trident/i.test(ua)) return "Internet Explorer";
  if (/mobile/i.test(ua)) return "Mobil brauzer";
  return "";
}

function detectOs(ua: string): string {
  if (/iphone/i.test(ua)) return "iPhone";
  if (/ipad/i.test(ua)) return "iPad";
  if (/ipod/i.test(ua)) return "iPod";
  if (/android/i.test(ua)) {
    const ver = ua.match(/android\s+([\d.]+)/i)?.[1];
    return ver ? `Android ${ver.split(".")[0]}` : "Android";
  }
  if (/windows nt 10|windows nt 11/i.test(ua)) return "Windows";
  if (/windows/i.test(ua)) return "Windows";
  if (/mac os x|macintosh/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  if (/cros/i.test(ua)) return "ChromeOS";
  return "";
}
