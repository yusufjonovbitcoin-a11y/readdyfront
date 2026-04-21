import { docPatientsAdapter } from "@/api/adapters/docPatients.adapter";
import type { DoctorPatientDto } from "@/api/types/doctor.types";

export type DocPatient = DoctorPatientDto;

export function getInitialDocPatients(): DocPatient[] {
  return docPatientsAdapter.getInitialPatients();
}
