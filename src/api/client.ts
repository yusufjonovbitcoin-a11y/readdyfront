import { emitSessionFailure } from "@/auth/sessionSignals";

export interface ApiError<T = unknown> {
  status: number;
  message: string;
  data: T | null;
}

export interface RequestOptions extends Omit<globalThis.RequestInit, "headers"> {
  headers?: Record<string, string>;
  skipRefreshOn401?: boolean;
  suppressSessionFailureOn401?: boolean;
  timeoutMs?: number;
}

export class AuthError extends Error {
  constructor() {
    super("UNAUTHORIZED");
    this.name = "AuthError";
  }
}

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/$/, "");
const API_BASE_URL = configuredApiBaseUrl || "";
const API_FALLBACK_BASE_URL = "http://localhost:4000";
const ACCESS_TOKEN_STORAGE_KEY = "medcore_access_token";

const REQUEST_TIMEOUT_MS = 5000;
const MAX_RETRY_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 350;

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);
/** Dev: Vite proxy returns 502 if Nest is not listening on the proxy target — try API origin directly. */
const PROXY_FALLBACK_STATUS_CODES = new Set([404, 502, 503, 504]);
const IDEMPOTENT_METHODS = new Set(["GET", "HEAD", "OPTIONS", "PUT", "DELETE"]);
const AUTH_ENDPOINTS = new Set(["/api/auth/login", "/api/auth/refresh", "/api/auth/logout"]);
let authRecoverySuppressed = false;
let sessionFailureNotified = false;

