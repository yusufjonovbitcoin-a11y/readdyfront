import { hospitalAdminAdapter } from "@/api";
import type {
  HACategoryDto,
  HAPatientDto,
  HAQuestionDto,
  HAQuestionTemplateDto,
} from "@/api/types/hospitalAdmin.types";
import type { DoctorDto } from "@/api/types/doctor.types";

export type HAPatient = HAPatientDto;
export type HACategory = HACategoryDto;
export type HAQuestionTemplate = HAQuestionTemplateDto;
export type HAQuestion = HAQuestionDto;

export async function getHADoctors(): Promise<DoctorDto[]> {
  return hospitalAdminAdapter.getDoctors();
}

export async function getHAPatients(): Promise<HAPatientDto[]> {
  return hospitalAdminAdapter.getPatients();
}

export async function getHAQuestionCategories(): Promise<HACategoryDto[]> {
  return hospitalAdminAdapter.getCategories();
}

export async function getHAQuestionCategoryById(id: string): Promise<HACategoryDto | null> {
  return hospitalAdminAdapter.getCategoryById(id);
}

export async function getHAQuestionTemplates(): Promise<HAQuestionTemplateDto[]> {
  return hospitalAdminAdapter.getQuestionTemplates();
}

export async function getHAQuestionTemplateById(id: string): Promise<HAQuestionTemplateDto | null> {
  return hospitalAdminAdapter.getQuestionTemplateById(id);
}

export async function getHAQuestions(): Promise<HAQuestionDto[]> {
  return hospitalAdminAdapter.getQuestions();
}

export async function createHAPatient(
  input: Omit<HAPatientDto, "id" | "doctorName" | "lastVisit" | "hospitalId" | "visitCount" | "dischargeRecord">,
): Promise<HAPatientDto> {
  return hospitalAdminAdapter.createPatient(input);
}

export async function updateHAPatient(id: string, input: Partial<HAPatientDto>): Promise<HAPatientDto> {
  return hospitalAdminAdapter.updatePatient(id, input);
}

export async function deleteHAPatient(id: string): Promise<void> {
  return hospitalAdminAdapter.deletePatient(id);
}

export async function createHAQuestionCategory(name: string): Promise<HACategoryDto> {
  return hospitalAdminAdapter.createCategory({ name });
}

export async function updateHAQuestionCategory(id: string, name: string): Promise<HACategoryDto> {
  return hospitalAdminAdapter.updateCategory(id, { name });
}

export async function deleteHAQuestionCategory(id: string): Promise<void> {
  return hospitalAdminAdapter.deleteCategory(id);
}

export async function createHAQuestionTemplate(data: { title: string; categoryId: string }): Promise<HAQuestionTemplateDto> {
  return hospitalAdminAdapter.createTemplate(data);
}

export async function updateHAQuestionTemplate(
  id: string,
  data: { title: string; categoryId: string },
): Promise<HAQuestionTemplateDto> {
  return hospitalAdminAdapter.updateTemplate(id, data);
}

export async function deleteHAQuestionTemplate(id: string): Promise<void> {
  return hospitalAdminAdapter.deleteTemplate(id);
}

export async function createHAQuestion(data: { text: string; templateId: string; order: number }): Promise<HAQuestionDto> {
  return hospitalAdminAdapter.createQuestion(data);
}

export async function updateHAQuestion(id: string, text: string): Promise<HAQuestionDto> {
  return hospitalAdminAdapter.updateQuestion(id, { text });
}

export async function deleteHAQuestion(id: string): Promise<void> {
  return hospitalAdminAdapter.deleteQuestion(id);
}
