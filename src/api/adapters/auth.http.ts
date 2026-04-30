import { apiRequest } from "@/api/client";
import { clearStoredAccessToken, setStoredAccessToken } from "@/api/client";
import type {
  AuthUserDto,
  ChangePasswordInput,
  LoginInput,
  LoginResult,
} from "@/api/types/auth.types";

type BackendLoginResponse = {
  accessToken?: string;
  access_token?: string;
};

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
  setStoredAccessToken(loginResponse.accessToken ?? loginResponse.access_token ?? "");
  const profile = await getCurrentUser();
  if (!profile) {
    throw {
      status: 502,
      message: "Login bo'ldi, lekin profil topilmadi.",
      data: null,
    };
  }
  return { user: profile };
}

export async function getCurrentUser(): Promise<AuthUserDto | null> {
  try {
    return await apiRequest<AuthUserDto>("/api/auth/me", { skipRefreshOn401: true });
  } catch {
    return null;
  }
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
