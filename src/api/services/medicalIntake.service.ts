import { apiRequest } from "@/api/client";

export type RiskLevel = "low" | "medium" | "high" | "urgent";
export type ClinicalFieldType = "boolean" | "text" | "number" | "date" | "enum" | "multi_enum";
export type IntakeSessionStatus = "collecting" | "enough_data" | "urgent" | "completed" | "cancelled";
export type RedFlagAction = "continue_flow" | "warn_doctor" | "urgent_stop";
export type QuestionType = "TEXT" | "TEXTAREA" | "NUMBER" | "SELECT" | "RADIO" | "CHECKBOX" | "DATE";
export type QuestionAnswerMode = "YES_NO" | "FREE_TEXT";

export interface DepartmentDto {
  id: string;
  name: string;
  hospital_id?: string | null;
  ai_system_prompt?: string | null;
  questionnaires?: QuestionnaireDto[];
}

export interface ClinicalFieldDto {
  id: string;
  key: string;
  label: string;
  type: ClinicalFieldType;
  category: string;
  description?: string | null;
  unit?: string | null;
  enum_values?: unknown;
}

export interface QuestionnaireDto {
  id: string;
  department_id: string;
  hospital_id?: string | null;
  key: string;
  name: string;
  description?: string | null;
  priority: number;
  is_active: boolean;
  ai_prompt?: string | null;
  min_required_fields?: number | null;
  created_at?: string;
  updated_at?: string;
  _count?: { questions?: number; question_rules?: number };
  questions?: QuestionDto[];
  question_rules?: QuestionRuleDto[];
  red_flags?: RedFlagRuleDto[];
}

export interface QuestionOptionDto {
  id?: string;
  text: string;
  value: string;
  order?: number;
}

export interface QuestionDto {
  id: string;
  department_id: string;
  hospital_id?: string;
  questionnaire_id?: string | null;
  clinical_field_id?: string | null;
  key?: string | null;
  text: string;
  helper_text?: string | null;
  type?: QuestionType;
  answer_mode?: QuestionAnswerMode;
  is_required?: boolean;
  order: number;
  priority?: number;
  clinical_field?: ClinicalFieldDto | null;
  question_options?: QuestionOptionDto[];
  rules?: QuestionRuleDto[];
  allow_custom_input?: boolean;
  custom_placeholder?: string;
}

export interface QuestionRuleDto {
  id: string;
  questionnaire_id: string;
  question_id: string;
  clinical_field_id: string;
  priority: number;
  is_required: boolean;
  is_red_flag: boolean;
  show_if?: unknown;
  skip_if?: unknown;
  stop_if?: unknown;
  question?: QuestionDto;
  clinical_field?: ClinicalFieldDto;
}

export interface RedFlagRuleDto {
  id: string;
  department_id?: string | null;
  questionnaire_id?: string | null;
  field_key: string;
  operator: string;
  value: unknown;
  risk_level: RiskLevel;
  message: string;
  action: RedFlagAction;
}

export interface DoctorDashboardJson {
  bir_qatorlik_xulosa: string;
  eslatma: string;
  asosiy_shikoyat: { matn: string; soha: string; questionnaire: string };
  vaqt_jadvali: { davomiyligi: unknown; boshlangani: string; dinamika: string };
  ogirlik_lokalizatsiya: { ogirlik_bali: unknown; manba: string; tomon: string; tafsilot: unknown };
  bor_simptomlar: string[];
  xavfli_belgilar: string[];
  dorilar: { qabul_qilgan: string };
  allergiya: { bormi: string };
  surunkali_kasalliklar: { bormi: string };
  oldingi_tarix: { avval_bolgan: string };
  jarohat_yot_jism: { mavjud: string };
  yetishmayotgan_malumotlar: string[];
  tavsiya_etiladigan_savollar: string[];
  shifokor_uchun_ai_xulosa: string;
  malumot_sifati: { score: number; level: "low" | "medium" | "high" };
  xavf: { level: RiskLevel; sababi: string };
}

export async function getDepartments(): Promise<DepartmentDto[]> {
  return apiRequest<DepartmentDto[]>("/api/departments");
}

