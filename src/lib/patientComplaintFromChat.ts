import type { AiCheckinMessageDto } from "@/api/types/final-summary.types";

export function looksLikeAiIntakePrompt(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  const questions = (t.match(/\?/g) || []).length;
  if (questions >= 2) return true;
  if (
    questions >= 1 &&
    /(assalomu|iltimos|yuragingiz|og'riq|og‘riq|qayerda|1 dan 10|qaysi|tanlang|javobingiz)/i.test(t)
  ) {
    return true;
  }
  return false;
}

/** Bemorning AI chatdagi shikoyati (assistent savollari emas). */
export function extractPatientComplaintFromChat(messages: AiCheckinMessageDto[]): string {
  const patientLines = messages
    .filter((m) => m.role === "patient" && m.text?.trim())
    .map((m) => m.text.trim());

  if (!patientLines.length) return "";

  const first = patientLines[0];
  if (!looksLikeAiIntakePrompt(first)) return first;

  const meaningful = patientLines.filter((line) => line.length > 2);
  return meaningful.slice(0, 2).join(". ") || first;
}
