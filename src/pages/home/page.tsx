import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { useQuery } from "@tanstack/react-query";
import { homeDashboardBundleQueryOptions } from "@/lib/coreQueryCache";
import StatCard from "./components/StatCard";
import ActivityChart from "./components/ActivityChart";
import TopHospitals from "./components/TopHospitals";
import { DashboardBookingCharts } from "./components/DashboardBookingCharts";

export function DashboardContent() {
  const { t } = useTranslation("admin");
  const dark = useMainLayoutDarkMode();
  const dashboardState = useQuery(homeDashboardBundleQueryOptions());

  const stats = useMemo(() => {
    const bundle = dashboardState.data ?? null;
    const hospitalsCount = bundle?.hospitals.length ?? 0;
    const activeDoctorsCount = bundle?.doctorPerformance.length ?? 0;
    const todayPatients = (bundle?.daily ?? []).reduce((sum, point) => sum + point.patients, 0);
    const monthlyVisits = (bundle?.monthly ?? []).reduce((sum, point) => sum + point.appointments, 0);

    return [
      {
        title: t("home.stats.totalHospitals"),
        value: String(hospitalsCount),
        change: t("home.statsChanges.hospitals"),
        changeType: "up" as const,
        icon: "ri-hospital-line",
        iconBg: "bg-emerald-500",
      },
      {
        title: t("home.stats.activeDoctors"),
        value: String(activeDoctorsCount),
        change: t("home.statsChanges.doctors"),
        changeType: "up" as const,
        icon: "ri-stethoscope-line",
        iconBg: "bg-blue-500",
      },
      {
        title: t("home.stats.todayPatients"),
        value: String(todayPatients),
        change: t("home.statsChanges.patients"),
        changeType: "up" as const,
        icon: "ri-user-heart-line",
        iconBg: "bg-violet-500",
      },
      {
        title: t("home.stats.monthlyVisits"),
        value: String(monthlyVisits),
        change: t("home.statsChanges.visits"),
        changeType: "down" as const,
        icon: "ri-calendar-check-line",
        iconBg: "bg-orange-500",
      },
    ];
  }, [dashboardState.data, t]);

  if (dashboardState.isLoading) {
    return <div className={`rounded-xl p-8 text-center ${dark ? "bg-[#21262D] text-gray-400" : "bg-white text-gray-500"}`}>Yuklanmoqda...</div>;
  }

  if (dashboardState.isError) {
    return (
      <div className={`rounded-xl p-8 text-center ${dark ? "bg-[#21262D] text-gray-300" : "bg-white text-gray-700"}`}>
        <p className="mb-4">{dashboardState.error instanceof Error ? dashboardState.error.message : "Ma'lumotlarni yuklashda xatolik yuz berdi."}</p>
        <button
          type="button"
          onClick={() => {
            void dashboardState.refetch();
          }}
          className="min-h-[44px] px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium"
        >
          Qayta yuklash
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} darkMode={dark} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ActivityChart
              darkMode={dark}
              dailyData={dashboardState.data?.daily ?? []}
              weeklyData={dashboardState.data?.weekly ?? []}
              monthlyData={dashboardState.data?.monthly ?? []}
            />
          </div>
          <div>
            <TopHospitals darkMode={dark} topHospitals={dashboardState.data?.topHospitals ?? []} hospitals={dashboardState.data?.hospitals ?? []} />
          </div>
        </div>

        <DashboardBookingCharts
          darkMode={dark}
          dailyBookings={dashboardState.data?.dailyBookings ?? []}
          cityStats={dashboardState.data?.cityStats ?? []}
          weeklyBookings={dashboardState.data?.weeklyBookings ?? []}
        />
      </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation("admin");
  return (
    <MainLayout title={t("titles.dashboard")}>
      <DashboardContent />
    </MainLayout>
  );
}
