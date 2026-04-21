import { z } from "zod";

export const doctorSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  specialty: z.string(),
  rating: z.number(),
  experience: z.string(),
  status: z.enum(["active", "inactive"]),
  avatar: z.string(),
  todayPatients: z.number(),
  availableTime: z.string(),
  room: z.string(),
  completionRate: z.number(),
  totalPatients: z.number(),
});

export const patientVisitQaSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const dischargeRecordSchema = z.object({
  aiDiagnosis: z.string(),
  doctorNotes: z.string(),
  qa: z.array(patientVisitQaSchema),
});

export const patientSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  age: z.number(),
  gender: z.enum(["male", "female"]),
  doctorId: z.string(),
  doctorName: z.string(),
  lastVisit: z.string(),
  nextVisit: z.string().nullable(),
  diagnosis: z.string(),
  status: z.enum(["active", "discharged", "scheduled"]),
  hospitalId: z.string(),
  visitCount: z.number(),
  dischargeRecord: dischargeRecordSchema.optional(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const questionTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  categoryId: z.string(),
  categoryName: z.string(),
  questionCount: z.number(),
  createdAt: z.string(),
});

export const questionSchema = z.object({
  id: z.string(),
  text: z.string(),
  templateId: z.string(),
  order: z.number(),
});

export const hospitalAdminContracts = {
  doctors: z.array(doctorSchema),
  patients: z.array(patientSchema),
  categories: z.array(categorySchema),
  questionTemplates: z.array(questionTemplateSchema),
  questions: z.array(questionSchema),
} as const;

export function unwrapCollectionPayload(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data;
  }
  return null;
}
