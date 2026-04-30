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
  full_name?: string | null;
  phone_number?: string;
  specialization: string;
  hospital_id: string;
  avatar?: string | null;
  avatar_url?: string | null;
  refresh_token?: string | null;
  created_at?: string;
  checkin_url?: string;
  checkinUrl?: string;
  doctorUrl?: string;
  doctor_url?: string;
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

type BackendQuestionDto = {
  id: string;
  department_id: string;
  hospital_id?: string;
  doctor_id?: string | null;
  source_question_id?: string | null;
  scope?: "TEMPLATE" | "DOCTOR";
  text: string;
  type?: "TEXT" | "TEXTAREA" | "NUMBER" | "SELECT" | "RADIO" | "CHECKBOX" | "DATE";
  answer_mode?: "YES_NO" | "FREE_TEXT";
  order: number;
  created_at?: string;
  departments?: {
    id: string;
    name: string;
  };
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
    dto.doctorUrl,
    dto.doctor_url,
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
  const resolvedName = dto.full_name?.trim() || dto.specialization?.trim() || `Doctor ${dto.id.slice(0, 6)}`;
  return {
    id: dto.id,
    name: resolvedName,
    specialty: dto.specialization,
    phone: dto.phone_number ?? "",
    email: "",
    avatar: dto.avatar ?? dto.avatar_url ?? dto.refresh_token ?? "",
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
    return await apiRequest<DoctorPatientDto[]>("/api/doctors/me/patients");
  } catch {
    return [];
  }
}

export async function getDoctorQuestions(): Promise<DoctorQuestionDto[]> {
  try {
    const [questions, departments] = await Promise.all([
      apiRequest<BackendQuestionDto[]>("/api/questions/doctor"),
      apiRequest<BackendDepartmentDto[]>("/api/departments"),
    ]);
    const departmentMap = new Map(departments.map((d) => [d.id, d.name]));
    return questions.map((question) => {
      const categoryName = question.departments?.name ?? departmentMap.get(question.department_id) ?? "General";
      return {
        id: question.id,
        text: question.text,
        category: categoryName,
        categoryId: question.department_id,
        type: question.type,
        scope: question.scope,
        answerMode: question.answer_mode,
        status: "active",
        isCustom: true,
        doctorId: "",
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
    const [templates, departments] = await Promise.all([
      apiRequest<BackendQuestionDto[]>("/api/questions/templates"),
      apiRequest<BackendDepartmentDto[]>("/api/departments"),
    ]);
    const departmentMap = new Map(departments.map((d) => [d.id, d]));
    return templates.map((template) => ({
      id: template.id,
      text: template.text,
      category: departmentMap.get(template.department_id)?.name ?? template.departments?.name ?? "General",
      categoryId: template.department_id,
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
  void input.title;
  void input.departmentId;
  const createdQuestion = await apiRequest<BackendQuestionDto>("/api/questions/doctor", {
    method: "POST",
    body: JSON.stringify({
      text: input.text.trim(),
      answer_mode: input.answerMode === "text" ? "FREE_TEXT" : "YES_NO",
    }),
  });
  const departments = await apiRequest<BackendDepartmentDto[]>("/api/departments");
  const selectedDepartment = departments.find((department) => department.id === createdQuestion.department_id);

  return {
    id: createdQuestion.id,
    text: createdQuestion.text ?? input.text.trim(),
    category: selectedDepartment?.name ?? createdQuestion.departments?.name ?? "General",
    categoryId: createdQuestion.department_id,
    type: createdQuestion.type,
    scope: createdQuestion.scope,
    answerMode: createdQuestion.answer_mode,
    status: "active",
    isCustom: true,
    doctorId: "",
    createdAt: createdQuestion.created_at ?? new Date().toISOString().split("T")[0],
  };
}

export async function updateDoctorQuestion(id: string, text: string): Promise<DoctorQuestionDto> {
  const updated = await apiRequest<BackendQuestionDto>(`/api/questions/doctor/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ text: text.trim() }),
  });
  return {
    id: updated.id,
    text: updated.text ?? text.trim(),
    category: "General",
    categoryId: updated.department_id ?? "",
    type: updated.type,
    scope: updated.scope,
    answerMode: updated.answer_mode,
    status: "active",
    isCustom: true,
    doctorId: "",
    createdAt: updated.created_at ?? new Date().toISOString().split("T")[0],
  };
}

export async function deleteDoctorQuestion(id: string): Promise<void> {
  await apiRequest<null>(`/api/questions/doctor/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function updateDoctorAvatar(avatarUrl: string): Promise<string> {
  const updated = await apiRequest<{ avatar?: string }>("/api/doctors/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar_url: avatarUrl }),
  });
  return updated.avatar ?? avatarUrl;
}