export async function createDepartment(input: { name: string; hospital_id?: string | null }): Promise<DepartmentDto> {
  return apiRequest<DepartmentDto>("/api/departments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateDepartment(id: string, input: Partial<DepartmentDto>): Promise<DepartmentDto> {
  return apiRequest<DepartmentDto>(`/api/departments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** Super admin: bo‘lim AI system prompti (faqat SUPER_ADMIN). */
export async function updateDepartmentAiSystemPrompt(
  id: string,
  ai_system_prompt: string | null,
): Promise<DepartmentDto> {
  return apiRequest<DepartmentDto>(
    `/api/departments/${encodeURIComponent(id)}/ai-system-prompt`,
    {
      method: "PATCH",
      body: JSON.stringify({ ai_system_prompt }),
    },
  );
}

export async function deleteDepartment(id: string): Promise<void> {
  await apiRequest<null>(`/api/departments/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getQuestionnaires(departmentId: string): Promise<QuestionnaireDto[]> {
  return apiRequest<QuestionnaireDto[]>(`/api/departments/${encodeURIComponent(departmentId)}/questionnaires`);
}

export async function createQuestionnaire(departmentId: string, input: {
  key: string;
  name: string;
  description?: string;
  priority?: number;
  is_active?: boolean;
  ai_prompt?: string;
  min_required_fields?: number;
}): Promise<QuestionnaireDto> {
  return apiRequest<QuestionnaireDto>(`/api/departments/${encodeURIComponent(departmentId)}/questionnaires`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateQuestionnaire(id: string, input: Partial<QuestionnaireDto>): Promise<QuestionnaireDto> {
  return apiRequest<QuestionnaireDto>(`/api/questionnaires/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteQuestionnaire(id: string): Promise<void> {
  await apiRequest<null>(`/api/questionnaires/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getQuestionnaire(id: string): Promise<QuestionnaireDto> {
  return apiRequest<QuestionnaireDto>(`/api/questionnaires/${encodeURIComponent(id)}`);
}

export async function getClinicalFields(): Promise<ClinicalFieldDto[]> {
  return apiRequest<ClinicalFieldDto[]>("/api/clinical-fields");
}

export async function createClinicalField(input: Omit<ClinicalFieldDto, "id">): Promise<ClinicalFieldDto> {
  return apiRequest<ClinicalFieldDto>("/api/clinical-fields", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateClinicalField(id: string, input: Partial<ClinicalFieldDto>): Promise<ClinicalFieldDto> {
  return apiRequest<ClinicalFieldDto>(`/api/clinical-fields/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function getQuestions(questionnaireId: string): Promise<QuestionDto[]> {
  return apiRequest<QuestionDto[]>(`/api/questionnaires/${encodeURIComponent(questionnaireId)}/questions`);
}

export async function createQuestion(questionnaireId: string, input: {
  text: string;
  key?: string;
  helper_text?: string;
  type?: QuestionType;
  answer_mode?: QuestionAnswerMode;
  clinical_field_id?: string;
  is_required?: boolean;
  priority?: number;
  order?: number;
  options?: QuestionOptionDto[];
}): Promise<QuestionDto> {
  return apiRequest<QuestionDto>(`/api/questionnaires/${encodeURIComponent(questionnaireId)}/questions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateQuestion(id: string, input: Partial<QuestionDto>): Promise<QuestionDto> {
  return apiRequest<QuestionDto>(`/api/questions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteQuestion(id: string): Promise<void> {
  await apiRequest<null>(`/api/questions/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getQuestionRules(questionnaireId: string): Promise<QuestionRuleDto[]> {
  return apiRequest<QuestionRuleDto[]>(`/api/questionnaires/${encodeURIComponent(questionnaireId)}/rules`);
}

export async function createQuestionRule(questionnaireId: string, input: {
  question_id: string;
  clinical_field_id: string;
  priority?: number;
  is_required?: boolean;
  is_red_flag?: boolean;
  show_if?: unknown;
  skip_if?: unknown;
  stop_if?: unknown;
}): Promise<QuestionRuleDto> {
  return apiRequest<QuestionRuleDto>(`/api/questionnaires/${encodeURIComponent(questionnaireId)}/rules`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateQuestionRule(id: string, input: Partial<QuestionRuleDto>): Promise<QuestionRuleDto> {
  return apiRequest<QuestionRuleDto>(`/api/question-rules/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteQuestionRule(id: string): Promise<void> {
  await apiRequest<null>(`/api/question-rules/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getAiIntakeDashboard(sessionId: string): Promise<DoctorDashboardJson> {
  return apiRequest<DoctorDashboardJson>(`/api/ai-intake/${encodeURIComponent(sessionId)}/dashboard`);
}

/** Public check-in structured intake (QuestionRules → Question.text). */
export interface AiIntakeStartResponse {
  session_id: string;
  assistant_reply: string;
  intake_state?: Record<string, unknown>;
  next_question?: QuestionDto | null;
}

export interface AiIntakeMessageResponse {
  assistant_reply: string;
  intake_state?: Record<string, unknown>;
  new_facts?: Record<string, unknown>;
  intake_complete?: boolean;
  next_question?: QuestionDto | null;
}

export async function postAiIntakeStart(input: {
  session_id: string;
  doctor_id: string;
  checkin_token: string;
}): Promise<AiIntakeStartResponse> {
  return apiRequest<AiIntakeStartResponse>("/api/ai-intake/start", {
    method: "POST",
    body: JSON.stringify(input),
    timeoutMs: 20_000,
  });
}

export async function postAiIntakeMessage(input: {
  session_id: string;
  message: string;
  language?: string;
  doctor_id: string;
  checkin_token: string;
}): Promise<AiIntakeMessageResponse> {
  return apiRequest<AiIntakeMessageResponse>("/api/ai-intake/message", {
    method: "POST",
    body: JSON.stringify(input),
    timeoutMs: 60_000,
  });
}
