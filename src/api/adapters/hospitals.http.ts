import { apiRequest } from "@/api/client";
import type { CreateHospitalInput, Hospital, UpdateHospitalInput } from "@/types";

type BackendHospitalDto = {
  id: string;
  name: string;
  address: string;
  phone: string;
  created_at?: string;
  createdAt?: string;
  is_active?: boolean;
  isActive?: boolean;
  adminName?: string;
  adminPhone?: string;
  viloyat?: string;
  doctorsCount?: number;
  dailyPatients?: number;
};

function pickCreatedAt(dto: BackendHospitalDto): string {
  return dto.createdAt ?? dto.created_at ?? new Date().toISOString();
}

function pickActive(dto: BackendHospitalDto): boolean {
  if (typeof dto.isActive === "boolean") return dto.isActive;
  if (typeof dto.is_active === "boolean") return dto.is_active;
  return true;
}

function normalizeHospital(dto: BackendHospitalDto): Hospital {
  const active = pickActive(dto);
  return {
    id: dto.id,
    name: dto.name,
    viloyat: typeof dto.viloyat === "string" ? dto.viloyat : "",
    address: dto.address,
    phone: dto.phone,
    doctorsCount: typeof dto.doctorsCount === "number" && !Number.isNaN(dto.doctorsCount) ? dto.doctorsCount : 0,
    dailyPatients: typeof dto.dailyPatients === "number" && !Number.isNaN(dto.dailyPatients) ? dto.dailyPatients : 0,
    status: active ? "active" : "inactive",
    adminName: typeof dto.adminName === "string" ? dto.adminName : "",
    adminPhone: typeof dto.adminPhone === "string" ? dto.adminPhone : "",
    createdAt: pickCreatedAt(dto),
  };
}

function toCreatePayload(data: CreateHospitalInput) {
  return {
    name: data.name,
    address: data.address,
    phone: data.phone,
  };
}

function toUpdatePayload(data: UpdateHospitalInput) {
  return {
    name: data.name,
    address: data.address,
    phone: data.phone,
  };
}

/**
 * Fetches hospitals from HTTP API.
 */
export async function getHospitals(): Promise<Hospital[]> {
  const hospitals = await apiRequest<BackendHospitalDto[]>("/api/hospitals");
  return hospitals.map(normalizeHospital);
}

/**
 * Fetches one hospital by id from HTTP API.
 */
export async function getHospitalById(id: string): Promise<Hospital | null> {
  const hospital = await apiRequest<BackendHospitalDto | null>(`/api/hospitals/${encodeURIComponent(id)}`);
  return hospital ? normalizeHospital(hospital) : null;
}

/**
 * Creates a hospital via HTTP API.
 */
export async function createHospital(data: CreateHospitalInput): Promise<Hospital> {
  const created = await apiRequest<BackendHospitalDto>("/api/hospitals", {
    method: "POST",
    body: JSON.stringify(toCreatePayload(data)),
  });
  return normalizeHospital(created);
}

/**
 * Updates a hospital via HTTP API.
 */
export async function updateHospital(id: string, data: UpdateHospitalInput): Promise<Hospital | null> {
  const updated = await apiRequest<BackendHospitalDto | null>(`/api/hospitals/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(toUpdatePayload(data)),
  });
  return updated ? normalizeHospital(updated) : null;
}

/**
 * Deletes a hospital via HTTP API.
 */
export async function deleteHospital(id: string): Promise<boolean> {
  await apiRequest<null>(`/api/hospitals/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return true;
}
