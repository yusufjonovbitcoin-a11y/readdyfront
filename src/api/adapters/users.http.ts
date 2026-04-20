import { apiRequest } from "@/api/client";
import type { CreateUserInput, UpdateUserInput, UserDto } from "@/api/types/users.types";
import { emitIntegrationError } from "@/api/integrationSignals";
import { normalizeRole, toLegacyUserRole } from "@/types/roles";

type HttpUserDto = Omit<UserDto, "role"> & { role: string };

function normalizeHttpUser(user: HttpUserDto): UserDto {
  const normalizedRole = normalizeRole(user.role);
  if (normalizedRole !== "HOSPITAL_ADMIN" && normalizedRole !== "DOCTOR" && normalizedRole !== "RECEPTION") {
    emitIntegrationError({
      area: "users",
      reason: "unknown_role_from_http_adapter",
      details: { userId: user.id, role: user.role },
      at: Date.now(),
    });
    throw {
      status: 502,
      message: "User role backend contractiga mos emas.",
      data: { userId: user.id, role: user.role },
    };
  }
  return {
    ...user,
    role: normalizedRole,
  };
}

function toLegacyInputRole(role: CreateUserInput["role"] | UpdateUserInput["role"] | undefined) {
  if (!role) return undefined;
  return toLegacyUserRole(role);
}

export async function getUsers(): Promise<UserDto[]> {
  const users = await apiRequest<HttpUserDto[]>("/api/users");
  return users.map(normalizeHttpUser);
}

export async function getUserById(id: string): Promise<UserDto | null> {
  const user = await apiRequest<HttpUserDto | null>(`/api/users/${encodeURIComponent(id)}`);
  return user ? normalizeHttpUser(user) : null;
}

export async function createUser(input: CreateUserInput): Promise<UserDto> {
  const created = await apiRequest<HttpUserDto>("/api/users", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      role: toLegacyInputRole(input.role),
    }),
  });
  return normalizeHttpUser(created);
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<UserDto | null> {
  const updated = await apiRequest<HttpUserDto | null>(`/api/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...input,
      role: toLegacyInputRole(input.role),
    }),
  });
  return updated ? normalizeHttpUser(updated) : null;
}

export async function deleteUser(id: string): Promise<boolean> {
  await apiRequest<null>(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE" });
  return true;
}
