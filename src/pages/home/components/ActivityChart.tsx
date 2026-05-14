import { useTranslation } from "react-i18next";
import type { AnalyticsPeriodPointDto } from "@/api/types/analytics.types";
import { PatientFlowRechartsCard } from "@/components/charts/PatientFlowRechartsCard";

interface ActivityChartProps {
  darkMode: boolean;
  dailyData: AnalyticsPeriodPointDto[];
  weeklyData: AnalyticsPeriodPointDto[];
  monthlyData: AnalyticsPeriodPointDto[];
}

export default function ActivityChart({ darkMode, dailyData, weeklyData, monthlyData }: ActivityChartProps) {
  const { t } = useTranslation("admin");

  return (
    <PatientFlowRechartsCard
      darkMode={darkMode}
      mainLayoutDarkSurfaces
      dailyData={dailyData}
      weeklyData={weeklyData}
      monthlyData={monthlyData}
      title={t("admin:analytics.flowDynamics")}
      subtitle={t("admin:analytics.allHospitals")}
      csvFilenamePrefix="bemor-oqimi"
      labels={{
        periodDaily: t("admin:analytics.period.daily"),
        periodWeekly: t("admin:analytics.period.weekly"),
        periodMonthly: t("admin:analytics.period.monthly"),
        patients: t("admin:analytics.patients"),
        appointments: t("admin:analytics.appointments"),
        completed: t("admin:analytics.summary.completed"),
        chartAria: t("admin:analytics.flowChartAria"),
        calendarHint: t("home.activityChart.calendarHint"),
        dateRangeTitle: t("home.activityChart.dateRangeTitle"),
        dateRangeFrom: t("home.activityChart.dateRangeFrom"),
        dateRangeTo: t("home.activityChart.dateRangeTo"),
        dateRangeApply: t("home.activityChart.dateRangeApply"),
        dateRangeClear: t("home.activityChart.dateRangeClear"),
        dateRangeTooLong: t("home.activityChart.dateRangeTooLong"),
        dateRangeHint: t("home.activityChart.dateRangeHint"),
        dateRangeFillBoth: t("home.activityChart.dateRangeFillBoth"),
        dateRangeOrderInvalid: t("home.activityChart.dateRangeOrderInvalid"),
        exportCsv: t("home.activityChart.exportCsv"),
        brandShort: t("home.activityChart.brandShort"),
      }}
    />
  );
}
