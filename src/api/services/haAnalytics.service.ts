import { analyticsAdapter } from "@/api/adapters/analytics.adapter";
import { apiRequest } from "@/api/client";
import type { DoctorDto } from "@/api/types/doctor.types";
import { analyticsDashboardSchema, parseContractOrThrow } from "@/api/contracts/analytics.contract";

export function getHaAnalyticsDailyData() {
  return analyticsAdapter.getDailyData();
}

export function getHaAnalyticsWeeklyData() {
  return analyticsAdapter.getWeeklyData();
}

export function getHaAnalyticsMonthlyData() {
  return analyticsAdapter.getMonthlyData();
}

export function getHaPeakHoursData() {
  return analyticsAdapter.getPeakHoursData();
}

export function getHaDoctorPerformance() {
  return analyticsAdapter.getDoctorPerformance();
}

export type HaDoctorPerformanceItem = Awaited<ReturnType<typeof getHaDoctorPerformance>>[number] & {
  doctorId: string | null;
};

export async function getHaDoctorPerformanceWithIds(doctors: DoctorDto[]): Promise<HaDoctorPerformanceItem[]> {
  const performance = await analyticsAdapter.getDoctorPerformance();
  return performance.map((item) => ({
    ...item,
    doctorId: doctors.find((doctor) => doctor.name === item.name)?.id ?? null,
  }));
}

export async function getHaDoctors(): Promise<DoctorDto[]> {
  return analyticsAdapter.getDoctors();
}

export type HaAnalyticsBundle = {
  daily: Awaited<ReturnType<typeof getHaAnalyticsDailyData>>;
  weekly: Awaited<ReturnType<typeof getHaAnalyticsWeeklyData>>;
  monthly: Awaited<ReturnType<typeof getHaAnalyticsMonthlyData>>;
  peakHours: Awaited<ReturnType<typeof getHaPeakHoursData>>;
  doctorPerformance: Awaited<ReturnType<typeof getHaDoctorPerformance>>;
  doctors: DoctorDto[];
};

export async function getHaAnalyticsBundle(): Promise<HaAnalyticsBundle> {
  const [dashboardRaw, peakHours, doctors] = await Promise.all([
    apiRequest<unknown>("/api/analytics/dashboard"),
    getHaPeakHoursData(),
    getHaDoctors(),
  ]);
  const dashboard = parseContractOrThrow(dashboardRaw, "/api/analytics/dashboard", analyticsDashboardSchema);
  return {
    daily: dashboard.daily.map((item) => ({
      day: item.date,
      patients: item.patients,
      appointments: item.appointments,
      completed: item.completed,
    })),
    weekly: dashboard.weekly.map((item) => ({
      week: item.date,
      patients: item.patients,
      appointments: item.appointments,
      completed: item.completed,
    })),
    monthly: dashboard.monthly.map((item) => ({
      month: item.date,
      patients: item.patients,
      appointments: item.appointments,
      completed: item.completed,
    })),
    peakHours,
    doctorPerformance: dashboard.doctorPerformance,
    doctors,
  };
}
