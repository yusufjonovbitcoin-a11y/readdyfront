import { lazy } from "react";
import { type RouteObject } from "react-router-dom";
import AdminSectionLayout from "./layouts/AdminSectionLayout";
import HospitalAdminSectionLayout from "./layouts/HospitalAdminSectionLayout";
import DoctorSectionLayout from "./layouts/DoctorSectionLayout";
import ProtectedRoute from "./ProtectedRoute";
import { RouteFallback, RootIndexRedirect, WithSuspense } from "./helpers";

const LoginPage = lazy(() => import("../pages/login/page"));
const CheckInPage = lazy(() => import("../pages/checkin/page"));
const NotFoundPage = lazy(() => import("../pages/NotFound"));

const DashboardContent = lazy(() =>
  import("../pages/home/page").then((m) => ({ default: m.DashboardContent })),
);
const HospitalsPageContent = lazy(() =>
  import("../pages/hospitals/page").then((m) => ({ default: m.HospitalsPageContent })),
);
const HospitalDetailContent = lazy(() =>
  import("../pages/hospitals/detail/page").then((m) => ({ default: m.HospitalDetailContent })),
);
const AnalyticsPageContent = lazy(() =>
  import("../pages/analytics/page").then((m) => ({ default: m.AnalyticsPageContent })),
);
const UsersPageContent = lazy(() =>
  import("../pages/users/page").then((m) => ({ default: m.UsersPageContent })),
);
const SuperAdminNotificationsPageContent = lazy(() =>
  import("../pages/notifications/page").then((m) => ({ default: m.SuperAdminNotificationsPageContent })),
);
const SuperAdminQuestionsPageContent = lazy(() =>
  import("../pages/questions/page").then((m) => ({ default: m.SuperAdminQuestionsPageContent })),
);
const SettingsPageContent = lazy(() =>
  import("../pages/settings/page").then((m) => ({ default: m.SettingsPageContent })),
);
const AuditLogsPageContent = lazy(() =>
  import("../pages/audit-logs/page").then((m) => ({ default: m.AuditLogsPageContent })),
);
const AuditLogDetailContent = lazy(() =>
  import("../pages/audit-logs/detail/page").then((m) => ({ default: m.default })),
);

const HADashboardContent = lazy(() =>
  import("../pages/hospital-admin/dashboard/page").then((m) => ({ default: m.HADashboardContent })),
);
const HADoctorsPageContent = lazy(() =>
  import("../pages/hospital-admin/doctors/page").then((m) => ({ default: m.HADoctorsPageContent })),
);
const HADoctorDetailContent = lazy(() =>
  import("../pages/hospital-admin/doctors/detail/page").then((m) => ({ default: m.HADoctorDetailContent })),
);
const HAPatientsPageContent = lazy(() =>
  import("../pages/hospital-admin/patients/page").then((m) => ({ default: m.HAPatientsPageContent })),
);
const HAAnalyticsPageContent = lazy(() =>
  import("../pages/hospital-admin/analytics/page").then((m) => ({ default: m.HAAnalyticsPageContent })),
);
const HASettingsPageContent = lazy(() =>
  import("../pages/hospital-admin/settings/page").then((m) => ({ default: m.HASettingsPageContent })),
);

const DocPatientsContent = lazy(() =>
  import("../pages/doctor/patients/page").then((m) => ({ default: m.DocPatientsContent })),
);
const DocPatientDetailRouteContent = lazy(() =>
  import("../pages/doctor/patients/detail/page").then((m) => ({ default: m.DocPatientDetailRouteContent })),
);
const DocHistoryContent = lazy(() =>
  import("../pages/doctor/history/page").then((m) => ({ default: m.DocHistoryContent })),
);
const DocAnalyticsContent = lazy(() =>
  import("../pages/doctor/analytics/page").then((m) => ({ default: m.DocAnalyticsContent })),
);
const DocSettingsContent = lazy(() =>
  import("../pages/doctor/settings/page").then((m) => ({ default: m.DocSettingsContent })),
);
const DocQuestionsContent = lazy(() =>
  import("../pages/doctor/questions/page").then((m) => ({ default: m.DocQuestionsContent })),
);
const DocProfileContent = lazy(() =>
  import("../pages/doctor/profile/page").then((m) => ({ default: m.DocProfileContent })),
);
const NotificationsPageContent = lazy(() =>
  import("../pages/notifications/page").then((m) => ({ default: m.SuperAdminNotificationsPageContent })),
);


