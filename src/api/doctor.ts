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

export function getMyDoctorProfile(): Promise<DoctorDto | null> {
  return doctorAdapter.getMyDoctorProfile();
}

export function updateDoctorStatus(id: string, input: UpdateDoctorStatusInput): Promise<DoctorDto | null> {
  return doctorAdapter.updateDoctorStatus(id, input);
}

export function deleteDoctor(id: string): Promise<void> {
  return doctorAdapter.deleteDoctor(id);
}

export function getDoctorPatients(): Promise<DoctorPatientDto[]> {
  return doctorAdapter.getDoctorPatients();
}

export function updateDoctorPatientWorkflow(
  responseId: string,
  input: {
    status: "queue" | "in_progress" | "completed" | "history";
    diagnosis?: string;
    notes?: string;
    consultationDuration?: number;
  },
): Promise<DoctorPatientDto> {
  return doctorAdapter.updateDoctorPatientWorkflow(responseId, input);
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

export function createDoctorQuestionWithTemplate(input: {
  title: string;
  text: string;
  departmentId: string;
  answerMode?: "boolean" | "text";
}): Promise<DoctorQuestionDto> {
  return doctorAdapter.createDoctorQuestionWithTemplate(input);
}

export function updateDoctorQuestion(id: string, text: string): Promise<DoctorQuestionDto> {
  return doctorAdapter.updateDoctorQuestion(id, text);
}

export function deleteDoctorQuestion(id: string): Promise<void> {
  return doctorAdapter.deleteDoctorQuestion(id);
}

export function updateDoctorAvatar(avatarUrl: string): Promise<string> {
  return doctorAdapter.updateDoctorAvatar(avatarUrl);
}
