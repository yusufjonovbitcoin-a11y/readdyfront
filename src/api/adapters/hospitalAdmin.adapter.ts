import { apiRequest } from "@/api/client";
import {
  categorySchema,
  doctorSchema,
  hospitalAdminContracts,
  patientSchema,
  questionSchema,
  questionTemplateSchema,
  unwrapCollectionPayload,
} from "@/api/contracts/hospitalAdmin.contract";
import { ApiContractError } from "@/api/errors";
import { emitIntegrationError } from "@/api/integrationSignals";
import type {
  HACategoryDto,
  HAPatientDto,
  HAQuestionDto,
  HAQuestionTemplateDto,
} from "@/api/types/hospitalAdmin.types";
import type { DoctorDto } from "@/api/types/doctor.types";

function parseCollectionOrThrow<T>(
  payload: unknown,
  endpoint: string,
  schema: { safeParse: (data: unknown) => { success: true; data: T[] } | { success: false; error: { issues: unknown } } },
): T[] {
  const collection = unwrapCollectionPayload(payload);
  if (!collection) {
    emitIntegrationError({
      area: "general",
      reason: "hospital_admin_contract_mismatch",
      details: { endpoint, payload },
      at: Date.now(),
    });
    throw new ApiContractError("hospital-admin", endpoint, payload);
  }

  const parsed = schema.safeParse(collection);
  if (parsed.success) return parsed.data;

  emitIntegrationError({
    area: "general",
    reason: "hospital_admin_contract_mismatch",
    details: {
      endpoint,
      issues: parsed.error.issues,
      payload,
    },
    at: Date.now(),
  });

  throw new ApiContractError("hospital-admin", endpoint, parsed.error.issues);
}

function parseEntityOrThrow<T>(
  payload: unknown,
  endpoint: string,
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: { issues: unknown } } },
): T {
  const parsed = schema.safeParse(payload);
  if (parsed.success) return parsed.data;

  emitIntegrationError({
    area: "general",
    reason: "hospital_admin_contract_mismatch",
    details: {
      endpoint,
      issues: parsed.error.issues,
      payload,
    },
    at: Date.now(),
  });
  throw new ApiContractError("hospital-admin", endpoint, parsed.error.issues);
}