const routes: RouteObject[] = [
  {
    path: "/login",
    element: (
      <WithSuspense>
        <LoginPage />
      </WithSuspense>
    ),
  },
  {
    path: "/",
    element: <RootIndexRedirect />,
  },
  {
    path: "/checkin",
    element: (
      <WithSuspense>
        <CheckInPage />
      </WithSuspense>
    ),
  },
  {
    path: "/h/:hospitalId/:departmentSlug/d/:doctorId",
    element: (
      <WithSuspense>
        <CheckInPage />
      </WithSuspense>
    ),
  },
  {
    element: (
      <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
        <AdminSectionLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/home",
        element: (
          <WithSuspense>
            <DashboardContent />
          </WithSuspense>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <WithSuspense>
            <DashboardContent />
          </WithSuspense>
        ),
      },
      {
        path: "/hospitals",
        element: (
          <WithSuspense>
            <HospitalsPageContent />
          </WithSuspense>
        ),
      },
      {
        path: "/hospitals/:id",
        element: (
          <WithSuspense>
            <HospitalDetailContent />
          </WithSuspense>
        ),
      },
      {
        path: "/analytics",
        element: (
          <WithSuspense>
            <AnalyticsPageContent />
          </WithSuspense>
        ),
      },
      {
        path: "/users",
        element: (
          <WithSuspense>
            <UsersPageContent />
          </WithSuspense>
        ),
      },
      {
        path: "/notifications",
        element: (
          <WithSuspense>
            <SuperAdminNotificationsPageContent />
          </WithSuspense>
        ),
      },
      {
        path: "/questions",
        element: (
          <WithSuspense>
            <SuperAdminQuestionsPageContent />
          </WithSuspense>
        ),
      },
      {
        path: "/audit-logs",
        element: (
          <WithSuspense>
            <AuditLogsPageContent />
          </WithSuspense>
        ),
      },
      {
        path: "/audit-logs/:id",
        element: (
          <WithSuspense>
            <AuditLogDetailContent />
          </WithSuspense>
        ),
      },
      {
        path: "/settings",
        element: (
          <WithSuspense>
            <SettingsPageContent />
          </WithSuspense>
        ),
      },
    ],
  },
  {
    element: (
      <ProtectedRoute allowedRoles={["HOSPITAL_ADMIN"]}>
        <HospitalAdminSectionLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/hospital-admin",
        element: (
          <WithSuspense>
            <HADashboardContent />
          </WithSuspense>
        ),
      },
      {
        path: "/hospital-admin/doctors",
        element: (
          <WithSuspense>
            <HADoctorsPageContent />
          </WithSuspense>
        ),
      },
      {
        path: "/hospital-admin/doctors/:id",
        element: (
          <WithSuspense>
            <HADoctorDetailContent />
          </WithSuspense>
        ),
      },
      {
        path: "/hospital-admin/patients",
        element: (
          <WithSuspense>
            <HAPatientsPageContent />
          </WithSuspense>
        ),
      },
      {
        path: "/hospital-admin/analytics",
        element: (
          <WithSuspense>
            <HAAnalyticsPageContent />
          </WithSuspense>
        ),
      },
      {
        path: "/hospital-admin/settings",
        element: (
          <WithSuspense>
            <HASettingsPageContent />
          </WithSuspense>
        ),
      },
      {
        path: "/hospital-admin/notifications",
        element: (
          <WithSuspense>
            <NotificationsPageContent />
          </WithSuspense>
        ),
      },
    ],
  },
  {
    path: "/doctor",
    element: (
      <ProtectedRoute allowedRoles={["DOCTOR"]}>
        <DoctorSectionLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "patients",
        element: (
          <WithSuspense>
            <DocPatientsContent />
          </WithSuspense>
        ),
      },
      {
        path: "patients/:id",
        element: (
          <WithSuspense>
            <DocPatientDetailRouteContent />
          </WithSuspense>
        ),
      },
      {
        path: "history",
        element: (
          <WithSuspense>
            <DocHistoryContent />
          </WithSuspense>
        ),
      },
      {
        path: "analytics",
        element: (
          <WithSuspense>
            <DocAnalyticsContent />
          </WithSuspense>
        ),
      },
      {
        path: "settings",
        element: (
          <WithSuspense>
            <DocSettingsContent />
          </WithSuspense>
        ),
      },
      {
        path: "profile",
        element: (
          <WithSuspense>
            <DocProfileContent />
          </WithSuspense>
        ),
      },
      {
        path: "notifications",
        element: (
          <WithSuspense>
            <NotificationsPageContent />
          </WithSuspense>
        ),
      },
      {
        path: "questions",
        element: (
          <WithSuspense>
            <DocQuestionsContent />
          </WithSuspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <WithSuspense>
        <NotFoundPage />
      </WithSuspense>
    ),
  },
];

export default routes;
