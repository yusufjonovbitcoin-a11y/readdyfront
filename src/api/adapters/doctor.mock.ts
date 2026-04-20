import { docAnalytics, docPatients, docQuestions } from "@/mocks/doc_patients";
import { haDoctors } from "@/mocks/ha_doctors";
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

let doctorsState: DoctorDto[] = [...haDoctors];

export async function getDoctors(): Promise<DoctorDto[]> {
  return [...doctorsState];
}

export async function getDoctorById(id: string): Promise<DoctorDto | null> {
  return doctorsState.find((doctor) => doctor.id === id) ?? null;
}

export async function updateDoctorStatus(id: string, input: UpdateDoctorStatusInput): Promise<DoctorDto | null> {
  const target = doctorsState.find((doctor) => doctor.id === id);
  if (!target) return null;
  const updated = { ...target, status: input.status };
  doctorsState = doctorsState.map((doctor) => (doctor.id === id ? updated : doctor));
  return updated;
}

export async function getDoctorPatients(): Promise<DoctorPatientDto[]> {
  return [...docPatients];
}

export async function getDoctorQuestions(): Promise<DoctorQuestionDto[]> {
  return [...docQuestions];
}

export async function getDoctorAnalytics(): Promise<DoctorAnalyticsDto[]> {
  return [...docAnalytics];
}

export async function getDoctorQuestionCategories(): Promise<DoctorQuestionCategoryDto[]> {
  return getDefaultDoctorQuestionCategories();
}

export async function getDoctorQuestionTemplates(): Promise<DoctorQuestionTemplateDto[]> {
  return getDefaultDoctorQuestionTemplates();
}

export async function getDoctorAnalyticsPresets(): Promise<DoctorAnalyticsPresetsDto> {
  return getDefaultDoctorAnalyticsPresets();
}
