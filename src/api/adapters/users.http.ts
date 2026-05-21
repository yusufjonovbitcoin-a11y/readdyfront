import { apiRequest } from "@/api/client";
import type { CreateUserInput, UpdateUserInput, UserDto } from "@/api/types/users.types";
import { emitIntegrationError } from "@/api/integrationSignals";

type BackendHospitalDto = {
  id: string;
  name: string;
};

type BackendAdminDto = {
  id: string;
  user_id: string;
  full_name?: string | null;
  phone_number?: string | null;
  is_super: boolean;
  hospital_id: string | null;
  created_at?: string;
  hospital?: BackendHospitalDto | null;
  users?: { phone_number?: string | null } | null;
};

type BackendDoctorDto = {
  id: string;
  phone_number?: string | null;
  specialization: string;
  hospital_id: string;
  created_at?: string;
  hospital?: BackendHospitalDto | null;
  users?: { phone_number?: string | null } | null;
};

type BackendDepartmentDto = {
  id: string;
  hospital_id: string;
  name: string;
};

async function getAdminsList(): Promise<BackendAdminDto[]> {
  return apiRequest<BackendAdminDto[]>("/api/admins");
}

async function getAdminById(id: string): Promise<BackendAdminDto | null> {
  const encodedId = encodeURIComponent(id);
  return apiRequest<BackendAdminDto | null>(`/api/admins/${encodedId}`);
}

async function createAdminViaUsers(
  input: CreateUserInput,
  options: { isSuper: boolean },
): Promise<BackendAdminDto> {
  const fullName = input.name?.trim();
  const isSuper = options.isSuper;
  return apiRequest<BackendAdminDto>("/api/users", {
    method: "POST",
    body: JSON.stringify({
      phone_number: input.phone.replace(/\s+/g, ""),
      password: input.password,
      role: "admin",
      is_super: isSuper,
      hospital_id: isSuper ? null : input.hospitalId || null,
      ...(fullName ? { full_name: fullName } : {}),
    }),
  });
}

