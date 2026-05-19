import type { DoctorPatientDto, DoctorPatientRiskLevel } from "@/api/types/doctor.types";
import type { FinalAiSummary, AiCheckinMessageDto } from "@/api/types/final-summary.types";
import type { DoctorDashboardJson } from "@/api/services/medicalIntake.service";
import {
  extractPatientComplaintFromChat,
  looksLikeAiIntakePrompt,
} from "@/lib/patientComplaintFromChat";

export type ClinicalRiskTone = "safe" | "warning" | "critical" | "ai";

export interface VitalReading {
  key: string;
  label: string;
  value: string;
  unit: string;
  status: "normal" | "warning" | "critical" | "unknown";
}

export interface TimelineStep {
  id: string;
  title: string;
  detail: string;
  state: "done" | "current" | "pending";
}

export interface ClinicalIntakeViewModel {
  patientId: string;
  name: string;
  age: number;
  genderLabel: string;
  phone: string;
  intakeStatus: { label: string; tone: ClinicalRiskTone };
  risk: { label: string; tone: ClinicalRiskTone; desc: string };
  chiefComplaint: string;
  complaintArea: string;
  painScore: number | null;
  painLabel: string;
  duration: string;
  localization: string;
  /** Bemor AI chatidagi asosiy shikoyat (bir qator). */
  patientComplaintLine: string;
  aiSummary: string;
  aiPriority: string;
  aiConfidencePct: number | null;
  aiReasoning: string[];
  redFlags: string[];
  suggestedFindings: string[];
  checkFirst: string[];
  patientQuotes: { text: string; time: string }[];
  allergies: string[];
  chronic: string[];
  medications: string[];
  surgeries: string[];
  vitals: VitalReading[];
  timeline: TimelineStep[];
  isUrgent: boolean;
  recommendedQuestions: string[];
  whyHighRiskItems: string[];
  dataCompletenessPct: number | null;
  shortnessOfBreath: string;
}

function parseLegacyJsonSummary(raw: string | undefined | null): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim();
  if (!t.startsWith("{")) return t;
  try {
    const o = JSON.parse(t) as Record<string, unknown>;
    if (typeof o.workflow === "object" && o.workflow !== null) return null;
    if (typeof o.summary === "string") return o.summary;
    if (typeof o.text === "string") return o.text;
  } catch {
    /* ignore */
  }
  return null;
}

function humanizeToken(v: unknown): string {
  if (v == null || v === "") return "—";
  const s = String(v).trim();
  const map: Record<string, string> = {
    yes: "Ha",
    no: "Yo'q",
    unknown: "—",
    male: "Erkak",
    female: "Ayol",
    queue: "Navbatda",
    in_progress: "Ko'rikda",
    completed: "Tugallangan",
    history: "Tarix",
    low: "Past",
    medium: "O'rta",
    high: "Yuqori",
    urgent: "Shoshilinch",
    mild: "Yengil",
    moderate: "O'rtacha",
    severe: "Og'ir",
    sudden: "To'satdan",
    gradual: "Asta-sekin",
    improving: "Yaxshilanmoqda",
    worsening: "Yomonlashmoqda",
    unchanged: "O'zgarmagan",
    fluctuating: "O'zgaruvchan",
    head: "Bosh",
    chest: "Ko'krak/yurak sohasi",
    heart: "Ko'krak/yurak sohasi",
    cardiac: "Ko'krak/yurak sohasi",
    abdomen: "Qorin",
    back: "Bel/orqa",
    limbs: "Qo'l/oyoq",
    throat: "Tomoq",
    skin: "Teri",
    general: "Umumiy",
    patient_report: "Bemor aytgan",
  };
  if (s.includes("|")) {
    return s
      .split("|")
      .map((part) => humanizeToken(part))
      .filter((part, index, arr) => part !== "вЂ”" && arr.indexOf(part) === index)
      .join(" / ");
  }
  return map[s.toLowerCase()] ?? s;
}

function riskToneFromLevel(level: string | undefined | null): ClinicalRiskTone {
  if (level === "critical" || level === "urgent" || level === "high") return "critical";
  if (level === "medium") return "warning";
  return "safe";
}

function intakeStatusLabel(status: DoctorPatientDto["status"]): string {
  const map: Record<DoctorPatientDto["status"], string> = {
    queue: "Intake — navbat",
    in_progress: "Shifokor ko'rigi",
    completed: "Intake yakunlandi",
    history: "Arxiv",
  };
  return map[status] ?? status;
}

