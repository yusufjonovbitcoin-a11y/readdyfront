import {
  mockDailyData,
  mockDoctorPerformance,
  mockMonthlyData,
  mockTopHospitals,
  mockWeeklyData,
} from "@/mocks/analytics";
import type { AnalyticsDashboardDto } from "@/api/types/analytics.types";

export async function getAnalyticsDashboard(): Promise<AnalyticsDashboardDto> {
  return {
    daily: [...mockDailyData],
    weekly: [...mockWeeklyData],
    monthly: [...mockMonthlyData],
    doctorPerformance: [...mockDoctorPerformance],
    topHospitals: [...mockTopHospitals],
  };
}
