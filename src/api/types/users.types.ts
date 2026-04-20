import type { AppRole } from "@/types/roles";

export type UserRole = Extract<AppRole, "HOSPITAL_ADMIN" | "DOCTOR" | "RECEPTION">;
export type UserStatus = "active" | "inactive";

export interface UserDto {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  hospitalId: string;
  hospitalName: string;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
  avatar: string;
}

export interface CreateUserInput {
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  hospitalId: string;
  password: string;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  status?: UserStatus;
}
