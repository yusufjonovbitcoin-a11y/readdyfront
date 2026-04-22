import { apiRequest } from "@/api/client";
import type { CreateHospitalInput, Hospital, UpdateHospitalInput } from "@/types";

type BackendHospitalDto = {
  id: string;
  name: string;
  address: string;
  phone: string;
  created_at?: string;
};

function normalizeHospital(dto: BackendHospitalDto): Hospital {
  return {
    id: dto.id,
    name: dto.name,
    viloyat: "",
    address: dto.address,
    phone: dto.phone,
    doctorsCount: 0,
    dailyPatients: 0,
    status: "active",
    adminName: "",
    adminPhone: "",
    createdAt: dto.created_at ?? new Date().toISOString(),
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
