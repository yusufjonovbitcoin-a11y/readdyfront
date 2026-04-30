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
  const [dashboardResult, hospitalsResult, auditLogsResult] = await Promise.allSettled([
    apiRequest<unknown>("/api/analytics/dashboard"),
    apiRequest<unknown>("/api/hospitals"),
    apiRequest<unknown>("/api/audit-logs"),
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

  let auditLogs: Array<{
    id: string;
    userId: string;
    userName: string;
    role: "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR";
    action: string;
    resource: string;
    detail: string;
    ip: string;
    userAgent: string;
    timestamp: string;
    status: "success" | "failed" | "warning";
    resourceId?: string;
    hospitalId?: string;
    hospitalName?: string;
  }> = [];
  if (auditLogsResult.status === "fulfilled") {
    try {
      auditLogs = parseContractOrThrow(auditLogsResult.value, "/api/audit-logs", auditLogSchema.array());
    } catch (error) {
      console.warn("Ignoring audit logs contract mismatch in dashboard bundle", error);
    }
  }

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
