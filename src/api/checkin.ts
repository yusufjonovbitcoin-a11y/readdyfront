import { checkinAdapter } from "@/api";
import type { TFunction } from "i18next";
import type {
  CheckinDoctorProfileDto,
  CheckinDraft,
  CheckinQuestionDto,
  SubmitCheckinInput,
  SubmitCheckinResult,
} from "@/api/types/checkin.types";

export function getCheckinQuestions(doctorId: string, t?: TFunction<"checkin">): Promise<CheckinQuestionDto[]> {
  return checkinAdapter.getQuestions(doctorId, t);
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

export function getCheckinDoctorProfile(doctorId: string): Promise<CheckinDoctorProfileDto | null> {
  return checkinAdapter.getCheckinDoctorProfile(doctorId);
}
