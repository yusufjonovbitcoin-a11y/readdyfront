export interface CheckinQuestionDto {
  id: string;
  text: string;
  type: "single" | "multi" | "text" | "bodymap";
  options?: string[];
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
