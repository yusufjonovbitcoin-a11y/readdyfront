import { homeAdapter } from "@/api";
import { apiRequest } from "@/api/client";
import type {
  AnalyticsPeriodPointDto,
  DoctorPerformancePointDto,
  TopHospitalPointDto,
} from "@/api/types/analytics.types";
import type { Hospital } from "@/types/hospital";
import type { HomeAuditLog } from "@/api/adapters/home.adapter";
import {
  analyticsDashboardSchema,
  auditLogSchema,
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

export function getHomeAuditLogs(): Promise<HomeAuditLog[]> {
  return homeAdapter.getAuditLogs();
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
  logs: HomeAuditLog[];
};

export async function getHomeDashboardBundle(): Promise<HomeDashboardBundle> {
  const [dashboardRaw, hospitalsRaw, auditLogsRaw] = await Promise.all([
    apiRequest<unknown>("/api/analytics/dashboard"),
    apiRequest<unknown>("/api/hospitals"),
    apiRequest<unknown>("/api/audit-logs"),
  ]);
  const dashboard = parseContractOrThrow(dashboardRaw, "/api/analytics/dashboard", analyticsDashboardSchema);
  const hospitals = parseContractOrThrow(hospitalsRaw, "/api/hospitals", hospitalSchema.array());
  const auditLogs = parseContractOrThrow(auditLogsRaw, "/api/audit-logs", auditLogSchema.array());
  return {
    daily: dashboard.daily,
    weekly: dashboard.weekly,
    monthly: dashboard.monthly,
    doctorPerformance: dashboard.doctorPerformance,
    topHospitals: dashboard.topHospitals,
    hospitals,
    logs: auditLogs.map((log) => ({
      id: log.id,
      user: log.userName,
      role: log.role,
      action: log.action,
      target: log.detail,
      timestamp: log.timestamp,
    })),
  };
}