export function getStoredAccessToken(): string | null {
  try {
    return globalThis.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAccessToken(token: string) {
  try {
    globalThis.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage failures.
  }
}

export function clearStoredAccessToken() {
  try {
    globalThis.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function resetApiClientAuthStateForTests() {
  authRecoverySuppressed = false;
  sessionFailureNotified = false;
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function buildUrlWithBase(path: string, baseUrl: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedBase = baseUrl.replace(/\/$/, "");
  return `${normalizedBase}${normalizedPath}`;
}

function normalizeError<T = unknown>(
  status: number,
  message: string,
  data: T | null = null,
): ApiError<T> {
  return { status, message, data };
}

function resolveErrorMessage(responseData: unknown, fallback: string): string {
  if (
    typeof responseData === "object" &&
    responseData !== null &&
    "message" in responseData
  ) {
    const rawMessage = (responseData as { message?: unknown }).message;
    if (typeof rawMessage === "string" && rawMessage.trim()) {
      return rawMessage;
    }
    if (Array.isArray(rawMessage)) {
      const firstText = rawMessage.find((entry) => typeof entry === "string" && entry.trim());
      if (typeof firstText === "string") {
        return firstText;
      }
    }
  }
  return fallback;
}

function notifySessionFailure() {
  if (sessionFailureNotified) return;
  sessionFailureNotified = true;
  emitSessionFailure({
    reason: "unauthorized",
    status: 401,
    at: Date.now(),
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

function isAbortError(error: unknown) {
  return (
    error instanceof DOMException ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name?: unknown }).name === "AbortError")
  );
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Storage-da access token bo‘lmasa, httpOnly refresh cookie orqali bitta `/refresh` urinishi.
 * Muvaffaqiyatli bo‘lsa token yoziladi. Hech qachon throw qilmaydi.
 */
export async function trySilentSessionRefresh(): Promise<boolean> {
  if (getStoredAccessToken()?.trim()) return true;

  const runFetch = (url: string) =>
    fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

  let response = await runFetch(buildUrl("/api/auth/refresh"));
  if (
    !response.ok &&
    PROXY_FALLBACK_STATUS_CODES.has(response.status) &&
    !configuredApiBaseUrl
  ) {
    response = await runFetch(buildUrlWithBase("/api/auth/refresh", API_FALLBACK_BASE_URL));
  }

  if (!response.ok) return false;

  const data = await parseResponse(response);
  const token =
    typeof data === "object" &&
    data !== null &&
    ("accessToken" in data || "access_token" in data)
      ? (data as { accessToken?: string; access_token?: string }).accessToken ??
        (data as { access_token?: string }).access_token
      : undefined;

  if (typeof token === "string" && token.trim()) {
    setStoredAccessToken(token.trim());
    return true;
  }
  return false;
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const {
    skipRefreshOn401 = false,
    suppressSessionFailureOn401 = false,
    timeoutMs,
    ...fetchOptions
  } = options;
  const requestInternal = async (allowRefreshRetry: boolean): Promise<TResponse> => {
  const method = (fetchOptions.method ?? "GET").toUpperCase();
  const canRetry = IDEMPOTENT_METHODS.has(method);
  const accessToken = getStoredAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };
  if (accessToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

    for (let attempt = 0; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
      const controller = new AbortController();
      const effectiveTimeoutMs = timeoutMs ?? REQUEST_TIMEOUT_MS;
      const timeoutId = globalThis.setTimeout(
        () => controller.abort(),
        effectiveTimeoutMs,
      );

      const onAbort = () => controller.abort();
      fetchOptions.signal?.addEventListener("abort", onAbort, { once: true });

      try {
        const requestUrl = buildUrl(path);
        let response = await fetch(requestUrl, {
          ...fetchOptions,
          method,
          signal: controller.signal,
          headers,
          credentials: "include",
        });

        if (
          !response.ok &&
          PROXY_FALLBACK_STATUS_CODES.has(response.status) &&
          !configuredApiBaseUrl &&
          path.startsWith("/api")
        ) {
          response = await fetch(buildUrlWithBase(path, API_FALLBACK_BASE_URL), {
            ...fetchOptions,
            method,
            signal: controller.signal,
            headers,
            credentials: "include",
          });
        }

        const responseData = await parseResponse(response);

        if (!response.ok) {
          const shouldRetryStatus =
            canRetry &&
            RETRYABLE_STATUS_CODES.has(response.status) &&
            attempt < MAX_RETRY_ATTEMPTS;

          if (shouldRetryStatus) {
            await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
            continue;
          }

          const message = resolveErrorMessage(responseData, response.statusText || "Request failed");

          if (response.status === 401) {
            const isAuthSessionProbe = path === "/api/auth/me" || path === "/api/auth/refresh";
            if (suppressSessionFailureOn401) {
              if (path === "/api/auth/me") {
                clearStoredAccessToken();
              }
              throw normalizeError(401, message, responseData);
            }
            const canTryRefresh =
              allowRefreshRetry &&
              !skipRefreshOn401 &&
              !authRecoverySuppressed &&
              !AUTH_ENDPOINTS.has(path) &&
              path !== "/api/auth/refresh";

            if (canTryRefresh) {
              const refreshResponse = await fetch(buildUrl("/api/auth/refresh"), {
                method: "POST",
                credentials: "include",
                signal: controller.signal,
                headers,
              });
              if (refreshResponse.ok) {
                const refreshPayload = (await parseResponse(refreshResponse)) as
                  | { accessToken?: string; access_token?: string }
                  | null;
                const refreshedAccessToken =
                  refreshPayload?.accessToken ?? refreshPayload?.access_token;
                if (refreshedAccessToken) {
                  setStoredAccessToken(refreshedAccessToken);
                }
                authRecoverySuppressed = false;
                sessionFailureNotified = false;
                return requestInternal(false);
              }
            }
            if (!isAuthSessionProbe) {
              throw normalizeError(401, message, responseData);
            }
            authRecoverySuppressed = true;
            clearStoredAccessToken();
            notifySessionFailure();
            throw new AuthError();
          }

          throw normalizeError(response.status, message, responseData);
        }

        if (path === "/api/auth/logout") {
          clearStoredAccessToken();
        }

        return responseData as TResponse;
      } catch (error) {
        if (error instanceof AuthError) {
          throw error;
        }


        if (
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          "message" in error
        ) {
          throw error;
        }

        if (isAbortError(error)) {
          throw normalizeError(
            0,
            "So'rov vaqti tugadi (timeout). Internet ulanishini tekshirib qayta urinib ko'ring.",
          );
        }

        throw normalizeError(
          0,
          "Tarmoq ulanishida xatolik yuz berdi. Backend bilan aloqa o'rnatilmadi.",
        );
      } finally {
        globalThis.clearTimeout(timeoutId);
        fetchOptions.signal?.removeEventListener("abort", onAbort);
      }
    }

    throw normalizeError(0, "So'rovni qayta yuborishda noma'lum xatolik yuz berdi.");
  };

  if (path === "/api/auth/login" || path === "/api/auth/refresh") {
    authRecoverySuppressed = false;
    sessionFailureNotified = false;
  }

  return requestInternal(true);
}
