import { z } from "zod";
import { ApiContractError } from "@/api/errors";
import { emitIntegrationError } from "@/api/integrationSignals";

export const analyticsPeriodPointSchema = z.object({
  date: z.string(),
  patients: z.number(),
  appointments: z.number(),
  completed: z.number(),
});

export const doctorPerformanceSchema = z.object({
  name: z.string(),
  patients: z.number(),
  rating: z.number(),
  specialty: z.string(),
});

export const topHospitalSchema = z.object({
  name: z.string(),
  patients: z.number(),
  max: z.number(),
});

export const dailyBookingPointSchema = z.object({
  date: z.string(),
  successful: z.number(),
  failed: z.number(),
});

export const cityStatPointSchema = z.object({
  city: z.string(),
  successful: z.number(),
});

export const weeklyBookingPointSchema = z.object({
  week: z.string(),
  bookings: z.number(),
});

export const analyticsDashboardSchema = z.object({
  daily: z.array(analyticsPeriodPointSchema),
  weekly: z.array(analyticsPeriodPointSchema),
  monthly: z.array(analyticsPeriodPointSchema),
  doctorPerformance: z.array(doctorPerformanceSchema),
  topHospitals: z.array(topHospitalSchema),
  dailyBookings: z.array(dailyBookingPointSchema),
  weeklyBookings: z.array(weeklyBookingPointSchema),
  cityStats: z.array(cityStatPointSchema),
});

export const peakHourSchema = z.object({
  hour: z.string(),
  count: z.number(),
});

export const hospitalSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    viloyat: z.string().optional().nullable(),
    address: z.string(),
    phone: z.string(),
    doctorsCount: z.number().optional().nullable(),
    dailyPatients: z.number().optional().nullable(),
    adminName: z.string().optional().nullable(),
    adminPhone: z.string().optional().nullable(),
    createdAt: z.string().optional().nullable(),
    created_at: z.string().optional().nullable(),
    isActive: z.boolean().optional().nullable(),
    status: z.union([z.literal("active"), z.literal("inactive")]).optional().nullable(),
  })
  .transform((row) => ({
    id: row.id,
    name: row.name,
    viloyat: (row.viloyat ?? "").trim(),
    address: row.address,
    phone: row.phone,
    doctorsCount: row.doctorsCount ?? 0,
    dailyPatients: row.dailyPatients ?? 0,
    adminName: (row.adminName ?? "").trim(),
    adminPhone: (row.adminPhone ?? "").trim(),
    status: (row.status ?? (row.isActive === false ? "inactive" : "active")) as "active" | "inactive",
    createdAt: (row.createdAt ?? row.created_at ?? new Date().toISOString()).trim(),
  }));

export const auditLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  role: z.union([z.literal("SUPER_ADMIN"), z.literal("HOSPITAL_ADMIN"), z.literal("DOCTOR")]),
  action: z.string(),
  resource: z.string(),
  detail: z.string(),
  ip: z.string(),
  userAgent: z.string(),
  timestamp: z.string(),
  status: z.union([z.literal("success"), z.literal("failed"), z.literal("warning")]),
  resourceId: z.string().optional(),
  hospitalId: z.string().optional(),
  hospitalName: z.string().optional(),
});

export function parseContractOrThrow<T>(
  payload: unknown,
  endpoint: string,
  schema: z.ZodType<T>,
): T {
  const parsed = schema.safeParse(payload);
  if (parsed.success) return parsed.data;

  emitIntegrationError({
    area: "general",
    reason: "analytics_contract_mismatch",
    details: { endpoint, issues: parsed.error.issues },
    at: Date.now(),
  });
  throw new ApiContractError("analytics", endpoint, parsed.error.issues);
}
