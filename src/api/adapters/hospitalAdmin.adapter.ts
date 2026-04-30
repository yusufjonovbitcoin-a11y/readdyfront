import { apiRequest } from "@/api/client";
import type {
  HACategoryDto,
  HAPatientDto,
  HAQuestionDto,
  HAQuestionTemplateDto,
} from "@/api/types/hospitalAdmin.types";
import type { DoctorDto } from "@/api/types/doctor.types";
type BackendDoctorDto = {
  id: string;
  user_id?: string;
  phone_number?: string;
  full_name?: string | null;
  specialization: string;
  hospital_id: string;
  department_id?: string;
  doctorUrl?: string;
  avatar?: string | null;
  avatar_url?: string | null;
  refresh_token?: string | null;
  created_at?: string;
};

type BackendPatientDto = {
  id: string;
  phone_number: string;
  hospital_id: string;
  created_at?: string;
};

type BackendDepartmentDto = {
  id: string;
  name: string;
  hospital_id: string;
  hospital?: {
    name?: string;
  } | null;
};

type BackendQuestionDto = {
  id: string;
  department_id: string;
  hospital_id?: string;
  doctor_id?: string | null;
  source_question_id?: string | null;
  scope?: "TEMPLATE" | "DOCTOR";
  answer_mode?: "YES_NO" | "FREE_TEXT";
  text: string;
  type?: "TEXT" | "TEXTAREA" | "NUMBER" | "SELECT" | "RADIO" | "CHECKBOX" | "DATE";
  is_required?: boolean;
  order: number;
  created_at?: string;
  departments?: {
    id: string;
    name: string;
  };
};

type CreateDoctorInput = {
  name: string;
  specialty: string;
  phone: string;
  password: string;
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
  const dtoWithExtra = dto as BackendDoctorDto & Record<string, unknown>;
  const knownCandidates = [
    dtoWithExtra.doctorUrl,
    dtoWithExtra.doctor_url,
    dtoWithExtra.checkin_url,
    dtoWithExtra.checkinUrl,
    dtoWithExtra.queue_url,
    dtoWithExtra.queueUrl,
    dtoWithExtra.registration_url,
    dtoWithExtra.registrationUrl,
    dtoWithExtra.link,
    dtoWithExtra.url,
  ];

  for (const candidate of knownCandidates) {
    if (typeof candidate === "string" && isCheckinPathLike(candidate)) {
      return normalizeUrlLike(candidate);
    }
  }

  for (const value of Object.values(dtoWithExtra)) {
    if (typeof value === "string" && isCheckinPathLike(value)) {
      return normalizeUrlLike(value);
    }
  }

  return `/checkin?doctor_id=${encodeURIComponent(dto.id)}`;
}

