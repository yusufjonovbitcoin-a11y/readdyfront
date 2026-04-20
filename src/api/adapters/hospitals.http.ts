import { apiRequest } from "@/api/client";
import type { CreateHospitalInput, Hospital, UpdateHospitalInput } from "@/types";

/**
 * Fetches hospitals from HTTP API.
 */
export async function getHospitals(): Promise<Hospital[]> {
  return apiRequest<Hospital[]>("/api/hospitals");
}

/**
 * Fetches one hospital by id from HTTP API.
 */
export async function getHospitalById(id: string): Promise<Hospital | null> {
  return apiRequest<Hospital | null>(`/api/hospitals/${encodeURIComponent(id)}`);
}

/**
 * Creates a hospital via HTTP API.
 */
export async function createHospital(data: CreateHospitalInput): Promise<Hospital> {
  return apiRequest<Hospital>("/api/hospitals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Updates a hospital via HTTP API.
 */
export async function updateHospital(id: string, data: UpdateHospitalInput): Promise<Hospital | null> {
  return apiRequest<Hospital | null>(`/api/hospitals/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
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
