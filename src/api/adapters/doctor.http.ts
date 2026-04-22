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

type BackendDoctorDto = {
  id: string;
  phone_number: string;
  specialization: string;
  hospital_id: string;
  created_at?: string;
  hospital?: {
    name?: string;
  } | null;
};

function normalizeDoctor(dto: BackendDoctorDto): DoctorDto {
  return {
    id: dto.id,
    name: `Doctor ${dto.id.slice(0, 6)}`,
    specialty: dto.specialization,
    phone: dto.phone_number,
    email: "",
    avatar: "",
    todayPatients: 0,
    totalPatients: 0,
    rating: 0,
    status: "active",
    joinDate: dto.created_at ?? new Date().toISOString(),
    hospitalId: dto.hospital_id,
    qrCode: dto.id,
  };
}

export async function getDoctors(): Promise<DoctorDto[]> {
  const doctors = await apiRequest<BackendDoctorDto[]>("/api/doctors");
  return doctors.map(normalizeDoctor);
}

export async function getDoctorById(id: string): Promise<DoctorDto | null> {
  const doctor = await apiRequest<BackendDoctorDto | null>(`/api/doctors/${encodeURIComponent(id)}`);
  return doctor ? normalizeDoctor(doctor) : null;
}

export async function updateDoctorStatus(id: string, input: UpdateDoctorStatusInput): Promise<DoctorDto | null> {
  const updated = await apiRequest<BackendDoctorDto | null>(`/api/doctors/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return updated ? normalizeDoctor(updated) : null;
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
