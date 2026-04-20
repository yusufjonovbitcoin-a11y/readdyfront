import type { CheckinQuestion } from "@/mocks/checkin_questions";

export type CheckinQuestionDto = CheckinQuestion;

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
