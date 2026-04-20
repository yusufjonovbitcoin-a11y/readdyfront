import type { AuthUserDto, LoginInput, LoginResult } from "@/api/types/auth.types";

const AUTH_KEY = "medcore_auth";

const MOCK_USERS: Record<string, Omit<AuthUserDto, "token">> = {
  "+998901111111": {
    id: "sa-001",
    name: "Akbar Toshmatov",
    email: "superadmin@medcore.uz",
    role: "SUPER_ADMIN",
    avatar: "AT",
  },
  "+998902222222": {
    id: "u1",
    name: "Sardor Yusupov",
    email: "sardor@tashkent-clinic.uz",
    role: "HOSPITAL_ADMIN",
    hospitalId: "1",
    hospitalName: "Toshkent Shahar Klinik Kasalxonasi",
    avatar: "SY",
  },
  "+998901234567": {
    id: "u3",
    name: "Dr. Alisher Nazarov",
    email: "a.nazarov@clinic.uz",
    role: "DOCTOR",
    hospitalId: "1",
    hospitalName: "Toshkent Shahar Klinik Kasalxonasi",
    avatar: "AN",
  },
};

export async function login(input: LoginInput): Promise<LoginResult> {
  const user = MOCK_USERS[input.phone];
  if (!user || !input.password.trim()) {
    throw { status: 401, message: "Invalid credentials", data: null };
  }
  return {
    user: {
      ...user,
      token: `mock-token-${user.id}-${Date.now()}`,
    },
  };
}

export async function getCurrentUser(): Promise<AuthUserDto | null> {
  const raw = sessionStorage.getItem(AUTH_KEY) ?? localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUserDto;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
}
