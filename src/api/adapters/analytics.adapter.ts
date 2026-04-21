import { getDoctors } from "@/api/doctor";
import { apiRequest } from "@/api/client";
import {
  analyticsDashboardSchema,
  parseContractOrThrow,
  peakHourSchema,
} from "@/api/contracts/analytics.contract";

type DailyPoint = { day: string; patients: number; appointments: number; completed: number };
type WeeklyPoint = { week: string; patients: number; appointments: number; completed: number };
type MonthlyPoint = { month: string; patients: number; appointments: number; completed: number };
type PeakHourPoint = { hour: string; count: number };
type DoctorPerformancePoint = { name: string; patients: number; rating: number; specialty: string };

export const analyticsAdapter = {
  getDailyData: async (): Promise<DailyPoint[]> => {
    const endpoint = "/api/analytics/dashboard";
    const raw = await apiRequest<unknown>(endpoint);
    const dashboard = parseContractOrThrow(raw, endpoint, analyticsDashboardSchema);
    return dashboard.daily.map((item) => ({ day: item.date, patients: item.patients, appointments: item.appointments, completed: item.completed }));
  },
  getWeeklyData: async (): Promise<WeeklyPoint[]> => {
    const endpoint = "/api/analytics/dashboard";
    const raw = await apiRequest<unknown>(endpoint);
    const dashboard = parseContractOrThrow(raw, endpoint, analyticsDashboardSchema);
    return dashboard.weekly.map((item) => ({ week: item.date, patients: item.patients, appointments: item.appointments, completed: item.completed }));
  },
  getMonthlyData: async (): Promise<MonthlyPoint[]> => {
    const endpoint = "/api/analytics/dashboard";
    const raw = await apiRequest<unknown>(endpoint);
    const dashboard = parseContractOrThrow(raw, endpoint, analyticsDashboardSchema);
    return dashboard.monthly.map((item) => ({ month: item.date, patients: item.patients, appointments: item.appointments, completed: item.completed }));
  },
  getPeakHoursData: async (): Promise<PeakHourPoint[]> => {
    const endpoint = "/api/hospital-admin/analytics/peak-hours";
    const raw = await apiRequest<unknown>(endpoint);
    return parseContractOrThrow(raw, endpoint, peakHourSchema.array());
  },
  getDoctorPerformance: async (): Promise<DoctorPerformancePoint[]> => {
    const endpoint = "/api/analytics/dashboard";
    const raw = await apiRequest<unknown>(endpoint);
    const dashboard = parseContractOrThrow(raw, endpoint, analyticsDashboardSchema);
    return dashboard.doctorPerformance;
  },
  getDoctors,
};