function inferShortnessOfBreath(symptoms: string[], findings: string[]): string {
  const blob = [...symptoms, ...findings].join(" ").toLowerCase();
  if (/nafas|dispnea|dyspnea|qisilish|qisilishi/.test(blob)) return "Bor";
  if (symptoms.length === 0 && findings.length === 0) return "—";
  return "Yo'q";
}

function completenessPct(
  structured?: FinalAiSummary | null,
  dashboard?: DoctorDashboardJson | null,
): number | null {
  if (dashboard?.malumot_sifati?.score != null) {
    const s = dashboard.malumot_sifati.score;
    return Math.min(100, Math.round(s <= 1 ? s * 100 : s));
  }
  if (!structured?.data_quality?.completion_level) return null;
  const map = { low: 40, medium: 64, high: 88 };
  return map[structured.data_quality.completion_level] ?? null;
}

function confidenceToPct(conf: string | undefined, score?: number): number | null {
  if (typeof score === "number" && !Number.isNaN(score)) {
    return Math.min(100, Math.max(0, Math.round(score <= 1 ? score * 100 : score)));
  }
  if (conf === "high") return 88;
  if (conf === "medium") return 62;
  if (conf === "low") return 38;
  return null;
}

const DEFAULT_VITALS: Omit<VitalReading, "value" | "status">[] = [
  { key: "bp", label: "Qon bosimi", unit: "mmHg" },
  { key: "hr", label: "Yurak urishi", unit: "bpm" },
  { key: "spo2", label: "SpO₂", unit: "%" },
  { key: "temp", label: "Harorat", unit: "°C" },
  { key: "rr", label: "Nafas", unit: "/min" },
];

function emptyVitals(): VitalReading[] {
  return DEFAULT_VITALS.map((v) => ({
    ...v,
    value: "—",
    status: "unknown",
  }));
}

function buildTimeline(
  patient: DoctorPatientDto,
  hasAi: boolean,
  hasRisk: boolean,
): TimelineStep[] {
  const steps: TimelineStep[] = [
    {
      id: "intake",
      title: "Intake boshlandi",
      detail: patient.date || patient.queueTime || "Qabul vaqti",
      state: "done",
    },
    {
      id: "symptoms",
      title: "Belgilar qayd etildi",
      detail: patient.symptoms.length ? patient.symptoms.slice(0, 2).join(", ") : "AI savolnoma",
      state: hasAi ? "done" : "current",
    },
    {
      id: "risk",
      title: "Xavf baholandi",
      detail: hasRisk ? "AI xavf darajasi belgilandi" : "Kutilmoqda",
      state: hasRisk ? "done" : patient.status === "queue" ? "pending" : "current",
    },
    {
      id: "review",
      title: "Shifokor ko'rigi",
      detail:
        patient.status === "completed"
          ? "Yakunlangan"
          : patient.status === "in_progress"
            ? "Jarayonda"
            : "Kutilmoqda",
      state:
        patient.status === "completed"
          ? "done"
          : patient.status === "in_progress"
            ? "current"
            : "pending",
    },
  ];
  return steps;
}

function fromStructured(s: FinalAiSummary, patient: DoctorPatientDto): Partial<ClinicalIntakeViewModel> {
  return {
    chiefComplaint: s.chief_complaint?.text || patient.symptoms[0] || "—",
    complaintArea: humanizeToken(s.chief_complaint?.body_area),
    painScore: s.severity?.score_1_to_10 ?? null,
    painLabel: humanizeToken(s.severity?.label),
    duration: s.clinical_timeline?.duration || "—",
    localization: [humanizeToken(s.location?.side), s.location?.details].filter((x) => x && x !== "—").join(" · ") || "—",
    aiSummary: s.doctor_brief?.one_line_summary || s.summary_for_doctor || "—",
    aiPriority: s.doctor_brief?.priority_note || "",
    aiConfidencePct: confidenceToPct(s.data_quality?.confidence_in_summary),
    aiReasoning: [
      s.risk_reason,
      s.data_quality?.reason,
      s.summary_for_doctor,
    ].filter(Boolean) as string[],
    redFlags: s.red_flags.filter((r) => r.present).map((r) => r.flag + (r.details ? ` — ${r.details}` : "")),
    suggestedFindings: s.positive_symptoms.map((x) => x.symptom),
    checkFirst: s.doctor_brief?.what_to_check_first ?? [],
    recommendedQuestions: [
      ...(s.doctor_brief?.what_to_check_first ?? []),
      ...s.recommended_followup_questions.map((q) => q.question),
    ].filter(Boolean),
    patientQuotes: (s.original_patient_phrases ?? []).map((text) => ({ text, time: "" })),
    allergies: s.allergies?.details ? [s.allergies.details] : s.allergies?.has_allergies === "yes" ? ["Allergiya bor"] : [],
    chronic: s.chronic_conditions?.details ? [s.chronic_conditions.details] : [],
    medications: s.medications_taken?.details ? [s.medications_taken.details] : [],
    surgeries: s.previous_history?.details ? [s.previous_history.details] : [],
  };
}

