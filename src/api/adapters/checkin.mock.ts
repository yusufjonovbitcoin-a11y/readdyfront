import { getCheckinQuestions } from "@/mocks/checkin_questions";
import type { TFunction } from "i18next";
import type {
  CheckinDraft,
  CheckinQuestionDto,
  SubmitCheckinInput,
  SubmitCheckinResult,
} from "@/api/types/checkin.types";
import { parseJsonSafe } from "@/utils/storage";

export async function getQuestions(t?: TFunction<"checkin">): Promise<CheckinQuestionDto[]> {
  if (!t) {
    throw { status: 500, message: "Missing i18n translator for checkin questions", data: null };
  }
  return getCheckinQuestions(t);
}

export async function getDraft(phone: string): Promise<CheckinDraft | null> {
  const raw = localStorage.getItem(`draft_${phone}`);
  return parseJsonSafe<CheckinDraft | null>(raw, null);
}

export async function saveDraft(draft: CheckinDraft): Promise<CheckinDraft> {
  localStorage.setItem(`draft_${draft.phone}`, JSON.stringify(draft));
  return draft;
}

export async function clearDraft(phone: string): Promise<void> {
  localStorage.removeItem(`draft_${phone}`);
}

export async function submitCheckin(input: SubmitCheckinInput): Promise<SubmitCheckinResult> {
  localStorage.removeItem(`draft_${input.phone}`);
  return {
    checkinId: `checkin-${Date.now()}`,
    acceptedAt: new Date().toISOString(),
  };
}
