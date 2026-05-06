import {
  apiRequest,
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
  trySilentSessionRefresh,
} from "@/api/client";
import type {
  AuthUserDto,
  ChangePasswordInput,
  LoginHistoryEntry,
  LoginInput,
  LoginResult,
} from "@/api/types/auth.types";

type BackendLoginResponse = {
  accessToken?: string;
  access_token?: string;
};

type AccessTokenPayload = {
  sub?: string;
  role?: string;
  is_super?: boolean;
};

function parseJwtPayload(token: string): AccessTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = globalThis.atob(padded);
    const parsed = JSON.parse(decoded) as AccessTokenPayload;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function userFromAccessToken(accessToken: string): AuthUserDto | null {
  const payload = parseJwtPayload(accessToken);
  const sub = payload?.sub?.trim();
  if (!sub) return null;
  const isDoctor = payload?.role === "doctor";
  const isSuperAdmin = !isDoctor && Boolean(payload?.is_super);
  const role: AuthUserDto["role"] = isDoctor
    ? "DOCTOR"
    : isSuperAdmin
      ? "SUPER_ADMIN"
      : "HOSPITAL_ADMIN";
  return {
    id: sub,
    userId: sub,
    name: isDoctor ? `Doctor ${sub.slice(0, 6)}` : isSuperAdmin ? "Super Admin" : "Hospital Admin",
    email: "",
    role,
    avatar: sub.slice(-2).toUpperCase() || "MC",
  };
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const loginResponse = await apiRequest<BackendLoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      phone_number: input.phone,
      password: input.password,
    }),
  });
  if (!loginResponse.accessToken && !loginResponse.access_token) {
    throw {
      status: 502,
      message: "Login javobida access token yo'q.",
      data: null,
    };
  }
  const accessToken = loginResponse.accessToken ?? loginResponse.access_token ?? "";
  setStoredAccessToken(accessToken);
  const profile = userFromAccessToken(accessToken);
  if (!profile) {
    throw {
      status: 502,
      message: "Login bo'ldi, lekin tokendan profil olinmadi.",
      data: null,
    };
  }
  return { user: profile };
}

export async function getCurrentUser(): Promise<AuthUserDto | null> {
  const token = getStoredAccessToken()?.trim();
  if (!token) {
    const refreshed = await trySilentSessionRefresh();
    if (!refreshed) return null;
  }
  return userFromAccessToken(getStoredAccessToken()?.trim() ?? "");
}

export async function logout(): Promise<void> {
  try {
    await apiRequest("/api/auth/logout", {
      method: "POST",
    });
  } finally {
    clearStoredAccessToken();
  }
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiRequest("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(input),
    skipRefreshOn401: true,
    suppressSessionFailureOn401: true,
  });
}

export async function getLoginHistory(): Promise<LoginHistoryEntry[]> {
  return apiRequest<LoginHistoryEntry[]>("/api/auth/login-history");
}
