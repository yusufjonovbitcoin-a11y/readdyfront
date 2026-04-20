import { hospitalAdapter } from "@/api";
import type { CreateHospitalInput, Hospital, UpdateHospitalInput } from "@/types";

/**
 * Returns all hospitals from selected adapter (mock or HTTP).
 */
export function getHospitals(): Promise<Hospital[]> {
  return hospitalAdapter.getHospitals();
}

/**
 * Returns a single hospital by id from selected adapter.
 */
export function getHospitalById(id: string): Promise<Hospital | null> {
  return hospitalAdapter.getHospitalById(id);
}

/**
 * Creates a hospital using selected adapter.
 */
export function createHospital(data: CreateHospitalInput): Promise<Hospital> {
  return hospitalAdapter.createHospital(data);
}

/**
 * Updates a hospital by id using selected adapter.
 */
export function updateHospital(id: string, data: UpdateHospitalInput): Promise<Hospital | null> {
  return hospitalAdapter.updateHospital(id, data);
}

/**
 * Deletes a hospital by id using selected adapter.
 */
export function deleteHospital(id: string): Promise<boolean> {
  return hospitalAdapter.deleteHospital(id);
}
