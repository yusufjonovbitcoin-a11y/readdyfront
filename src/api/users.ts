import { userAdapter } from "@/api";
import type { CreateUserInput, UpdateUserInput, UserDto } from "@/api/types/users.types";

export function patchUserAccount(
  userId: string,
  body: { full_name?: string; phone_number?: string; password?: string },
): Promise<void> {
  return userAdapter.patchUserAccount(userId, body);
}

export function getUsers(): Promise<UserDto[]> {
  return userAdapter.getUsers();
}

export function getUserById(id: string): Promise<UserDto | null> {
  return userAdapter.getUserById(id);
}

export function createUser(input: CreateUserInput): Promise<UserDto> {
  return userAdapter.createUser(input);
}

export function updateUser(id: string, input: UpdateUserInput): Promise<UserDto | null> {
  return userAdapter.updateUser(id, input);
}

export function deleteUser(id: string): Promise<boolean> {
  return userAdapter.deleteUser(id);
}
