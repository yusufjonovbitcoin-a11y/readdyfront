import { dashboardAdapter } from "@/api/adapters/dashboard.adapter";

export function getDashboardHospitalCount(): number {
  return dashboardAdapter.getHospitalCount();
}
