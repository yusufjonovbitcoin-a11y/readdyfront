import { getStoredUser } from "@/hooks/useAuth";
import { emitSessionFailure } from "@/auth/sessionSignals";

export interface ApiError<T = unknown> {
  status: number;
  message: string;
  data: T | null;
}

export interface RequestOptions extends Omit<globalThis.RequestInit, "headers"> {
  headers?: Record<string, string>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const REQUEST_TIMEOUT_MS = 12000;
const MAX_RETRY_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 350;
const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);
const IDEMPOTENT_METHODS = new Set(["GET", "HEAD", "OPTIONS", "PUT", "DELETE"]);

function normalizeError<T = unknown>(status: number, message: string, data: T | null = null): ApiError<T> {
  return { status, message, data };
}

/**
 * Base HTTP client for API requests.
 * Injects bearer auth header and normalizes errors.
 * Auth-side effects are emitted as session signals and handled in React auth/router layer.
 */
export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const authUser = getStoredUser();
  const method = (options.method ?? "GET").toUpperCase();
  const canRetry = IDEMPOTENT_METHODS.has(method);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authUser?.token) {
    headers.Authorization = `Bearer ${authUser.token}`;
  }

  for (let attempt = 0; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const onAbort = () => controller.abort();
    options.signal?.addEventListener("abort", onAbort, { once: true });

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        signal: controller.signal,
        headers,
        credentials: "include",
      });
    } catch (error) {
      const isAbortError =
        error instanceof DOMException ||
        (typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as { name?: unknown }).name === "AbortError");
      const isLastAttempt = attempt >= MAX_RETRY_ATTEMPTS;
      if (!isLastAttempt && canRetry && !options.signal?.aborted) {
        const retryDelay = RETRY_BASE_DELAY_MS * (attempt + 1);
        await new Promise((resolve) => globalThis.setTimeout(resolve, retryDelay));
        continue;
      }
      if (isAbortError) {
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
      options.signal?.removeEventListener("abort", onAbort);
    }

    let responseData: unknown = null;
    const text = await response.text();
    if (text) {
      try {
        responseData = JSON.parse(text) as unknown;
      } catch {
        responseData = text;
      }
    }

    if (!response.ok) {
      const shouldRetryStatus =
        canRetry && RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_RETRY_ATTEMPTS;
      if (shouldRetryStatus) {
        const retryDelay = RETRY_BASE_DELAY_MS * (attempt + 1);
        await new Promise((resolve) => globalThis.setTimeout(resolve, retryDelay));
        continue;
      }

      const message =
        typeof responseData === "object" &&
        responseData !== null &&
        "message" in responseData &&
        typeof (responseData as { message?: unknown }).message === "string"
          ? ((responseData as { message: string }).message)
          : response.statusText || "Request failed";

      const error = normalizeError(response.status, message, responseData);

      if (response.status === 401) {
        emitSessionFailure({ reason: "unauthorized", status: 401, at: Date.now() });
      }

      throw error;
    }

    return responseData as TResponse;
  }

  throw normalizeError(0, "So'rovni qayta yuborishda noma'lum xatolik yuz berdi.");
}
