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

export const analyticsDashboardSchema = z.object({
  daily: z.array(analyticsPeriodPointSchema),
  weekly: z.array(analyticsPeriodPointSchema),
  monthly: z.array(analyticsPeriodPointSchema),
  doctorPerformance: z.array(doctorPerformanceSchema),
  topHospitals: z.array(topHospitalSchema),
});

export const peakHourSchema = z.object({
  hour: z.string(),
  count: z.number(),
});

export const hospitalSchema = z.object({
  id: z.string(),
  name: z.string(),
  viloyat: z.string(),
  address: z.string(),
  phone: z.string(),
  doctorsCount: z.number(),
  dailyPatients: z.number(),
  status: z.union([z.literal("active"), z.literal("inactive")]),
  adminName: z.string(),
  adminPhone: z.string(),
  createdAt: z.string(),
});

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