function fromDashboard(d: DoctorDashboardJson, patient: DoctorPatientDto): Partial<ClinicalIntakeViewModel> {
  const painRaw = d.ogirlik_lokalizatsiya?.ogirlik_bali;
  const painNum = typeof painRaw === "number" ? painRaw : typeof painRaw === "string" ? Number(painRaw) : null;
  return {
    chiefComplaint: d.asosiy_shikoyat?.matn || patient.symptoms[0] || "—",
    complaintArea: humanizeToken(d.asosiy_shikoyat?.soha),
    painScore: painNum != null && !Number.isNaN(painNum) ? painNum : null,
    painLabel: humanizeToken(d.ogirlik_lokalizatsiya?.manba),
    duration: String(d.vaqt_jadvali?.davomiyligi ?? "—"),
    localization: String(d.ogirlik_lokalizatsiya?.tafsilot ?? d.ogirlik_lokalizatsiya?.tomon ?? "—"),
    aiSummary: d.bir_qatorlik_xulosa || d.shifokor_uchun_ai_xulosa || "—",
    aiPriority: d.eslatma || "",
    aiConfidencePct: confidenceToPct(d.malumot_sifati?.level, d.malumot_sifati?.score),
    aiReasoning: [d.xavf?.sababi, d.shifokor_uchun_ai_xulosa].filter(Boolean) as string[],
    redFlags: d.xavfli_belgilar ?? [],
    suggestedFindings: d.bor_simptomlar ?? [],
    checkFirst: d.tavsiya_etiladigan_savollar ?? [],
    recommendedQuestions: d.tavsiya_etiladigan_savollar ?? [],
    patientQuotes: [],
    allergies: d.allergiya?.bormi === "yes" ? ["Allergiya qayd etilgan"] : [],
    chronic: d.surunkali_kasalliklar?.bormi === "yes" ? ["Surunkali kasallik"] : [],
    medications: d.dorilar?.qabul_qilgan === "yes" ? ["Dori qabul qilgan"] : [],
    surgeries: [],
  };
}