function normalizeDoctor(dto: BackendDoctorDto): DoctorDto {
  return {
    id: dto.id,
    name: dto.full_name?.trim() || `Doctor ${dto.id.slice(0, 6)}`,
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

function normalizePatient(dto: BackendPatientDto): HAPatientDto {
  return {
    id: dto.id,
    name: `Patient ${dto.id.slice(0, 6)}`,
    phone: dto.phone_number,
    age: 0,
    gender: "male",
    doctorId: "",
    doctorName: "",
    lastVisit: dto.created_at ?? new Date().toISOString(),
    nextVisit: null,
    diagnosis: "",
    status: "scheduled",
    hospitalId: dto.hospital_id,
    visitCount: 0,
  };
}

export const hospitalAdminAdapter = {
  getDoctors: async (): Promise<DoctorDto[]> => {
    const doctors = await apiRequest<BackendDoctorDto[]>("/api/doctors");
    return doctors.map(normalizeDoctor);
  },
  getPatients: async (): Promise<HAPatientDto[]> => {
    const patients = await apiRequest<BackendPatientDto[]>("/api/potients");
    return patients.map(normalizePatient);
  },
  getCategories: async (): Promise<HACategoryDto[]> => {
    const departments = await apiRequest<BackendDepartmentDto[]>("/api/departments");
    return departments.map((department) => ({
      id: department.id,
      name: department.name,
    }));
  },
  getCategoryById: async (id: string): Promise<HACategoryDto | null> => {
    const department = await apiRequest<BackendDepartmentDto | null>(`/api/departments/${encodeURIComponent(id)}`);
    if (!department) return null;
    return {
      id: department.id,
      name: department.name,
    };
  },
  getQuestionTemplates: async (): Promise<HAQuestionTemplateDto[]> => {
    const [templateQuestions, departments] = await Promise.all([
      apiRequest<BackendQuestionDto[]>("/api/questions/templates"),
      apiRequest<BackendDepartmentDto[]>("/api/departments"),
    ]);
    return departments.map((department) => {
      const questionCount = templateQuestions.filter((question) => question.department_id === department.id).length;
      return {
        id: department.id,
        title: department.name,
        categoryId: department.id,
        categoryName: department.name,
        questionCount,
        createdAt: new Date().toISOString(),
      };
    });
  },
  getQuestionTemplateById: async (id: string): Promise<HAQuestionTemplateDto | null> => {
    const [department, templateQuestions] = await Promise.all([
      apiRequest<BackendDepartmentDto | null>(`/api/departments/${encodeURIComponent(id)}`),
      apiRequest<BackendQuestionDto[]>(`/api/questions/templates?department_id=${encodeURIComponent(id)}`),
    ]);
    if (!department) return null;
    return {
      id: department.id,
      title: department.name,
      categoryId: department.id,
      categoryName: department.name,
      questionCount: templateQuestions.length,
      createdAt: new Date().toISOString(),
    };
  },
  getQuestions: async (): Promise<HAQuestionDto[]> => {
    const questions = await apiRequest<BackendQuestionDto[]>("/api/questions/templates");
    return questions.map((question) => ({
      id: question.id,
      text: question.text ?? "",
      templateId: question.department_id,
      order: question.order ?? 1,
      type: question.type,
      scope: question.scope,
      answerMode: question.answer_mode,
      isRequired: question.is_required,
    }));
  },
  createDoctor: async (input: CreateDoctorInput): Promise<DoctorDto> => {
    const departments = await apiRequest<BackendDepartmentDto[]>("/api/departments");
    const normalizedSpecialty = input.specialty.trim().toLowerCase();
    const matchedDepartment = departments.find((department) => department.name.trim().toLowerCase() === normalizedSpecialty);
    const fallbackDepartment = matchedDepartment ?? departments[0];
    if (!fallbackDepartment) {
      throw {
        status: 400,
        message: "Doctor yaratish uchun avval department kerak.",
        data: { specialty: input.specialty },
      };
    }

    const createdUser = await apiRequest<{ id: string; phone_number: string }>("/api/users", {
      method: "POST",
      body: JSON.stringify({
        phone_number: input.phone,
        password: input.password,
        role: "doctor",
      }),
    });

    const created = await apiRequest<BackendDoctorDto>("/api/doctors", {
      method: "POST",
      body: JSON.stringify({
        user_id: createdUser.id,
        full_name: input.name,
        hospital_id: fallbackDepartment.hospital_id,
        department_id: fallbackDepartment.id,
        specialization: input.specialty,
      }),
    });

    const normalized = normalizeDoctor(created);
    return {
      ...normalized,
      name: input.name || normalized.name,
      specialty: input.specialty || normalized.specialty,
      phone: input.phone || normalized.phone,
    };
  },
  createPatient: async (
    input: Omit<HAPatientDto, "id" | "doctorName" | "lastVisit" | "hospitalId" | "visitCount" | "dischargeRecord">,
  ): Promise<HAPatientDto> => {
    const payload = await apiRequest<BackendPatientDto>("/api/potients", {
      method: "POST",
      body: JSON.stringify({
        phone_number: input.phone,
        hospital_id: "3b1f208a-f0bb-4641-b3f9-b91cafdb794d",
      }),
    });
    return normalizePatient(payload);
  },
  updatePatient: async (id: string, input: Partial<HAPatientDto>): Promise<HAPatientDto> => {
    const payload = await apiRequest<BackendPatientDto>(`/api/potients/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        phone_number: input.phone,
        hospital_id: input.hospitalId,
      }),
    });
    return normalizePatient(payload);
  },
  deletePatient: async (id: string): Promise<void> => {
    await apiRequest<null>(`/api/potients/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
  createCategory: async (input: Pick<HACategoryDto, "name">): Promise<HACategoryDto> => {
    const created = await apiRequest<BackendDepartmentDto>("/api/departments", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
      }),
    });
    return { id: created.id, name: created.name };
  },
  updateCategory: async (id: string, input: Pick<HACategoryDto, "name">): Promise<HACategoryDto> => {
    const updated = await apiRequest<BackendDepartmentDto>(`/api/departments/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ name: input.name }),
    });
    return { id: updated.id, name: updated.name };
  },
  deleteCategory: async (id: string): Promise<void> => {
    await apiRequest<null>(`/api/departments/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
  createTemplate: async (
    input: Pick<HAQuestionTemplateDto, "title" | "categoryId">,
  ): Promise<HAQuestionTemplateDto> => {
    const department = await apiRequest<BackendDepartmentDto>(
      `/api/departments/${encodeURIComponent(input.categoryId)}`,
    );
    // Templates are department-backed in current backend model.
    return {
      id: department.id,
      title: department.name,
      categoryId: department.id,
      categoryName: department.name,
      questionCount: 0,
      createdAt: new Date().toISOString(),
    };
  },
  updateTemplate: async (
    id: string,
    input: Pick<HAQuestionTemplateDto, "title" | "categoryId">,
  ): Promise<HAQuestionTemplateDto> => {
    const updated = await apiRequest<BackendDepartmentDto>(`/api/departments/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: input.title,
      }),
    });
    return {
      id: updated.id,
      title: updated.name,
      categoryId: updated.id,
      categoryName: updated.name,
      questionCount: 0,
      createdAt: new Date().toISOString(),
    };
  },
  deleteTemplate: async (id: string): Promise<void> => {
    await apiRequest<null>(`/api/departments/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
  createQuestion: async (
    input: Pick<HAQuestionDto, "text" | "templateId" | "order"> & { type?: "SELECT" | "TEXT"; isRequired?: boolean },
  ): Promise<HAQuestionDto> => {
    const created = await apiRequest<BackendQuestionDto>("/api/questions", {
      method: "POST",
      body: JSON.stringify({
        department_id: input.templateId,
        text: input.text,
        answer_mode: (input.type ?? "SELECT") === "TEXT" ? "FREE_TEXT" : "YES_NO",
        is_required: input.isRequired ?? true,
        order: input.order,
      }),
    });
    return {
      id: created.id,
      text: created.text ?? input.text,
      templateId: created.department_id ?? input.templateId,
      order: created.order ?? input.order,
      type: created.type ?? input.type ?? "SELECT",
      scope: created.scope ?? "TEMPLATE",
      answerMode: created.answer_mode ?? ((created.type ?? input.type ?? "SELECT") === "TEXT" ? "FREE_TEXT" : "YES_NO"),
      isRequired: created.is_required ?? input.isRequired ?? true,
    };
  },
  updateQuestion: async (
    id: string,
    input: Pick<HAQuestionDto, "text"> & { type?: "SELECT" | "TEXT"; isRequired?: boolean },
  ): Promise<HAQuestionDto> => {
    const updated = await apiRequest<BackendQuestionDto>(`/api/questions/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        text: input.text,
        ...(input.type ? { answer_mode: input.type === "TEXT" ? "FREE_TEXT" : "YES_NO" } : {}),
        ...(typeof input.isRequired === "boolean" ? { is_required: input.isRequired } : {}),
      }),
    });
    return {
      id: updated.id,
      text: updated.text ?? input.text,
      templateId: updated.department_id,
      order: updated.order ?? 1,
      type: updated.type ?? input.type,
      scope: updated.scope,
      answerMode: updated.answer_mode ?? (updated.type === "TEXT" ? "FREE_TEXT" : "YES_NO"),
      isRequired: updated.is_required ?? input.isRequired,
    };
  },
  deleteQuestion: async (id: string): Promise<void> => {
    await apiRequest<null>(`/api/questions/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
  getDoctorById: async (id: string): Promise<DoctorDto> => {
    const doctor = await apiRequest<BackendDoctorDto>(`/api/doctors/${encodeURIComponent(id)}`);
    return normalizeDoctor(doctor);
  },
};
