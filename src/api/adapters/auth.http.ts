import { apiRequest } from "@/api/client";
import type { AuthUserDto, LoginInput, LoginResult } from "@/api/types/auth.types";

type BackendAdminDto = {
  id: string;
  phone_number: string;
  is_super_admin: boolean;
  hospital_id: string | null;
  hospital?: { name?: string } | null;
};

type BackendDoctorDto = {
  id: string;
  phone_number: string;
  specialization: string;
  hospital_id: string;
  hospital?: { name?: string } | null;
};

function buildDoctorUser(doctor: BackendDoctorDto): AuthUserDto {
  return {
    id: doctor.id,
    name: `Doctor ${doctor.id.slice(0, 6)}`,
    email: "",
    role: "DOCTOR",
    hospitalId: doctor.hospital_id,
    hospitalName: doctor.hospital?.name,
    avatar: "",
  };
}

function buildAdminUser(admin: BackendAdminDto): AuthUserDto {
  return {
    id: admin.id,
    name: admin.is_super_admin ? "Super Admin" : "Hospital Admin",
    email: "",
    role: admin.is_super_admin ? "SUPER_ADMIN" : "HOSPITAL_ADMIN",
    hospitalId: admin.hospital_id ?? undefined,
    hospitalName: admin.hospital?.name,
    avatar: "",
  };
}

export async function login(input: LoginInput): Promise<LoginResult> {
  await apiRequest<unknown>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      phone_number: input.phone,
      password: input.password,
    }),
  });

  const [admins, doctors] = await Promise.all([
    apiRequest<BackendAdminDto[]>("/api/admins").catch(() => [] as BackendAdminDto[]),
    apiRequest<BackendDoctorDto[]>("/api/doctors").catch(() => [] as BackendDoctorDto[]),
  ]);

  const admin = admins.find((candidate) => candidate.phone_number === input.phone);
  if (admin) {
    return { user: buildAdminUser(admin) };
  }

  const doctor = doctors.find((candidate) => candidate.phone_number === input.phone);
  if (doctor) {
    return { user: buildDoctorUser(doctor) };
  }

  throw {
    status: 502,
    message: "Login bo'ldi, lekin foydalanuvchi profili topilmadi.",
    data: { phone: input.phone },
  };
}

export async function getCurrentUser(): Promise<AuthUserDto | null> {
  return null;
}

export async function logout(): Promise<void> {
  return;
}
