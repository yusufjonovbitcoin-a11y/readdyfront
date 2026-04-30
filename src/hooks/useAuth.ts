import { createContext, createElement, useState, useEffect, useCallback, useContext, type ReactNode } from "react";
import type { AppRole } from "@/types/roles";
import { onSessionFailure } from "@/auth/sessionSignals";
import { AuthError } from "@/api/client";
import { getCurrentUser as fetchCurrentUser, login as loginWithService, logout as logoutWithService } from "@/api/auth";
import type { LoginInput } from "@/api/types/auth.types";

export type UserRole = Extract<AppRole, "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR">;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hospitalId?: string;
  hospitalName?: string;
  phone?: string;
  avatar: string;
  checkinUrl?: string;
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
  login: (userData: AuthUser) => void;
  logout: () => Promise<void>;
}

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
    email: typeof raw.email === "string" && raw.email.trim() ? raw.email.trim() : `${raw.id.trim()}@local.medcore`,
    role: raw.role,
    avatar: raw.avatar.trim(),
    hospitalId: typeof raw.hospitalId === "string" ? raw.hospitalId.trim() : undefined,
    hospitalName: typeof raw.hospitalName === "string" ? raw.hospitalName.trim() : undefined,
    phone: typeof raw.phone === "string" ? raw.phone.trim() : undefined,
    checkinUrl: typeof raw.checkinUrl === "string" ? raw.checkinUrl.trim() : undefined,
  };

  if (!normalized.id || !normalized.name || !normalized.avatar) {
    return null;
  }

  return normalized;
}

export async function bootstrapAuth(signal?: AbortSignal): Promise<AuthBootstrapResult> {
  if (signal?.aborted) return { status: "anonymous", reason: "aborted" };

  let serverUser: unknown;
  try {
    serverUser = await fetchCurrentUser();
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "anonymous", reason: "server_rejected" };
    }
    return { status: "anonymous", reason: "validation_failed" };
  }

  if (signal?.aborted) return { status: "anonymous", reason: "aborted" };

  const normalized = normalizeAuthCandidate(serverUser);
  if (!normalized) {
    return { status: "anonymous", reason: "server_rejected" };
  }

  return { status: "authenticated", user: normalized, source: "server" };
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

  const logout = useCallback(async () => {
    setUser(null);
    try {
      await logoutWithService();
    } catch {
      // Session might already be invalid/expired; clear local auth state regardless.
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      const bootstrapped = await bootstrapAuth(controller.signal);
      if (controller.signal.aborted) return;
      if (bootstrapped.status === "authenticated") {
        setUser(bootstrapped.user);
      } else {
        setUser(null);
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
        void logout();
      }
    });
  }, [logout]);

  const login = useCallback((userData: AuthUser) => {
    setUser(userData);
  }, []);

  /**
   * Thin auth boundary for pages:
   * UI submits credentials, auth service validates via adapter, and session
   * persistence stays inside AuthProvider.
   */
  const authenticate = useCallback(
    async (credentials: LoginInput): Promise<AuthUser> => {
      const result = await loginWithService(credentials);
      login(result.user);
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
