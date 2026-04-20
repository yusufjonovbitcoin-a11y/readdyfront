import { useTranslation } from "react-i18next";
import MainLayout from "@/components/feature/MainLayout";
import { useMainLayoutDarkMode } from "@/context/LayoutThemeContext";
import { mockHospitals } from "@/mocks/hospitals";
import StatCard from "./components/StatCard";
import ActivityChart from "./components/ActivityChart";
import TopHospitals from "./components/TopHospitals";
import RecentActivity from "./components/RecentActivity";

export function DashboardContent() {
  const { t } = useTranslation("admin");
  const dark = useMainLayoutDarkMode();

  const stats = [
    {
      title: t("home.stats.totalHospitals"),
      value: String(mockHospitals.length),
      change: t("home.statsChanges.hospitals"),
      changeType: "up" as const,
      icon: "ri-hospital-line",
      iconBg: "bg-emerald-500",
    },
    {
      title: t("home.stats.activeDoctors"),
      value: "203",
      change: t("home.statsChanges.doctors"),
      changeType: "up" as const,
      icon: "ri-stethoscope-line",
      iconBg: "bg-blue-500",
    },
    {
      title: t("home.stats.todayPatients"),
      value: "1,187",
      change: t("home.statsChanges.patients"),
      changeType: "up" as const,
      icon: "ri-user-heart-line",
      iconBg: "bg-violet-500",
    },
    {
      title: t("home.stats.monthlyVisits"),
      value: "28,450",
      change: t("home.statsChanges.visits"),
      changeType: "down" as const,
      icon: "ri-calendar-check-line",
      iconBg: "bg-orange-500",
    },
  ];

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
            <ActivityChart darkMode={dark} />
          </div>
          <div>
            <TopHospitals darkMode={dark} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecentActivity darkMode={dark} />
          </div>
          {/* System Alerts */}
          <div className={`rounded-xl p-5 ${dark ? "bg-[#1A2235]" : "bg-white"}`}>
            <h3 className={`text-base font-semibold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>{t("home.alerts.title")}</h3>
            <div className="space-y-3">
              {[
                { text: t("home.alerts.items.inactive"), type: "error", time: t("home.alerts.times.twoDays") },
                { text: t("home.alerts.items.shortage"), type: "warning", time: t("home.alerts.times.fiveHours") },
                { text: t("home.alerts.items.report"), type: "success", time: t("home.alerts.times.oneHour") },
                { text: t("home.alerts.items.newHospital"), type: "info", time: t("home.alerts.times.threeDays") },
              ].map((alert, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                  dark ? "bg-[#0F1117]" : "bg-gray-50"
                }`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    alert.type === "error" ? "bg-red-400" :
                    alert.type === "warning" ? "bg-yellow-400" :
                    alert.type === "success" ? "bg-emerald-400" : "bg-blue-400"
                  }`}></div>
                  <div>
                    <p className={`text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>{alert.text}</p>
                    <p className={`text-sm mt-0.5 ${dark ? "text-gray-600" : "text-gray-400"}`}>{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
