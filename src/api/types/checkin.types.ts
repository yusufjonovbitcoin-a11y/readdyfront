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
  answers: Record<string, string | string[]>;
}

export interface SubmitCheckinResult {
  checkinId: string;
  acceptedAt: string;
}
