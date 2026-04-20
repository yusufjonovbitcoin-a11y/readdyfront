import { mockHospitals } from "@/mocks/hospitals";
import type { CreateHospitalInput, Hospital, UpdateHospitalInput } from "@/types";

let hospitalsState: Hospital[] = [...mockHospitals];

/**
 * Returns the full mock hospitals list.
 */
export async function getHospitals(): Promise<Hospital[]> {
  return [...hospitalsState];
}

/**
 * Finds a mock hospital by its id.
 */
export async function getHospitalById(id: string): Promise<Hospital | null> {
  return hospitalsState.find((hospital) => hospital.id === id) ?? null;
}

/**
 * Creates a new mock hospital and returns it.
 */
export async function createHospital(data: CreateHospitalInput): Promise<Hospital> {
  const hospital: Hospital = {
    id: String(Date.now()),
    name: data.name,
    viloyat: data.viloyat,
    address: data.address,
    phone: data.phone,
    doctorsCount: 0,
    dailyPatients: 0,
    status: data.status ?? "active",
    adminName: data.adminName,
    adminPhone: data.adminPhone,
    createdAt: new Date().toISOString().split("T")[0] ?? "",
  };

  hospitalsState = [hospital, ...hospitalsState];
  return hospital;
}

/**
 * Updates a mock hospital by id and returns updated record.
 */
export async function updateHospital(id: string, data: UpdateHospitalInput): Promise<Hospital | null> {
  const target = hospitalsState.find((hospital) => hospital.id === id);
  if (!target) return null;

  const updated: Hospital = { ...target, ...data };
  hospitalsState = hospitalsState.map((hospital) => (hospital.id === id ? updated : hospital));
  return updated;
}

/**
 * Deletes a mock hospital by id.
 */
export async function deleteHospital(id: string): Promise<boolean> {
  const before = hospitalsState.length;
  hospitalsState = hospitalsState.filter((hospital) => hospital.id !== id);
  return hospitalsState.length < before;
}
