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
  checkin_url?: string;
  checkinUrl?: string;
  queue_url?: string;
  queueUrl?: string;
  registration_url?: string;
  registrationUrl?: string;
  link?: string;
  url?: string;
  hospital?: {
    name?: string;
  } | null;
} & Record<string, unknown>;

type BackendDepartmentDto = {
  id: string;
  name: string;
  hospital_id: string;
};

type BackendQuestionnaireDto = {
  id: string;
  title: string;
  department_id: string;
  hospital_id: string;
  is_active?: boolean;
  created_at?: string;
};

type BackendQuestionDto = {
  id: string;
  questionnaire_id: string;
  question_text?: string;
  text?: string;
  created_at?: string;
};

function isCheckinPathLike(value: string): boolean {
  return /\/h\/[^/]+\/[^/]+\/d\/[^/\s"]+/i.test(value) || /\/checkin/i.test(value);
}

function normalizeUrlLike(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function extractCheckinUrl(dto: BackendDoctorDto): string {
  const knownCandidates = [
    dto.checkin_url,
    dto.checkinUrl,
    dto.queue_url,
    dto.queueUrl,
    dto.registration_url,
    dto.registrationUrl,
    dto.link,
    dto.url,
  ];

  for (const candidate of knownCandidates) {
    if (typeof candidate === "string" && isCheckinPathLike(candidate)) {
      return normalizeUrlLike(candidate);
    }
  }

  for (const value of Object.values(dto)) {
    if (typeof value === "string" && isCheckinPathLike(value)) {
      return normalizeUrlLike(value);
    }
  }

  return `/checkin?doctor_id=${encodeURIComponent(dto.id)}`;
}

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
    qrCode: extractCheckinUrl(dto),
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
  try {
    return await apiRequest<DoctorPatientDto[]>("/api/doctor/patients");
  } catch {
    return [];
  }
}

export async function getDoctorQuestions(): Promise<DoctorQuestionDto[]> {
  try {
    const [questions, questionnaires, departments] = await Promise.all([
      apiRequest<BackendQuestionDto[]>("/api/questions"),
      apiRequest<BackendQuestionnaireDto[]>("/api/questionnaires"),
      apiRequest<BackendDepartmentDto[]>("/api/departments"),
    ]);
    const questionnaireMap = new Map(questionnaires.map((q) => [q.id, q]));
    const departmentMap = new Map(departments.map((d) => [d.id, d]));
    return questions.map((question, index) => {
      const questionnaire = questionnaireMap.get(question.questionnaire_id);
      const department = questionnaire ? departmentMap.get(questionnaire.department_id) : null;
      return {
        id: question.id,
        text: question.text ?? question.question_text ?? "",
        category: department?.name ?? "General",
        categoryId: department?.id ?? "",
        status: "active",
        isCustom: true,
        doctorId: "doc-001",
        createdAt: question.created_at ?? new Date().toISOString().split("T")[0],
      };
    });
  } catch {
    return [];
  }
}

export async function getDoctorAnalytics(): Promise<DoctorAnalyticsDto[]> {
  try {
    return await apiRequest<DoctorAnalyticsDto[]>("/api/doctor/analytics");
  } catch {
    return [];
  }
}

export async function getDoctorQuestionCategories(): Promise<DoctorQuestionCategoryDto[]> {
  try {
    const departments = await apiRequest<BackendDepartmentDto[]>("/api/departments");
    if (!Array.isArray(departments) || departments.length === 0) {
      return getDefaultDoctorQuestionCategories();
    }
    return departments.map((department) => ({
      id: department.id,
      name: department.name,
    }));
  } catch {
    return getDefaultDoctorQuestionCategories();
  }
}

export async function getDoctorQuestionTemplates(): Promise<DoctorQuestionTemplateDto[]> {
  try {
    const [questionnaires, departments] = await Promise.all([
      apiRequest<BackendQuestionnaireDto[]>("/api/questionnaires"),
      apiRequest<BackendDepartmentDto[]>("/api/departments"),
    ]);
    const departmentMap = new Map(departments.map((d) => [d.id, d]));
    return questionnaires.map((questionnaire) => ({
      id: questionnaire.id,
      text: questionnaire.title,
      category: departmentMap.get(questionnaire.department_id)?.name ?? "General",
      categoryId: questionnaire.department_id,
    }));
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

export async function createDoctorQuestionWithTemplate(input: {
  title: string;
  text: string;
  departmentId: string;
  answerMode?: "boolean" | "text";
}): Promise<DoctorQuestionDto> {
  const departments = await apiRequest<BackendDepartmentDto[]>("/api/departments");
  const selectedDepartment = departments.find((department) => department.id === input.departmentId);
  if (!selectedDepartment) {
    throw {
      status: 400,
      message: "Tanlangan bo'lim topilmadi.",
      data: { departmentId: input.departmentId },
    };
  }

  const questionnaire = await apiRequest<BackendQuestionnaireDto>("/api/questionnaires", {
    method: "POST",
    body: JSON.stringify({
      hospital_id: selectedDepartment.hospital_id,
      department_id: selectedDepartment.id,
      title: input.title.trim(),
      is_active: true,
    }),
  });

  const createdQuestion = await apiRequest<BackendQuestionDto>("/api/questions", {
    method: "POST",
    body: JSON.stringify({
      questionnaire_id: questionnaire.id,
      text: input.text.trim(),
      type: input.answerMode === "text" ? "TEXT" : "SELECT",
      is_required: true,
      order: 1,
    }),
  });

  return {
    id: createdQuestion.id,
    text: createdQuestion.text ?? createdQuestion.question_text ?? input.text.trim(),
    category: selectedDepartment.name,
    categoryId: selectedDepartment.id,
    status: "active",
    isCustom: true,
    doctorId: "doc-001",
    createdAt: createdQuestion.created_at ?? new Date().toISOString().split("T")[0],
  };
}

export async function updateDoctorQuestion(id: string, text: string): Promise<DoctorQuestionDto> {
  const updated = await apiRequest<BackendQuestionDto>(`/api/questions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ text: text.trim() }),
  });
  return {
    id: updated.id,
    text: updated.text ?? updated.question_text ?? text.trim(),
    category: "General",
    categoryId: "",
    status: "active",
    isCustom: true,
    doctorId: "doc-001",
    createdAt: updated.created_at ?? new Date().toISOString().split("T")[0],
  };
}

export async function deleteDoctorQuestion(id: string): Promise<void> {
  await apiRequest<null>(`/api/questions/${encodeURIComponent(id)}`, { method: "DELETE" });
}
