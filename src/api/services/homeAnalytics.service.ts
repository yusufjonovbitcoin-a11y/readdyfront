import { homeAdapter } from "@/api";
import { apiRequest } from "@/api/client";
import type {
  AnalyticsPeriodPointDto,
  CityStatPointDto,
  DailyBookingPointDto,
  DoctorPerformancePointDto,
  TopHospitalPointDto,
  WeeklyBookingPointDto,
} from "@/api/types/analytics.types";
import type { Hospital } from "@/types/hospital";
import {
  analyticsDashboardSchema,
  hospitalSchema,
  parseContractOrThrow,
} from "@/api/contracts/analytics.contract";

export function getHomeDailyData(): Promise<AnalyticsPeriodPointDto[]> {
  return homeAdapter.getDailyData();
}

export function getHomeWeeklyData(): Promise<AnalyticsPeriodPointDto[]> {
  return homeAdapter.getWeeklyData();
}

export function getHomeMonthlyData(): Promise<AnalyticsPeriodPointDto[]> {
  return homeAdapter.getMonthlyData();
}

export function getHomeTopHospitals(): Promise<TopHospitalPointDto[]> {
  return homeAdapter.getTopHospitals();
}

export function getHomeHospitals(): Promise<Hospital[]> {
  return homeAdapter.getHospitals();
}

export type HomeDashboardBundle = {
  daily: AnalyticsPeriodPointDto[];
  weekly: AnalyticsPeriodPointDto[];
  monthly: AnalyticsPeriodPointDto[];
  doctorPerformance: DoctorPerformancePointDto[];
  topHospitals: TopHospitalPointDto[];
  hospitals: Hospital[];
  dailyBookings: DailyBookingPointDto[];
  weeklyBookings: WeeklyBookingPointDto[];
  cityStats: CityStatPointDto[];
};

export async function getHomeDashboardBundle(): Promise<HomeDashboardBundle> {
  const [dashboardResult, hospitalsResult] = await Promise.allSettled([
    apiRequest<unknown>("/api/analytics/dashboard"),
    apiRequest<unknown>("/api/hospitals"),
  ]);

  if (dashboardResult.status === "rejected") {
    throw dashboardResult.reason;
  }

  const dashboard = parseContractOrThrow(
    dashboardResult.value,
    "/api/analytics/dashboard",
    analyticsDashboardSchema,
  );

  let hospitals: Hospital[] = [];
  if (hospitalsResult.status === "fulfilled") {
    try {
      hospitals = parseContractOrThrow(hospitalsResult.value, "/api/hospitals", hospitalSchema.array());
    } catch (error) {
      console.warn("Ignoring hospitals contract mismatch in dashboard bundle", error);
    }
  }

  return {
    daily: dashboard.daily,
    weekly: dashboard.weekly,
    monthly: dashboard.monthly,
    doctorPerformance: dashboard.doctorPerformance,
    topHospitals: dashboard.topHospitals,
    hospitals,
    dailyBookings: dashboard.dailyBookings,
    weeklyBookings: dashboard.weeklyBookings,
    cityStats: dashboard.cityStats,
  };
}
