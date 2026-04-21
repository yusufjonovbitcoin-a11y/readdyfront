import { apiRequest } from "@/api/client";
import type { AnalyticsPeriodPointDto, TopHospitalPointDto } from "@/api/types/analytics.types";
import type { Hospital } from "@/types/hospital";
import {
  analyticsDashboardSchema,
  auditLogSchema,
  hospitalSchema,
  parseContractOrThrow,
} from "@/api/contracts/analytics.contract";

export type HomeAuditLog = {
  id: string;
  user: string;
  role: "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR";
  action: string;
  target: string;
  timestamp: string;
};

type HomeAuditRaw = {
  id: string;
  userName: string;
  role: "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR";
  action: string;
  detail: string;
  timestamp: string;
};

async function getAnalyticsDashboard() {
  const endpoint = "/api/analytics/dashboard";
  const raw = await apiRequest<unknown>(endpoint);
  return parseContractOrThrow(raw, endpoint, analyticsDashboardSchema);
}

function mapAuditLog(log: HomeAuditRaw): HomeAuditLog {
  return {
    id: log.id,
    user: log.userName,
    role: log.role,
    action: log.action,
    target: log.detail,
    timestamp: log.timestamp,
  };
}

export const homeAdapter = {
  getDailyData: async (): Promise<AnalyticsPeriodPointDto[]> => {
    const dashboard = await getAnalyticsDashboard();
    return dashboard.daily;
  },
  getWeeklyData: async (): Promise<AnalyticsPeriodPointDto[]> => {
    const dashboard = await getAnalyticsDashboard();
    return dashboard.weekly;
  },
  getMonthlyData: async (): Promise<AnalyticsPeriodPointDto[]> => {
    const dashboard = await getAnalyticsDashboard();
    return dashboard.monthly;
  },
  getTopHospitals: async (): Promise<TopHospitalPointDto[]> => {
    const dashboard = await getAnalyticsDashboard();
    return dashboard.topHospitals;
  },
  getAuditLogs: async (): Promise<HomeAuditLog[]> => {
    const endpoint = "/api/audit-logs";
    const raw = await apiRequest<unknown>(endpoint);
    const logs = parseContractOrThrow(raw, endpoint, auditLogSchema.array());
    return logs.map(mapAuditLog);
  },
  getHospitals: async (): Promise<Hospital[]> => {
    const endpoint = "/api/hospitals";
    const raw = await apiRequest<unknown>(endpoint);
    return parseContractOrThrow(raw, endpoint, hospitalSchema.array());
  },
};
