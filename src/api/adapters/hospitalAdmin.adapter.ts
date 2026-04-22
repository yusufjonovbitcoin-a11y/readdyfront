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
  phone_number: string;
  specialization: string;
  hospital_id: string;
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
  question_text: string;
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
  getQuestionTemplates: async (): Promise<HAQuestionTemplateDto[]> => {
    const [questionnaires, departments, questions] = await Promise.all([
      apiRequest<BackendQuestionnaireDto[]>("/api/questionnaires"),
      apiRequest<BackendDepartmentDto[]>("/api/departments"),
      apiRequest<BackendQuestionDto[]>("/api/questions"),
    ]);
    return questionnaires.map((questionnaire) => {
      const category = departments.find((department) => department.id === questionnaire.department_id);
      const questionCount = questions.filter((question) => question.questionnaire_id === questionnaire.id).length;
      return {
        id: questionnaire.id,
        title: questionnaire.title,
        categoryId: questionnaire.department_id,
        categoryName: category?.name ?? "Uncategorized",
        questionCount,
        createdAt: questionnaire.created_at ?? new Date().toISOString(),
      };
    });
  },
  getQuestions: async (): Promise<HAQuestionDto[]> => {
    const questions = await apiRequest<BackendQuestionDto[]>("/api/questions");
    return questions.map((question, index) => ({
      id: question.id,
      text: question.question_text,
      templateId: question.questionnaire_id,
      order: index + 1,
    }));
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
        hospital_id: "3b1f208a-f0bb-4641-b3f9-b91cafdb794d",
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
    const created = await apiRequest<BackendQuestionnaireDto>("/api/questionnaires", {
      method: "POST",
      body: JSON.stringify({
        hospital_id: "3b1f208a-f0bb-4641-b3f9-b91cafdb794d",
        department_id: input.categoryId,
        title: input.title,
        is_active: true,
      }),
    });
    return {
      id: created.id,
      title: created.title,
      categoryId: created.department_id,
      categoryName: "",
      questionCount: 0,
      createdAt: created.created_at ?? new Date().toISOString(),
    };
  },
  updateTemplate: async (
    id: string,
    input: Pick<HAQuestionTemplateDto, "title" | "categoryId">,
  ): Promise<HAQuestionTemplateDto> => {
    const updated = await apiRequest<BackendQuestionnaireDto>(`/api/questionnaires/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        department_id: input.categoryId,
        title: input.title,
      }),
    });
    return {
      id: updated.id,
      title: updated.title,
      categoryId: updated.department_id,
      categoryName: "",
      questionCount: 0,
      createdAt: updated.created_at ?? new Date().toISOString(),
    };
  },
  deleteTemplate: async (id: string): Promise<void> => {
    await apiRequest<null>(`/api/questionnaires/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
  createQuestion: async (input: Pick<HAQuestionDto, "text" | "templateId" | "order">): Promise<HAQuestionDto> => {
    const created = await apiRequest<BackendQuestionDto>("/api/questions", {
      method: "POST",
      body: JSON.stringify({
        questionnaire_id: input.templateId,
        question_text: input.text,
      }),
    });
    return {
      id: created.id,
      text: created.question_text,
      templateId: created.questionnaire_id,
      order: input.order,
    };
  },
  updateQuestion: async (id: string, input: Pick<HAQuestionDto, "text">): Promise<HAQuestionDto> => {
    const updated = await apiRequest<BackendQuestionDto>(`/api/questions/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        question_text: input.text,
      }),
    });
    return {
      id: updated.id,
      text: updated.question_text,
      templateId: updated.questionnaire_id,
      order: 1,
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
