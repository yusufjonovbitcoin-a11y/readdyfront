import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import HospitalsPage from "../pages/hospitals/page";
import HospitalDetailPage from "../pages/hospitals/detail/page";
import AnalyticsPage from "../pages/analytics/page";
import UsersPage from "../pages/users/page";
import SettingsPage from "../pages/settings/page";
import LoginPage from "../pages/login/page";
import AuditLogsPage from "../pages/audit-logs/page";
import AuditLogDetailPage from "../pages/audit-logs/detail/page";

// Hospital Admin pages
import HADashboardPage from "../pages/hospital-admin/dashboard/page";
import HADoctorsPage from "../pages/hospital-admin/doctors/page";
import HADoctorDetailPage from "../pages/hospital-admin/doctors/detail/page";
import HAPatientsPage from "../pages/hospital-admin/patients/page";
import HAQuestionsPage from "../pages/hospital-admin/questions/page";
import HAAnalyticsPage from "../pages/hospital-admin/analytics/page";
import HASettingsPage from "../pages/hospital-admin/settings/page";

// Doctor Panel pages
import DoctorPanelLayout from "../pages/doctor/DoctorPanelLayout";
import DocPatientsPage from "../pages/doctor/patients/page";
import DocPatientDetailPage from "../pages/doctor/patients/detail/page";
import DocHistoryPage from "../pages/doctor/history/page";
import DocQuestionsPage from "../pages/doctor/questions/page";
import DocAnalyticsPage from "../pages/doctor/analytics/page";
import DocSettingsPage from "../pages/doctor/settings/page";
import DocProfilePage from "../pages/doctor/profile/page";

// Check-in page
import CheckInPage from "../pages/checkin/page";

const routes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/hospitals",
    element: <HospitalsPage />,
  },
  {
    path: "/hospitals/:id",
    element: <HospitalDetailPage />,
  },
  {
    path: "/analytics",
    element: <AnalyticsPage />,
  },
  {
    path: "/users",
    element: <UsersPage />,
  },
  {
    path: "/audit-logs",
    element: <AuditLogsPage />,
  },
  {
    path: "/audit-logs/:id",
    element: <AuditLogDetailPage />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
  },
  {
    path: "/hospital-admin",
    element: <HADashboardPage />,
  },
  {
    path: "/hospital-admin/doctors",
    element: <HADoctorsPage />,
  },
  {
    path: "/hospital-admin/doctors/:id",
    element: <HADoctorDetailPage />,
  },
  {
    path: "/hospital-admin/patients",
    element: <HAPatientsPage />,
  },
  {
    path: "/hospital-admin/questions",
    element: <HAQuestionsPage />,
  },
  {
    path: "/hospital-admin/analytics",
    element: <HAAnalyticsPage />,
  },
  {
    path: "/hospital-admin/settings",
    element: <HASettingsPage />,
  },
  {
    path: "/doctor",
    element: <DoctorPanelLayout />,
    children: [
      { path: "patients", element: <DocPatientsPage /> },
      { path: "patients/:id", element: <DocPatientDetailPage /> },
      { path: "history", element: <DocHistoryPage /> },
      { path: "questions", element: <DocQuestionsPage /> },
      { path: "analytics", element: <DocAnalyticsPage /> },
      { path: "settings", element: <DocSettingsPage /> },
      { path: "profile", element: <DocProfilePage /> },
    ],
  },
  {
    path: "/checkin",
    element: <CheckInPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
