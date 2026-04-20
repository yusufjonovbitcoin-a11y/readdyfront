import { mockHospitals } from "@/mocks/hospitals";
import { mockUsers } from "@/mocks/users";
import type { CreateUserInput, UpdateUserInput, UserDto } from "@/api/types/users.types";
import { emitIntegrationError } from "@/api/integrationSignals";
import { normalizeRole } from "@/types/roles";

function normalizeMockUser(user: typeof mockUsers[number]): UserDto {
  const normalizedRole = normalizeRole(user.role);
  if (normalizedRole !== "DOCTOR" && normalizedRole !== "RECEPTION" && normalizedRole !== "HOSPITAL_ADMIN") {
    emitIntegrationError({
      area: "users",
      reason: "unknown_role_from_mock_adapter",
      details: { userId: user.id, role: user.role },
      at: Date.now(),
    });
    throw {
      status: 500,
      message: "Mock user roli noto'g'ri konfiguratsiya qilingan.",
      data: { userId: user.id, role: user.role },
    };
  }
  return {
    ...user,
    role: normalizedRole,
  };
}

let usersState: UserDto[] = mockUsers.map(normalizeMockUser);

export async function getUsers(): Promise<UserDto[]> {
  return [...usersState];
}

export async function getUserById(id: string): Promise<UserDto | null> {
  return usersState.find((user) => user.id === id) ?? null;
}

export async function createUser(input: CreateUserInput): Promise<UserDto> {
  const user: UserDto = {
    id: `u-${Date.now()}`,
    name: input.name,
    phone: input.phone,
    email: input.email,
    role: input.role,
    hospitalId: input.hospitalId,
    hospitalName: mockHospitals.find((item) => item.id === input.hospitalId)?.name ?? "",
    status: "active",
    lastLogin: "-",
    createdAt: new Date().toISOString().slice(0, 10),
    avatar: input.name
      .split(" ")
      .map((chunk) => chunk[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
  usersState = [user, ...usersState];
  return user;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<UserDto | null> {
  const current = usersState.find((user) => user.id === id);
  if (!current) return null;
  const updated: UserDto = {
    ...current,
    ...input,
    hospitalName: input.hospitalId
      ? mockHospitals.find((item) => item.id === input.hospitalId)?.name ?? current.hospitalName
      : current.hospitalName,
  };
  usersState = usersState.map((user) => (user.id === id ? updated : user));
  return updated;
}

export async function deleteUser(id: string): Promise<boolean> {
  const before = usersState.length;
  usersState = usersState.filter((user) => user.id !== id);
  return usersState.length < before;
}
