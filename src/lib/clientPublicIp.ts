const HINT_STORAGE_KEY = "medcore_client_ip_hint";

export function getClientPublicIpHint(): string | null {
  try {
    const v = globalThis.sessionStorage.getItem(HINT_STORAGE_KEY);
    return v?.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}

export function setClientPublicIpHint(ip: string) {
  try {
    globalThis.sessionStorage.setItem(HINT_STORAGE_KEY, ip.trim().slice(0, 100));
  } catch {
    // ignore
  }
}

/**
 * Browsers do not expose the user's public IP to JavaScript (unlike User-Agent).
 * Optional lookup for audit when nginx does not send X-Forwarded-For.
 */
export async function prefetchClientPublicIpHint(): Promise<string | null> {
  const existing = getClientPublicIpHint();
  if (existing) return existing;

  try {
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(() => controller.abort(), 3500);
    const response = await fetch("https://api.ipify.org?format=json", {
      signal: controller.signal,
      cache: "no-store",
    });
    globalThis.clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = (await response.json()) as { ip?: string };
    if (typeof data.ip === "string" && data.ip.trim()) {
      setClientPublicIpHint(data.ip.trim());
      return data.ip.trim();
    }
  } catch {
    // offline or blocked — server headers only
  }
  return null;
}
