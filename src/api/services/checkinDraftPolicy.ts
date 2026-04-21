import { clearCheckinDraft, getCheckinDraft } from "@/api/checkin";
import type { CheckinDraft } from "@/api/types/checkin.types";

const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export async function resolveCheckinDraft(phone: string): Promise<CheckinDraft | null> {
  const draft = await getCheckinDraft(phone);
  if (!draft) return null;

  const age = Date.now() - new Date(draft.updatedAt).getTime();
  if (age > DRAFT_TTL_MS) {
    await clearCheckinDraft(phone);
    return null;
  }

  return draft;
}
