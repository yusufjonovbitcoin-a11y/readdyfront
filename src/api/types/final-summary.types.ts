/**
 * Frontend mirror of the backend `FinalAiSummary` contract emitted by
 * `POST /api/checkin/submissions` and surfaced through
 * `GET /api/doctors/me/patients/:responseId`. Keep this type in sync with
 * `Hospital/src/ai/final-summary.types.ts`.
 */
export interface FinalAiSummary {
  department: string;
  summary_status: "completed" | "incomplete" | "high_risk";
  risk_level: "low" | "medium" | "high";
  risk_reason: string;

  patient_language: "uz" | "ru";
  doctor_language: "uz" | "ru";

  doctor_brief: {
    one_line_summary: string;
    priority_note: string;
    what_to_check_first: string[];
  };

  chief_complaint: {
    text: string;
    body_area:
      | "ear"
      | "nose"
      | "throat"
      | "voice"
      | "hearing"
      | "dizziness"
      | "allergy"
      | "nose_bleed"
      | "sinus"
      | "other"
      | "out_of_scope"
      | "unknown";
    original_phrase: string;
  };

  clinical_timeline: {
    duration: string;
    onset: "sudden" | "gradual" | "unknown";
    progression:
      | "improving"
      | "worsening"
      | "unchanged"
      | "fluctuating"
      | "unknown";
  };

  severity: {
    score_1_to_10: number | null;
    label: "mild" | "moderate" | "severe" | "unknown";
    source: "patient_reported" | "inferred" | "unknown";
  };

  location: {
    side: "left" | "right" | "both" | "not_applicable" | "unknown";
    details: string;
  };

  positive_symptoms: Array<{
    symptom: string;
    details: string;
    source: "patient_reported";
  }>;

  negative_symptoms: Array<{
    symptom: string;
    details: string;
    source: "patient_denied";
  }>;

  red_flags: Array<{
    flag: string;
    present: boolean;
    details: string;
  }>;

  medications_taken: {
    has_taken: "yes" | "no" | "unknown";
    details: string;
  };

  allergies: {
    has_allergies: "yes" | "no" | "unknown";
    details: string;
  };

  chronic_conditions: {
    has_chronic_conditions: "yes" | "no" | "unknown";
    details: string;
  };

  previous_history: {
    similar_episode_before: "yes" | "no" | "unknown";
    details: string;
  };

  injury_or_foreign_body: {
    present: "yes" | "no" | "unknown";
    details: string;
  };

  out_of_scope_complaints: Array<{
    original_text: string;
    possible_area: string;
    note_for_doctor: string;
  }>;

  contradictions: Array<{
    field: string;
    earlier_answer: string;
    later_answer: string;
    resolution: string;
  }>;

  missing_important_information: string[];

  recommended_followup_questions: Array<{
    question: string;
    reason: string;
  }>;

  summary_for_doctor: string;

  original_patient_phrases: string[];

  data_quality: {
    completion_level: "low" | "medium" | "high";
    confidence_in_summary: "low" | "medium" | "high";
    reason: string;
  };

  ai_disclaimer: string;
}

export type AiCheckinMessageRole = "patient" | "assistant" | "system" | string;

export interface AiCheckinMessageDto {
  id: string;
  role: AiCheckinMessageRole;
  text: string;
  messageType: string;
  questionKey: string | null;
  answerValue: string | null;
  language: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export type AiSummaryStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "failed";
