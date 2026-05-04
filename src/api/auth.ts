import { authAdapter } from "@/api";
import type {
  AuthUserDto,
  ChangePasswordInput,
  LoginHistoryEntry,
  LoginInput,
  LoginResult,
} from "@/api/types/auth.types";

export function login(input: LoginInput): Promise<LoginResult> {
  return authAdapter.login(input);
}

export function getCurrentUser(): Promise<AuthUserDto | null> {
  return authAdapter.getCurrentUser();
}

export function logout(): Promise<void> {
  return authAdapter.logout();
}

export function changePassword(input: ChangePasswordInput): Promise<void> {
  return authAdapter.changePassword(input);
}

export function getLoginHistory(): Promise<LoginHistoryEntry[]> {
  return authAdapter.getLoginHistory();
}