export const hospitalAdminAdapter = {
  getDoctors: async (): Promise<DoctorDto[]> => {
    const endpoint = "/api/hospital-admin/doctors";
    const payload = await apiRequest<unknown>(endpoint);
    return parseCollectionOrThrow(payload, endpoint, hospitalAdminContracts.doctors);
  },
  getPatients: async (): Promise<HAPatientDto[]> => {
    const endpoint = "/api/hospital-admin/patients";
    const payload = await apiRequest<unknown>(endpoint);
    return parseCollectionOrThrow(payload, endpoint, hospitalAdminContracts.patients);
  },
  getCategories: async (): Promise<HACategoryDto[]> => {
    const endpoint = "/api/hospital-admin/questions/categories";
    const payload = await apiRequest<unknown>(endpoint);
    return parseCollectionOrThrow(payload, endpoint, hospitalAdminContracts.categories);
  },
  getQuestionTemplates: async (): Promise<HAQuestionTemplateDto[]> => {
    const endpoint = "/api/hospital-admin/questions/templates";
    const payload = await apiRequest<unknown>(endpoint);
    return parseCollectionOrThrow(payload, endpoint, hospitalAdminContracts.questionTemplates);
  },
  getQuestions: async (): Promise<HAQuestionDto[]> => {
    const endpoint = "/api/hospital-admin/questions";
    const payload = await apiRequest<unknown>(endpoint);
    return parseCollectionOrThrow(payload, endpoint, hospitalAdminContracts.questions);
  },
  createPatient: async (
    input: Omit<HAPatientDto, "id" | "doctorName" | "lastVisit" | "hospitalId" | "visitCount" | "dischargeRecord">,
  ): Promise<HAPatientDto> => {
    const endpoint = "/api/hospital-admin/patients";
    const payload = await apiRequest<unknown>(endpoint, { method: "POST", body: JSON.stringify(input) });
    return parseEntityOrThrow(payload, endpoint, patientSchema);
  },
  updatePatient: async (id: string, input: Partial<HAPatientDto>): Promise<HAPatientDto> => {
    const endpoint = `/api/hospital-admin/patients/${encodeURIComponent(id)}`;
    const payload = await apiRequest<unknown>(endpoint, { method: "PATCH", body: JSON.stringify(input) });
    return parseEntityOrThrow(payload, endpoint, patientSchema);
  },
  deletePatient: async (id: string): Promise<void> => {
    const endpoint = `/api/hospital-admin/patients/${encodeURIComponent(id)}`;
    await apiRequest<null>(endpoint, { method: "DELETE" });
  },
  createCategory: async (input: Pick<HACategoryDto, "name">): Promise<HACategoryDto> => {
    const endpoint = "/api/hospital-admin/questions/categories";
    const payload = await apiRequest<unknown>(endpoint, { method: "POST", body: JSON.stringify(input) });
    return parseEntityOrThrow(payload, endpoint, categorySchema);
  },
  updateCategory: async (id: string, input: Pick<HACategoryDto, "name">): Promise<HACategoryDto> => {
    const endpoint = `/api/hospital-admin/questions/categories/${encodeURIComponent(id)}`;
    const payload = await apiRequest<unknown>(endpoint, { method: "PATCH", body: JSON.stringify(input) });
    return parseEntityOrThrow(payload, endpoint, categorySchema);
  },
  deleteCategory: async (id: string): Promise<void> => {
    const endpoint = `/api/hospital-admin/questions/categories/${encodeURIComponent(id)}`;
    await apiRequest<null>(endpoint, { method: "DELETE" });
  },
  createTemplate: async (
    input: Pick<HAQuestionTemplateDto, "title" | "categoryId">,
  ): Promise<HAQuestionTemplateDto> => {
    const endpoint = "/api/hospital-admin/questions/templates";
    const payload = await apiRequest<unknown>(endpoint, { method: "POST", body: JSON.stringify(input) });
    return parseEntityOrThrow(payload, endpoint, questionTemplateSchema);
  },
  updateTemplate: async (
    id: string,
    input: Pick<HAQuestionTemplateDto, "title" | "categoryId">,
  ): Promise<HAQuestionTemplateDto> => {
    const endpoint = `/api/hospital-admin/questions/templates/${encodeURIComponent(id)}`;
    const payload = await apiRequest<unknown>(endpoint, { method: "PATCH", body: JSON.stringify(input) });
    return parseEntityOrThrow(payload, endpoint, questionTemplateSchema);
  },
  deleteTemplate: async (id: string): Promise<void> => {
    const endpoint = `/api/hospital-admin/questions/templates/${encodeURIComponent(id)}`;
    await apiRequest<null>(endpoint, { method: "DELETE" });
  },
  createQuestion: async (input: Pick<HAQuestionDto, "text" | "templateId" | "order">): Promise<HAQuestionDto> => {
    const endpoint = "/api/hospital-admin/questions";
    const payload = await apiRequest<unknown>(endpoint, { method: "POST", body: JSON.stringify(input) });
    return parseEntityOrThrow(payload, endpoint, questionSchema);
  },
  updateQuestion: async (id: string, input: Pick<HAQuestionDto, "text">): Promise<HAQuestionDto> => {
    const endpoint = `/api/hospital-admin/questions/${encodeURIComponent(id)}`;
    const payload = await apiRequest<unknown>(endpoint, { method: "PATCH", body: JSON.stringify(input) });
    return parseEntityOrThrow(payload, endpoint, questionSchema);
  },
  deleteQuestion: async (id: string): Promise<void> => {
    const endpoint = `/api/hospital-admin/questions/${encodeURIComponent(id)}`;
    await apiRequest<null>(endpoint, { method: "DELETE" });
  },
  getDoctorById: async (id: string): Promise<DoctorDto> => {
    const endpoint = `/api/hospital-admin/doctors/${encodeURIComponent(id)}`;
    const payload = await apiRequest<unknown>(endpoint);
    return parseEntityOrThrow(payload, endpoint, doctorSchema);
  },
};
