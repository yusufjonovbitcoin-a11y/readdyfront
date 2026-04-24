import { emitSessionFailure } from "@/auth/sessionSignals";

export interface ApiError<T = unknown> {
  status: number;
  message: string;
  data: T | null;
}

export interface RequestOptions extends Omit<globalThis.RequestInit, "headers"> {
  headers?: Record<string, string>;
}

export class AuthError extends Error {
  constructor() {
    super("UNAUTHORIZED");
    this.name = "AuthError";
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

const REQUEST_TIMEOUT_MS = 12000;
const MAX_RETRY_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 350;

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);
const IDEMPOTENT_METHODS = new Set(["GET", "HEAD", "OPTIONS", "PUT", "DELETE"]);

let refreshFailureNotified = false;

function buildUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function normalizeError<T = unknown>(
  status: number,
  message: string,
  data: T | null = null,
): ApiError<T> {
  return { status, message, data };
}

function notifySessionFailureOnce() {
  if (refreshFailureNotified) return;

  refreshFailureNotified = true;

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

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const method = (options.method ?? "GET").toUpperCase();
  const canRetry = IDEMPOTENT_METHODS.has(method);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  for (let attempt = 0; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    const onAbort = () => controller.abort();
    options.signal?.addEventListener("abort", onAbort, { once: true });

    try {
      const response = await fetch(buildUrl(path), {
        ...options,
        method,
        signal: controller.signal,
        headers,
        credentials: "include",
      });

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

        const message =
          typeof responseData === "object" &&
          responseData !== null &&
          "message" in responseData &&
          typeof (responseData as { message?: unknown }).message === "string"
            ? (responseData as { message: string }).message
            : response.statusText || "Request failed";

        if (response.status === 401) {
          notifySessionFailureOnce();
          throw new AuthError();
        }

        throw normalizeError(response.status, message, responseData);
      }

      return responseData as TResponse;
    } catch (error) {
      const isLastAttempt = attempt >= MAX_RETRY_ATTEMPTS;

      if (!isLastAttempt && canRetry && !options.signal?.aborted) {
        await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
        continue;
      }

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
      options.signal?.removeEventListener("abort", onAbort);
    }
  }

  throw normalizeError(0, "So'rovni qayta yuborishda noma'lum xatolik yuz berdi.");
}
