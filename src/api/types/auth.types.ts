export type ApiUserRole = "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR";

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: ApiUserRole;
  hospitalId?: string;
  hospitalName?: string;
  avatar: string;
  token?: string;
  expiresAt?: string;
}

export interface LoginInput {
  phone: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  user: AuthUserDto;
}
