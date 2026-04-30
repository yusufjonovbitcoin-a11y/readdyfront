import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { getHospitals } from "@/api/hospitals";
import type { DoctorDto } from "@/api/types/doctor.types";
import type { Hospital } from "@/types";
import { getHADoctors } from "@/api/services/hospitalAdminData.service";
import { getHaAnalyticsBundle, type HaAnalyticsBundle } from "@/api/services/haAnalytics.service";
import { getHomeDashboardBundle, type HomeDashboardBundle } from "@/api/services/homeAnalytics.service";
import { getNotifications, type Notification } from "@/api/services/notifications.service";

export const CORE_QUERY_STALE_MS = 5 * 60 * 1000;
const CORE_QUERY_GC_MS = 15 * 60 * 1000;

export const queryKeys = {
  hospitals: ["core", "hospitals"] as const,
  doctors: ["core", "doctors"] as const,
  haAnalyticsBundle: ["core", "analytics-dashboard", "ha-bundle"] as const,
  homeDashboardBundle: ["core", "analytics-dashboard", "home-bundle"] as const,
  notifications: ["notifications", "unread"] as const,
};
export const coreQueryKeys = queryKeys;

export function hospitalsQueryOptions() {
  return queryOptions<Hospital[]>({
    queryKey: coreQueryKeys.hospitals,
    queryFn: getHospitals,
    staleTime: CORE_QUERY_STALE_MS,
    gcTime: CORE_QUERY_GC_MS,
  });
}

export function doctorsQueryOptions() {
  return queryOptions<DoctorDto[]>({
    queryKey: coreQueryKeys.doctors,
    queryFn: getHADoctors,
    staleTime: CORE_QUERY_STALE_MS,
    gcTime: CORE_QUERY_GC_MS,
  });
}

export function haAnalyticsBundleQueryOptions() {
  return queryOptions<HaAnalyticsBundle>({
    queryKey: coreQueryKeys.haAnalyticsBundle,
    queryFn: getHaAnalyticsBundle,
    staleTime: CORE_QUERY_STALE_MS,
    gcTime: CORE_QUERY_GC_MS,
  });
}

export function homeDashboardBundleQueryOptions() {
  return queryOptions<HomeDashboardBundle>({
    queryKey: coreQueryKeys.homeDashboardBundle,
    queryFn: getHomeDashboardBundle,
    retry: 1,
    staleTime: CORE_QUERY_STALE_MS,
    gcTime: CORE_QUERY_GC_MS,
  });
}

export function notificationsQueryOptions() {
  return queryOptions<Notification[]>({
    queryKey: coreQueryKeys.notifications,
    queryFn: getNotifications,
    staleTime: CORE_QUERY_STALE_MS,
    gcTime: CORE_QUERY_GC_MS,
  });
}

export function prefetchCoreQueriesForPath(queryClient: QueryClient, path: string) {
  if (path === "/dashboard" || path === "/home" || path.startsWith("/analytics")) {
    void queryClient.prefetchQuery(homeDashboardBundleQueryOptions());
  }

  if (path.startsWith("/hospitals") || path.startsWith("/users")) {
    void queryClient.prefetchQuery(hospitalsQueryOptions());
  }

  if (
    path === "/hospital-admin" ||
    path.startsWith("/hospital-admin/doctors") ||
    path.startsWith("/hospital-admin/analytics")
  ) {
    void queryClient.prefetchQuery(doctorsQueryOptions());
    void queryClient.prefetchQuery(haAnalyticsBundleQueryOptions());
  }
}

export function prefetchSidebarWarmup(queryClient: QueryClient, path: string) {
  // Dashboardda bo'lgan paytda keyingi ehtimoliy o'tishlarni fon rejimida isitib qo'yamiz.
  if (path === "/dashboard" || path === "/home") {
    void queryClient.prefetchQuery(notificationsQueryOptions());
  }
}
