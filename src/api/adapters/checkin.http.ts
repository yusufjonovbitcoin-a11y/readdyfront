import { apiRequest } from "@/api/client";
import type { TFunction } from "i18next";
import type {
  CheckinDraft,
  CheckinQuestionDto,
  SubmitCheckinInput,
  SubmitCheckinResult,
} from "@/api/types/checkin.types";

type BackendQuestionDto = {
  id: string;
  questionnaire_id: string;
  question_text: string;
};

export async function getQuestions(_t?: TFunction<"checkin">): Promise<CheckinQuestionDto[]> {
  try {
    return await apiRequest<CheckinQuestionDto[]>("/api/checkin/questions");
  } catch {
    const questions = await apiRequest<BackendQuestionDto[]>("/api/questions");
    return questions.map((question) => ({
      id: question.id,
      text: question.question_text,
      type: "single",
      options: ["yes", "no"],
      required: true,
    }));
  }
}

export async function getDraft(phone: string): Promise<CheckinDraft | null> {
  return apiRequest<CheckinDraft | null>(`/api/checkin/drafts/${encodeURIComponent(phone)}`);
}

export async function saveDraft(draft: CheckinDraft): Promise<CheckinDraft> {
  return apiRequest<CheckinDraft>("/api/checkin/drafts", {
    method: "PUT",
    body: JSON.stringify(draft),
  });
}

export async function clearDraft(phone: string): Promise<void> {
  await apiRequest<null>(`/api/checkin/drafts/${encodeURIComponent(phone)}`, {
    method: "DELETE",
  });
}

export async function submitCheckin(input: SubmitCheckinInput): Promise<SubmitCheckinResult> {
  try {
    return await apiRequest<SubmitCheckinResult>("/api/checkin/submissions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch {
    return {
      checkinId: `local-${Date.now()}`,
      acceptedAt: new Date().toISOString(),
    };
  }
}
