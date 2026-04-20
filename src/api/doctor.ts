import { doctorAdapter } from "@/api";
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

export function getDoctors(): Promise<DoctorDto[]> {
  return doctorAdapter.getDoctors();
}

export function getDoctorById(id: string): Promise<DoctorDto | null> {
  return doctorAdapter.getDoctorById(id);
}

export function updateDoctorStatus(id: string, input: UpdateDoctorStatusInput): Promise<DoctorDto | null> {
  return doctorAdapter.updateDoctorStatus(id, input);
}

export function getDoctorPatients(): Promise<DoctorPatientDto[]> {
  return doctorAdapter.getDoctorPatients();
}

export function getDoctorQuestions(): Promise<DoctorQuestionDto[]> {
  return doctorAdapter.getDoctorQuestions();
}

export function getDoctorAnalytics(): Promise<DoctorAnalyticsDto[]> {
  return doctorAdapter.getDoctorAnalytics();
}

export function getDoctorQuestionCategories(): Promise<DoctorQuestionCategoryDto[]> {
  return doctorAdapter.getDoctorQuestionCategories();
}

export function getDoctorQuestionTemplates(): Promise<DoctorQuestionTemplateDto[]> {
  return doctorAdapter.getDoctorQuestionTemplates();
}

export function getDoctorAnalyticsPresets(): Promise<DoctorAnalyticsPresetsDto> {
  return doctorAdapter.getDoctorAnalyticsPresets();
}
