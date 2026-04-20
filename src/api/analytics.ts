import { analyticsAdapter } from "@/api";
import type { AnalyticsDashboardDto } from "@/api/types/analytics.types";

export function getAnalyticsDashboard(): Promise<AnalyticsDashboardDto> {
  return analyticsAdapter.getAnalyticsDashboard();
}
