export interface CheckinQuestionDto {
  id: string;
  text: string;
  type: "single" | "multi" | "text" | "bodymap" | "yes_no" | "select" | "body_map";
  options?: Array<string | { value: string; label: string }>;
  category?: string;
  required?: boolean;
  conditionalOn?: {
    questionId: string;
    answer: string;
  };
}

export interface CheckinDraft {
  phone: string;
  doctorId: string;
  answers: Record<string, string | string[]>;
  currentStep: number;
  currentQuestionId?: string | null;
  answersCount: number;
  updatedAt: string;
}

export interface SubmitCheckinInput {
  phone: string;
  doctorId: string;
  checkinToken?: string;
  answers: Record<string, string | string[]>;
  aiSummary?: string;
}

export interface SubmitCheckinResult {
  checkinId: string;
  acceptedAt: string;
  status?: "queue" | "busy" | "info";
  queueNumber?: number;
  waitMinutes?: number;
}

export interface CheckinAiPreviewInput {
  doctorId: string;
  checkinToken?: string;
  message?: string;
  answers: Record<string, string | string[]>;
  /** Bemor tanlagan check-in tili (masalan: uz, ru) */
  patientLanguage?: string;
  /** Shifokor tomonga chiqadigan tahlil tili */
  doctorLanguage?: string;
  /** Brauzer sessiyasi UUID; yuborishdan keyin ixtiyoriy ravishda checkinId bilan almashtirish mumkin */
  visitId?: string;
}

export interface CheckinFollowUpOptionDto {
  id: number;
  text: string;
}

export interface CheckinFollowUpPollDto {
  question: string;
  options: CheckinFollowUpOptionDto[];
}

/** Backend AI JSON: strukturalangan bir tanlov (kartada value/label). */
export interface CheckinInteractiveQuestionDto {
  type: "question";
  message: string;
  inputType: "single_choice";
  options: Array<{ value: string; label: string }>;
  allowCustomAnswer?: boolean;
  customPlaceholder?: string;
}

export interface CheckinAiPreviewResult {
  ai_analysis: string;
  question_ui?: CheckinInteractiveQuestionDto | null;
  follow_up_poll?: CheckinFollowUpPollDto | null;
}

export interface CreateCheckinTelegramLinkInput {
  checkinId: string;
  doctorId: string;
  phone: string;
}

export interface CreateCheckinTelegramLinkResult {
  url: string;
}

export interface CheckinDoctorProfileDto {
  id: string;
  full_name: string;
  avatar: string;
  department_name: string;
  specialization: string;
  checkin_token?: string;
}
