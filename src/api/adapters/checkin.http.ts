import { apiRequest } from "@/api/client";
import type { TFunction } from "i18next";
import type {
  CheckinAiPreviewInput,
  CheckinAiPreviewResult,
  CheckinDoctorProfileDto,
  CreateCheckinTelegramLinkInput,
  CreateCheckinTelegramLinkResult,
  CheckinDraft,
  CheckinQuestionDto,
  CheckinSessionStartInput,
  CheckinSessionStartResult,
  SubmitCheckinInput,
  SubmitCheckinResult,
} from "@/api/types/checkin.types";

type BackendQuestionDto = {
  id: string;
  questionnaire_id: string;
  question_text: string;
};

export async function getQuestions(doctorId: string, _t?: TFunction<"checkin">): Promise<CheckinQuestionDto[]> {
  try {
    return await apiRequest<CheckinQuestionDto[]>(`/api/checkin/questions/${encodeURIComponent(doctorId)}`);
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
  try {
    return await apiRequest<CheckinDraft | null>(`/api/checkin/drafts/${encodeURIComponent(phone)}`);
  } catch {
    return null;
  }
}

export async function saveDraft(draft: CheckinDraft): Promise<CheckinDraft> {
  try {
    return await apiRequest<CheckinDraft>("/api/checkin/drafts", {
      method: "PUT",
      body: JSON.stringify(draft),
    });
  } catch {
    return draft;
  }
}

export async function clearDraft(phone: string): Promise<void> {
  try {
    await apiRequest<null>(`/api/checkin/drafts/${encodeURIComponent(phone)}`, {
      method: "DELETE",
    });
  } catch {
    // no-op
  }
}

/** Server final summary (OpenAI) + DB; default 5s client timeout is too short. */
const SUBMIT_CHECKIN_TIMEOUT_MS = 120_000;

export async function submitCheckin(input: SubmitCheckinInput): Promise<SubmitCheckinResult> {
  return apiRequest<SubmitCheckinResult>("/api/checkin/submissions", {
    method: "POST",
    body: JSON.stringify(input),
    timeoutMs: SUBMIT_CHECKIN_TIMEOUT_MS,
  });
}

export async function getCheckinDoctorProfile(doctorId: string): Promise<CheckinDoctorProfileDto | null> {
  try {
    return await apiRequest<CheckinDoctorProfileDto>(`/api/checkin/doctor/${encodeURIComponent(doctorId)}`);
  } catch {
    return null;
  }
}

export async function generateCheckinAiPreview(
  input: CheckinAiPreviewInput,
): Promise<CheckinAiPreviewResult> {
  return apiRequest<CheckinAiPreviewResult>("/api/checkin/ai-preview", {
    method: "POST",
    body: JSON.stringify(input),
    timeoutMs: 20000,
  });
}

export async function createCheckinSession(
  input: CheckinSessionStartInput,
): Promise<CheckinSessionStartResult | null> {
  try {
    return await apiRequest<CheckinSessionStartResult>(
      "/api/checkin/session/start",
      {
        method: "POST",
        body: JSON.stringify(input),
        timeoutMs: 12000,
      },
    );
  } catch {
    return null;
  }
}

export async function createCheckinTelegramLink(
  input: CreateCheckinTelegramLinkInput,
): Promise<CreateCheckinTelegramLinkResult> {
  return apiRequest<CreateCheckinTelegramLinkResult>("/api/checkin/telegram-link", {
    method: "POST",
    body: JSON.stringify(input),
    timeoutMs: 15000,
  });
}
