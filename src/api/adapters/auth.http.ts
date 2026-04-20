import { apiRequest } from "@/api/client";
import type { AuthUserDto, LoginInput, LoginResult } from "@/api/types/auth.types";

export async function login(input: LoginInput): Promise<LoginResult> {
  return apiRequest<LoginResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCurrentUser(): Promise<AuthUserDto | null> {
  return apiRequest<AuthUserDto | null>("/api/auth/me");
}

export async function logout(): Promise<void> {
  await apiRequest<null>("/api/auth/logout", { method: "POST" });
}
