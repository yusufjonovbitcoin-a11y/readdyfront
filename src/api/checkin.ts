import { checkinAdapter } from "@/api";
import type { TFunction } from "i18next";
import type {
  CheckinDraft,
  CheckinQuestionDto,
  SubmitCheckinInput,
  SubmitCheckinResult,
} from "@/api/types/checkin.types";

export function getCheckinQuestions(t?: TFunction<"checkin">): Promise<CheckinQuestionDto[]> {
  return checkinAdapter.getQuestions(t);
}

export function getCheckinDraft(phone: string): Promise<CheckinDraft | null> {
  return checkinAdapter.getDraft(phone);
}

export function saveCheckinDraft(draft: CheckinDraft): Promise<CheckinDraft> {
  return checkinAdapter.saveDraft(draft);
}

export function clearCheckinDraft(phone: string): Promise<void> {
  return checkinAdapter.clearDraft(phone);
}

export function submitCheckin(input: SubmitCheckinInput): Promise<SubmitCheckinResult> {
  return checkinAdapter.submitCheckin(input);
}
