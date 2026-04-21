import { doctorSessionAdapter } from "@/api/adapters/doctorSession.adapter";

export function getCurrentDoctorSession() {
  return doctorSessionAdapter.getCurrentSession();
}
