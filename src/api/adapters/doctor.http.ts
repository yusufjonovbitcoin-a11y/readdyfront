import { apiRequest } from "@/api/client";
import type {
  DoctorAnalyticsPresetsDto,
  DoctorAnalyticsDto,
  DoctorDto,
  DoctorPatientDto,
  DoctorQuestionCategoryDto,
  DoctorQuestionDto,
  DoctorQuestionTemplateDto,
  UpdateDoctorStatusInput,
} from "@/api/types/doctor.types";
import {
  getDefaultDoctorAnalyticsPresets,
  getDefaultDoctorQuestionCategories,
  getDefaultDoctorQuestionTemplates,
} from "@/api/adapters/doctor.shared";

export async function getDoctors(): Promise<DoctorDto[]> {
  return apiRequest<DoctorDto[]>("/api/doctors");
}

export async function getDoctorById(id: string): Promise<DoctorDto | null> {
  return apiRequest<DoctorDto | null>(`/api/doctors/${encodeURIComponent(id)}`);
}

export async function updateDoctorStatus(id: string, input: UpdateDoctorStatusInput): Promise<DoctorDto | null> {
  return apiRequest<DoctorDto | null>(`/api/doctors/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function getDoctorPatients(): Promise<DoctorPatientDto[]> {
  return apiRequest<DoctorPatientDto[]>("/api/doctor/patients");
}

export async function getDoctorQuestions(): Promise<DoctorQuestionDto[]> {
  return apiRequest<DoctorQuestionDto[]>("/api/doctor/questions");
}

export async function getDoctorAnalytics(): Promise<DoctorAnalyticsDto[]> {
  return apiRequest<DoctorAnalyticsDto[]>("/api/doctor/analytics");
}

export async function getDoctorQuestionCategories(): Promise<DoctorQuestionCategoryDto[]> {
  try {
    return await apiRequest<DoctorQuestionCategoryDto[]>("/api/doctor/questions/categories");
  } catch {
    return getDefaultDoctorQuestionCategories();
  }
}

export async function getDoctorQuestionTemplates(): Promise<DoctorQuestionTemplateDto[]> {
  try {
    return await apiRequest<DoctorQuestionTemplateDto[]>("/api/doctor/questions/templates");
  } catch {
    return getDefaultDoctorQuestionTemplates();
  }
}

export async function getDoctorAnalyticsPresets(): Promise<DoctorAnalyticsPresetsDto> {
  try {
    return await apiRequest<DoctorAnalyticsPresetsDto>("/api/doctor/analytics/presets");
  } catch {
    return getDefaultDoctorAnalyticsPresets();
  }
}
