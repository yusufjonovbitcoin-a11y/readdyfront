const MISSING_IP = new Set(["", "unknown", "undefined", "null"]);

/** Normalizes audit IP for UI; returns empty string when not displayable. */
export function formatAuditIpDisplay(ip: string | null | undefined): string {
  const raw = String(ip ?? "").trim();
  if (!raw || MISSING_IP.has(raw.toLowerCase())) return "";
  let normalized = raw;
  if (normalized.startsWith("::ffff:")) normalized = normalized.slice(7);
  if (normalized === "::1") normalized = "127.0.0.1";
  return normalized;
}

export function isAuditIpMissing(ip: string | null | undefined): boolean {
  return formatAuditIpDisplay(ip) === "";
}

export function isAuditIpLocalOnly(ip: string | null | undefined): boolean {
  const v = formatAuditIpDisplay(ip);
  return v === "127.0.0.1" || v.startsWith("192.168.") || v.startsWith("10.") || v.startsWith("172.");
}