export function buildClinicalIntakeViewModel(input: {
  patient: DoctorPatientDto;
  riskLabel: string;
  riskDesc: string;
  riskLevel: DoctorPatientRiskLevel;
  aiAnalysisStructured?: FinalAiSummary | null;
  doctorDashboard?: DoctorDashboardJson | null;
  aiMessages?: AiCheckinMessageDto[];
}): ClinicalIntakeViewModel {
  const { patient, riskLabel, riskDesc, riskLevel } = input;
  let merged: Partial<ClinicalIntakeViewModel> = {
    chiefComplaint: "—",
    complaintArea: "—",
    painScore: null,
    painLabel: "—",
    duration: "—",
    localization: "—",
    aiSummary: "—",
    aiPriority: "",
    aiConfidencePct: null,
    aiReasoning: [],
    redFlags: patient.riskFactors,
    suggestedFindings: patient.symptoms,
    checkFirst: [],
    patientQuotes: [],
    allergies: [],
    chronic: [],
    medications: [],
    surgeries: [],
  };

  const legacy =
    parseLegacyJsonSummary(patient.aiSummary) ??
    parseLegacyJsonSummary(patient.aiSummaryText) ??
    patient.notes?.trim() ??
    null;

  if (input.doctorDashboard) {
    merged = { ...merged, ...fromDashboard(input.doctorDashboard, patient) };
  } else if (input.aiAnalysisStructured) {
    const rec = input.aiAnalysisStructured as unknown as Record<string, unknown>;
    if (rec.doctor_brief && rec.chief_complaint) {
      merged = { ...merged, ...fromStructured(input.aiAnalysisStructured, patient) };
    } else if (typeof rec.bir_qatorlik_xulosa === "string") {
      merged.aiSummary = rec.bir_qatorlik_xulosa as string;
    }
  }

  if (legacy && merged.aiSummary === "—" && !looksLikeAiIntakePrompt(legacy)) {
    merged.aiSummary = legacy;
  }

  const messages = input.aiMessages ?? [];
  const fromChat = extractPatientComplaintFromChat(messages);
  const dashboardComplaint =
    input.doctorDashboard?.bir_qatorlik_xulosa?.trim() ||
    input.doctorDashboard?.asosiy_shikoyat?.matn?.trim() ||
    "";
  const summaryText = input.patient.aiSummaryText?.trim() ?? "";

  let patientComplaintLine = "—";
  if (dashboardComplaint && !looksLikeAiIntakePrompt(dashboardComplaint)) {
    patientComplaintLine = dashboardComplaint;
  } else if (fromChat) {
    patientComplaintLine = fromChat;
  } else if (summaryText && !looksLikeAiIntakePrompt(summaryText)) {
    patientComplaintLine = summaryText;
  } else if (legacy && !looksLikeAiIntakePrompt(legacy)) {
    patientComplaintLine = legacy;
  }

  if (patientComplaintLine !== "—") {
    merged.chiefComplaint = patientComplaintLine;
  } else if (patient.symptoms[0]) {
    merged.chiefComplaint = patient.symptoms[0];
  }

  if (merged.patientQuotes?.length === 0) {
    const patientMsgs = messages
      .filter((m) => m.role === "patient" && m.text?.trim())
      .slice(-3)
      .map((m) => {
        const time = new Date(m.createdAt);
        return {
          text: m.text.trim(),
          time: isNaN(time.getTime())
            ? ""
            : time.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
        };
      });
    if (patientMsgs.length) merged.patientQuotes = patientMsgs;
  }

  const dashboardRisk = input.doctorDashboard?.xavf?.level;
  const aiRisk = input.aiAnalysisStructured?.risk_level;
  const tone = riskToneFromLevel(dashboardRisk ?? aiRisk ?? riskLevel);

  const hasAi = Boolean(
    input.doctorDashboard?.bir_qatorlik_xulosa ||
      input.aiAnalysisStructured?.summary_for_doctor ||
      legacy,
  );
  const hasRisk = tone !== "safe" || patient.riskFactors.length > 0;

  const recommendedQuestions = Array.from(
    new Set([
      ...(merged.checkFirst ?? []),
      ...(merged.recommendedQuestions ?? []),
    ]),
  ).slice(0, 6);

  const whyHighRiskItems = Array.from(
    new Set([
      ...patient.riskFactors,
      ...(merged.redFlags ?? []),
      ...(merged.suggestedFindings ?? []).slice(0, 4),
    ]),
  ).slice(0, 8);

  const findings = merged.suggestedFindings ?? [];

  return {
    patientId: patient.id,
    name: patient.name || "Bemor",
    age: patient.age,
    genderLabel: patient.gender === "male" ? "Erkak" : "Ayol",
    phone: patient.phone,
    intakeStatus: {
      label: intakeStatusLabel(patient.status),
      tone: patient.status === "queue" ? "warning" : patient.status === "completed" ? "safe" : "ai",
    },
    risk: { label: riskLabel, tone, desc: riskDesc },
    chiefComplaint: merged.chiefComplaint ?? "—",
    complaintArea: merged.complaintArea ?? "—",
    painScore: merged.painScore ?? null,
    painLabel: merged.painLabel ?? "—",
    duration: merged.duration ?? "—",
    localization: merged.localization ?? "—",
    patientComplaintLine,
    aiSummary: merged.aiSummary ?? "—",
    aiPriority: merged.aiPriority ?? "",
    aiConfidencePct: merged.aiConfidencePct ?? null,
    aiReasoning: merged.aiReasoning ?? [],
    redFlags: merged.redFlags ?? [],
    suggestedFindings: merged.suggestedFindings ?? [],
    checkFirst: merged.checkFirst ?? [],
    patientQuotes: merged.patientQuotes ?? [],
    allergies: merged.allergies ?? [],
    chronic: merged.chronic ?? [],
    medications: merged.medications ?? [],
    surgeries: merged.surgeries ?? [],
    vitals: emptyVitals(),
    timeline: buildTimeline(patient, hasAi, hasRisk),
    isUrgent: tone === "critical" || riskLevel === "critical",
    recommendedQuestions,
    whyHighRiskItems,
    dataCompletenessPct: completenessPct(input.aiAnalysisStructured, input.doctorDashboard),
    shortnessOfBreath: inferShortnessOfBreath(patient.symptoms, findings),
  };
}