async function patchAdmin(id: string, payload: Record<string, unknown>): Promise<void> {
  const encodedId = encodeURIComponent(id);
  await apiRequest<unknown>(`/api/admins/${encodedId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

async function removeAdmin(id: string): Promise<void> {
  const encodedId = encodeURIComponent(id);
  await apiRequest<null>(`/api/admins/${encodedId}`, { method: "DELETE" });
}

function toIsoOrNow(value?: string) {
  return value ?? new Date().toISOString();
}

function coercePhone(value: unknown): string {
  if (value == null) return "";
  const s = String(value).trim();
  return s;
}

function normalizeAdmin(admin: BackendAdminDto): UserDto {
  const displayName = admin.full_name?.trim();
  return {
    id: admin.id,
    name: displayName || (admin.is_super ? "Super Admin" : "Hospital Admin"),
    phone: coercePhone(admin.phone_number ?? admin.users?.phone_number),
    email: "",
    role: "HOSPITAL_ADMIN",
    hospitalId: admin.hospital_id ?? "",
    hospitalName: admin.hospital?.name ?? "",
    status: "active",
    lastLogin: toIsoOrNow(admin.created_at),
    createdAt: toIsoOrNow(admin.created_at),
    avatar: "",
    isSuperAdmin: admin.is_super,
  };
}

function normalizeDoctor(doctor: BackendDoctorDto): UserDto {
  return {
    id: doctor.id,
    name: doctor.specialization || `Doctor ${doctor.id.slice(0, 6)}`,
    phone: coercePhone(doctor.phone_number ?? doctor.users?.phone_number),
    email: "",
    role: "DOCTOR",
    hospitalId: doctor.hospital_id,
    hospitalName: doctor.hospital?.name ?? "",
    status: "active",
    lastLogin: toIsoOrNow(doctor.created_at),
    createdAt: toIsoOrNow(doctor.created_at),
    avatar: "",
    isSuperAdmin: false,
  };
}

export async function getUsers(): Promise<UserDto[]> {
  const [admins, doctors] = await Promise.all([
    getAdminsList().catch(() => [] as BackendAdminDto[]),
    apiRequest<BackendDoctorDto[]>("/api/doctors").catch(() => [] as BackendDoctorDto[]),
  ]);
  return [...admins.map(normalizeAdmin), ...doctors.map(normalizeDoctor)];
}

export async function getUserById(id: string): Promise<UserDto | null> {
  const [admin, doctor] = await Promise.all([
    getAdminById(id).catch(() => null),
    apiRequest<BackendDoctorDto | null>(`/api/doctors/${encodeURIComponent(id)}`).catch(() => null),
  ]);
  if (admin) return normalizeAdmin(admin);
  if (doctor) return normalizeDoctor(doctor);
  return null;
}

export async function createUser(input: CreateUserInput): Promise<UserDto> {
  if (input.role === "HOSPITAL_ADMIN" || input.role === "SUPER_ADMIN") {
    const created = await createAdminViaUsers(input, {
      isSuper: input.role === "SUPER_ADMIN",
    });
    return normalizeAdmin(created);
  }

  if (input.role === "DOCTOR") {
    const departments = await apiRequest<BackendDepartmentDto[]>("/api/departments");
    const department = departments.find((entry) => entry.hospital_id === input.hospitalId) ?? departments[0];
    if (!department) {
      throw {
        status: 400,
        message: "Doctor yaratish uchun avval department kerak.",
        data: { hospitalId: input.hospitalId },
      };
    }
    const created = await apiRequest<BackendDoctorDto>("/api/doctors", {
      method: "POST",
      body: JSON.stringify({
        hospital_id: input.hospitalId,
        department_id: department.id,
        phone_number: input.phone,
        password: input.password,
        specialization: input.name || "General",
      }),
    });
    return normalizeDoctor(created);
  }

  emitIntegrationError({
    area: "users",
    reason: "unsupported_user_role",
    details: { role: input.role },
    at: Date.now(),
  });
  throw {
    status: 400,
    message: "RECEPTION roli backend endpointida qo'llab-quvvatlanmagan.",
    data: { role: input.role },
  };
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<UserDto | null> {
  const existing = await getUserById(id);
  if (!existing) return null;

  if (existing.role === "HOSPITAL_ADMIN") {
    const adminRow = await getAdminById(id);
    const accountUserId = adminRow?.user_id;
    if (accountUserId && (input.full_name !== undefined || input.phone || input.password)) {
      const body: { full_name?: string; phone_number?: string; password?: string } = {};
      if (input.full_name !== undefined) {
        const t = input.full_name?.trim();
        if (t) body.full_name = t;
        else body.full_name = "";
      }
      if (input.phone) body.phone_number = input.phone.replace(/\s+/g, "");
      if (input.password) body.password = input.password;
      await patchUserAccount(accountUserId, body);
    }
    if (input.hospitalId) {
      await patchAdmin(id, { hospital_id: input.hospitalId });
    }
    return getUserById(id);
  }

  if (existing.role === "DOCTOR") {
    const payload: Record<string, unknown> = {};
    if (input.phone) payload.phone_number = input.phone;
    if (input.password) payload.password = input.password;
    if (input.hospitalId) payload.hospital_id = input.hospitalId;
    if (input.name) payload.specialization = input.name;
    await apiRequest<unknown>(`/api/doctors/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return getUserById(id);
  }

  return existing;
}

/** `Users.id` bo‘yicha profil (masalan `Admins.full_name`) */
export async function patchUserAccount(
  userId: string,
  body: { full_name?: string; phone_number?: string; password?: string },
): Promise<void> {
  await apiRequest<unknown>(`/api/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteUser(id: string): Promise<boolean> {
  const existing = await getUserById(id);
  if (!existing) return false;
  if (existing.role === "HOSPITAL_ADMIN") {
    await removeAdmin(id);
    return true;
  }
  if (existing.role === "DOCTOR") {
    await apiRequest<null>(`/api/doctors/${encodeURIComponent(id)}`, { method: "DELETE" });
    return true;
  }
  return true;
}
