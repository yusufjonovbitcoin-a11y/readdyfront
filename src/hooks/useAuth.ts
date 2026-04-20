import { createContext, createElement, useState, useEffect, useCallback, useContext, type ReactNode } from "react";
import { parseJsonSafe } from "@/utils/storage";
import type { AppRole } from "@/types/roles";
import { onSessionFailure } from "@/auth/sessionSignals";
import { getCurrentUser as fetchCurrentUser, login as loginWithService } from "@/api/auth";
import type { LoginInput } from "@/api/types/auth.types";

/**
 * TODO(security-hardening):
 * 1) Implement refresh-token flow with silent renewal before access token expiry.
 * 2) Add server-side revocation/session introspection check during bootstrap.
 * 3) Migrate token persistence away from JS-readable storage to httpOnly secure cookies to reduce XSS impact.
 */
export type UserRole = Extract<AppRole, "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR">;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hospitalId?: string;
  hospitalName?: string;
  avatar: string;
  token?: string;
  expiresAt?: string;
}

/**
 * Bootstrap phase model.
 * - "pending": resolution is in progress; route guards should render a loader and NEVER
 *   treat the user as authenticated while pending.
 * - "authenticated": validated via the auth service boundary (future `/auth/me`).
 * - "anonymous": no trusted identity; storage (if any) has been cleared.
 */
export type BootstrapPhase = "pending" | "authenticated" | "anonymous";

type AuthAnonymousReason =
  | "aborted"
  | "missing_cache"
  | "invalid_cache"
  | "expired"
  | "validation_failed"
  | "server_rejected"
  | "tampered";

export type AuthBootstrapResult =
  | { status: "authenticated"; user: AuthUser; source: "server" }
  | { status: "anonymous"; reason: AuthAnonymousReason };

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  bootstrapPhase: BootstrapPhase;
  authenticate: (credentials: LoginInput) => Promise<AuthUser>;
  login: (userData: AuthUser, rememberMe?: boolean) => void;
  logout: () => void;
}

const AUTH_KEY = "medcore_auth";
const AUTH_STORAGE_KEYS = [AUTH_KEY, "token", "user", "role"] as const;
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK === "true";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isUserRole(value: unknown): value is UserRole {
  return value === "SUPER_ADMIN" || value === "HOSPITAL_ADMIN" || value === "DOCTOR";
}

function normalizeAuthCandidate(value: unknown): AuthUser | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<AuthUser>;
  if (
    typeof raw.id !== "string" ||
    typeof raw.name !== "string" ||
    typeof raw.email !== "string" ||
    !isUserRole(raw.role) ||
    typeof raw.avatar !== "string"
  ) {
    return null;
  }

  const normalized: AuthUser = {
    id: raw.id.trim(),
    name: raw.name.trim(),
    email: raw.email.trim(),
    role: raw.role,
    avatar: raw.avatar.trim(),
    token: typeof raw.token === "string" ? raw.token.trim() : undefined,
    hospitalId: typeof raw.hospitalId === "string" ? raw.hospitalId.trim() : undefined,
    hospitalName: typeof raw.hospitalName === "string" ? raw.hospitalName.trim() : undefined,
    expiresAt: typeof raw.expiresAt === "string" ? raw.expiresAt : undefined,
  };

  if (!normalized.id || !normalized.name || !normalized.email || !normalized.avatar) {
    return null;
  }

  return normalized;
}

function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

type StorageHint =
  | { kind: "empty" }
  | { kind: "invalid" }
  | { kind: "hint"; user: AuthUser };

/**
 * Reads a cached auth candidate from storage.
 *
 * The result is intentionally framed as a *hint*, not as truth:
 * - "empty"   -> no prior session hint found.
 * - "invalid" -> data present but unparseable, malformed, or inconsistent across
 *                session/local storage. Caller MUST clear storage and fail-closed.
 * - "hint"    -> a structurally valid candidate. Still requires server validation
 *                before being promoted to authenticated state.
 */
function readAuthFromStorage(): StorageHint {
  const sessionRaw = sessionStorage.getItem(AUTH_KEY);
  const localRaw = localStorage.getItem(AUTH_KEY);

  if (!sessionRaw && !localRaw) return { kind: "empty" };

  const sessionUser = sessionRaw
    ? normalizeAuthCandidate(parseJsonSafe<unknown>(sessionRaw, null))
    : null;
  const localUser = localRaw
    ? normalizeAuthCandidate(parseJsonSafe<unknown>(localRaw, null))
    : null;

  if (sessionRaw && !sessionUser) return { kind: "invalid" };
  if (localRaw && !localUser) return { kind: "invalid" };

  if (
    sessionUser &&
    localUser &&
    (sessionUser.id !== localUser.id ||
      sessionUser.role !== localUser.role ||
      (sessionUser.token ?? "") !== (localUser.token ?? ""))
  ) {
    return { kind: "invalid" };
  }

  const resolved = sessionUser ?? localUser;
  if (!resolved) return { kind: "invalid" };

  return { kind: "hint", user: resolved };
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(padded);
    return parseJsonSafe<Record<string, unknown> | null>(decoded, null);
  } catch {
    return null;
  }
}

function isTokenExpired(user: AuthUser): boolean {
  if (user.expiresAt) {
    const expiresAtMs = Date.parse(user.expiresAt);
    if (!Number.isNaN(expiresAtMs)) {
      return Date.now() >= expiresAtMs;
    }
  }

  if (!user.token) return false;
  const payload = decodeJwtPayload(user.token);
  const exp = payload?.exp;
  if (typeof exp === "number") {
    return Date.now() >= exp * 1000;
  }

  return false;
}

