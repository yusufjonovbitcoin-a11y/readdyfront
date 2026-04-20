import { apiRequest } from "@/api/client";
import type { AnalyticsDashboardDto } from "@/api/types/analytics.types";

export async function getAnalyticsDashboard(): Promise<AnalyticsDashboardDto> {
  return apiRequest<AnalyticsDashboardDto>("/api/analytics/dashboard");
}
