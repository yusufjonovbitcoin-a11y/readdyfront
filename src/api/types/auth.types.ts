export type ApiUserRole = "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR";

export interface AuthUserDto {
  id: string;
  /** `Users.id` — profilni PATCH /api/users/:id orqali yangilash uchun */
  userId?: string;
  name: string;
  email: string;
  role: ApiUserRole;
  hospitalId?: string;
  hospitalName?: string;
  phone?: string;
  avatar: string;
  checkinUrl?: string;
}

export interface LoginInput {
  phone: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  user: AuthUserDto;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** `GET /api/auth/login-history` — auditdagi muvaffaqiyatli LOGINlar. */
export interface LoginHistoryEntry {
  id: string;
  ip: string;
  userAgent: string;
  deviceLabel: string;
  signedInAt: string;
  isCurrent: boolean;
}
