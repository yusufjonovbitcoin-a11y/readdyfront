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
  specialization?: string;
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
  department?: {
    name?: string;
  } | null;
  department_id?: string;
  hospital?: {
    name?: string;
  } | null;
  users?: { phone_number?: string | null } | null;
  todayPatients?: number;
  today_patients?: number;
  totalPatients?: number;
  total_patients?: number;
  weeklyAvgPatients?: number;
  weekly_avg_patients?: number;
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

function pickNonNegativeNumber(...candidates: unknown[]): number {
  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c) && c >= 0) return c;
    if (typeof c === "string" && c.trim() !== "" && !Number.isNaN(Number(c))) {
      const n = Number(c);
      if (Number.isFinite(n) && n >= 0) return n;
    }
  }
  return 0;
}

function normalizeDoctor(dto: BackendDoctorDto): DoctorDto {
  const departmentName =
    (dto.department && typeof dto.department.name === "string" ? dto.department.name.trim() : "") || "";
  const hospitalName =
    (dto.hospital && typeof dto.hospital.name === "string" ? dto.hospital.name.trim() : "") || "";
  const departmentId =
    typeof dto.department_id === "string" && dto.department_id.trim() ? dto.department_id.trim() : undefined;
  const nestedUser =
    dto.users && typeof dto.users === "object" && !Array.isArray(dto.users)
      ? (dto.users as { phone_number?: string | null })
      : null;
  const phoneRaw =
    (typeof dto.phone_number === "string" && dto.phone_number.trim() ? dto.phone_number.trim() : "") ||
    (typeof nestedUser?.phone_number === "string" && nestedUser.phone_number.trim()
      ? nestedUser.phone_number.trim()
      : "");
  return {
    id: dto.id,
    name: dto.full_name?.trim() ?? "",
    departmentName,
    departmentId,
    hospitalName,
    specialty: (dto.specialization ?? "").toString().trim(),
    phone: phoneRaw,
    email: "",
    avatar: dto.avatar ?? dto.avatar_url ?? dto.refresh_token ?? "",
    todayPatients: pickNonNegativeNumber(dto.todayPatients, dto.today_patients),
    totalPatients: pickNonNegativeNumber(dto.totalPatients, dto.total_patients),
    weeklyAvgPatients: pickNonNegativeNumber(dto.weeklyAvgPatients, dto.weekly_avg_patients),
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

/** Joriy shifokor (JWT `user_id`) — profil sahifasi uchun. */
export async function getMyDoctorProfile(): Promise<DoctorDto | null> {
  try {
    const doctor = await apiRequest<BackendDoctorDto>("/api/doctors/me");
    return doctor ? normalizeDoctor(doctor) : null;
  } catch {
    return null;
  }
}

export async function updateDoctorStatus(id: string, input: UpdateDoctorStatusInput): Promise<DoctorDto | null> {
  const updated = await apiRequest<BackendDoctorDto | null>(`/api/doctors/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return updated ? normalizeDoctor(updated) : null;
}

export async function deleteDoctor(id: string): Promise<void> {
  await apiRequest<null>(`/api/doctors/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getDoctorPatients(): Promise<DoctorPatientDto[]> {
  try {
    return await apiRequest<DoctorPatientDto[]>("/api/doctors/me/patients");
  } catch {
    return [];
  }
}

export async function getDoctorPatientsByDoctorId(doctorId: string): Promise<DoctorPatientDto[]> {
  try {
    return await apiRequest<DoctorPatientDto[]>(
      `/api/doctors/${encodeURIComponent(doctorId)}/patients`,
    );
  } catch {
    return [];
  }
}

export async function getDoctorPatientById(
  responseId: string,
): Promise<DoctorPatientDto | null> {
  try {
    return await apiRequest<DoctorPatientDto>(
      `/api/doctors/me/patients/${encodeURIComponent(responseId)}`,
    );
  } catch {
    return null;
  }
}

export async function updateDoctorPatientWorkflow(
  responseId: string,
  input: {
    status: "queue" | "in_progress" | "completed" | "history";
    diagnosis?: string;
    notes?: string;
    consultationDuration?: number;
  },
): Promise<DoctorPatientDto> {
  return apiRequest<DoctorPatientDto>(`/api/doctors/me/patients/${encodeURIComponent(responseId)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
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
    return await apiRequest<DoctorAnalyticsDto[]>("/api/doctors/me/analytics");
  } catch {
    return [];
  }
}

export async function getDoctorAnalyticsByDoctorId(doctorId: string): Promise<DoctorAnalyticsDto[]> {
  try {
    return await apiRequest<DoctorAnalyticsDto[]>(
      `/api/doctors/${encodeURIComponent(doctorId)}/analytics`,
    );
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