/**
 * Validates the cached hint via the auth service boundary.
 *
 * Policy is fail-closed:
 * - Any network/adapter failure                  -> anonymous ("validation_failed")
 * - Adapter returns no/invalid payload           -> anonymous ("server_rejected")
 * - Validated identity disagrees with the hint   -> anonymous ("tampered")
 * - Token expired on either side                 -> anonymous ("expired")
 *
 * Behavior per mode:
 * - HTTP mode: `authAdapter.getCurrentUser()` hits `/api/auth/me`; server/session
 *   cookies are the source of truth and storage is ignored.
 * - Mock mode: the adapter mirrors storage, so this call acts as a structural/tamper
 *   re-check. This is the explicit "temporarily acceptable in mock mode" path until
 *   the backend `/auth/me` endpoint is connected.
 */
async function validateBootstrapUser(
  cachedUser: AuthUser,
  signal?: AbortSignal,
): Promise<AuthBootstrapResult> {
  if (signal?.aborted) return { status: "anonymous", reason: "aborted" };
  if (isTokenExpired(cachedUser)) return { status: "anonymous", reason: "expired" };

  let serverUser: unknown;
  try {
    serverUser = await fetchCurrentUser();
  } catch {
    return { status: "anonymous", reason: "validation_failed" };
  }

  if (signal?.aborted) return { status: "anonymous", reason: "aborted" };

  const normalized = normalizeAuthCandidate(serverUser);
  if (!normalized) {
    return { status: "anonymous", reason: "server_rejected" };
  }

  if (normalized.id !== cachedUser.id || normalized.role !== cachedUser.role) {
    return { status: "anonymous", reason: "tampered" };
  }

  if (isTokenExpired(normalized)) {
    return { status: "anonymous", reason: "expired" };
  }

  return { status: "authenticated", user: normalized, source: "server" };
}

export async function bootstrapAuth(signal?: AbortSignal): Promise<AuthBootstrapResult> {
  if (signal?.aborted) return { status: "anonymous", reason: "aborted" };

  if (!USE_MOCK_AUTH) {
    let serverUser: unknown;
    try {
      serverUser = await fetchCurrentUser();
    } catch {
      return { status: "anonymous", reason: "validation_failed" };
    }
    if (signal?.aborted) return { status: "anonymous", reason: "aborted" };
    const normalized = normalizeAuthCandidate(serverUser);
    if (!normalized) {
      clearAuthStorage();
      return { status: "anonymous", reason: "server_rejected" };
    }
    if (isTokenExpired(normalized)) {
      clearAuthStorage();
      return { status: "anonymous", reason: "expired" };
    }
    return { status: "authenticated", user: normalized, source: "server" };
  }

  const cached = readAuthFromStorage();
  if (cached.kind === "empty") {
    return { status: "anonymous", reason: "missing_cache" };
  }
  if (cached.kind === "invalid") {
    clearAuthStorage();
    return { status: "anonymous", reason: "invalid_cache" };
  }

  const result = await validateBootstrapUser(cached.user, signal);
  if (result.status !== "authenticated") {
    clearAuthStorage();
    return result;
  }

  if (signal?.aborted) return { status: "anonymous", reason: "aborted" };
  return result;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const role: UserRole | null = user?.role ?? null;
  const isAuthenticated = Boolean(user);
  const bootstrapPhase: BootstrapPhase = isBootstrapping
    ? "pending"
    : user
      ? "authenticated"
      : "anonymous";

  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      const bootstrapped = await bootstrapAuth(controller.signal);
      if (controller.signal.aborted) return;
      if (bootstrapped.status === "authenticated") {
        setUser(bootstrapped.user);
      } else {
        logout();
      }
      setIsBootstrapping(false);
    })();

    return () => {
      controller.abort();
    };
  }, [logout]);

  useEffect(() => {
    return onSessionFailure((signal) => {
      if (signal.reason === "unauthorized") {
        logout();
      }
    });
  }, [logout]);

  const login = useCallback((userData: AuthUser, rememberMe = true) => {
    if (!USE_MOCK_AUTH) {
      clearAuthStorage();
      setUser(userData);
      return;
    }
    const targetStorage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    otherStorage.removeItem(AUTH_KEY);
    targetStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  /**
   * Thin auth boundary for pages:
   * UI submits credentials, auth service validates via adapter, and session
   * persistence stays inside AuthProvider.
   */
  const authenticate = useCallback(
    async (credentials: LoginInput): Promise<AuthUser> => {
      const rememberMe = Boolean(credentials.rememberMe);
      const result = await loginWithService(credentials);
      login(result.user, rememberMe);
      return result.user;
    },
    [login],
  );

  return createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        role,
        isAuthenticated,
        authenticate,
        login,
        logout,
        isBootstrapping,
        bootstrapPhase,
      },
    },
    children,
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

/**
 * Returns the cached user *hint* only for transport needs such as attaching a
 * bearer token to outgoing requests. This function is intentionally tolerant
 * because the real authoritative check happens during `bootstrapAuth` (and,
 * eventually, per protected request on the server side). Callers MUST NOT use
 * this as an authorization decision.
 */
export function getStoredUser(): AuthUser | null {
  if (!USE_MOCK_AUTH) return null;
  const parsed = readAuthFromStorage();
  if (parsed.kind !== "hint") return null;
  if (isTokenExpired(parsed.user)) return null;
  return parsed.user;
}
