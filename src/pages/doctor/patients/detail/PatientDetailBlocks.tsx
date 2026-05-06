import { useState } from "react";
import type { DoctorPatientDto as DocPatient, DoctorPatientRiskLevel as RiskLevel } from "@/api/types/doctor.types";
import type {
  AiCheckinMessageDto,
  AiSummaryStatus,
  FinalAiSummary,
} from "@/api/types/final-summary.types";

export type BlockStyles = {
  cardBase: string;
  pageTitle: string;
  pageMuted: string;
  textBody: string;
  sectionTitle: string;
  labelSm: string;
  darkMode: boolean;
  iconBox: string;
  textareaCls: string;
  disclaimer: string;
};

type RiskCfg = {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
  desc: string;
};

interface PatientDetailBlocksProps extends BlockStyles {
  patient: DocPatient;
  risk: RiskCfg;
  riskAccent: Record<RiskLevel, { left: string; badge: string }>;
  conditions: string[];
  actions: string[];
  /** Bemor ma'lumotlaridan tuzilgan AI tahlil matni */
  aiTahlilYozuvi: string;
  notes: string;
  setNotes: (v: string) => void;
  showDoctorActions: boolean;
  onAction: (a: string) => void;
  patientStatus: DocPatient["status"];
  /** Strukturalangan AI xulosasi; bo'lmasa eski matn ishlatiladi. */
  aiAnalysisStructured?: FinalAiSummary | null;
  aiStatus?: AiSummaryStatus | string | null;
  aiRiskLevel?: "low" | "medium" | "high" | null;
  /** AI suhbat tarixi (faqat detail endpoint qaytaradi). */
  aiMessages?: AiCheckinMessageDto[];
}

function buildAiTahlilYozuvi(patient: DocPatient): string {
  const sex = patient.gender === "male" ? "erkak" : "ayol";
  let s = `Bemor ${patient.age} yoshli ${sex}, qabul sanasi ${patient.date}. `;

  if (patient.symptoms.length) {
    s += `Keltirilgan asosiy belgilar va shikoyatlar (${patient.symptoms.length}): ${patient.symptoms.join(", ")}. `;
  } else {
    s += `Navbatda klinik belgilar bo'yicha alohida shikoyat qayd etilmagan. `;
  }

  if (patient.riskFactors.length) {
    s += `Savolnoma va anamnez bo'yicha xavf omillari: ${patient.riskFactors.join(", ")}. `;
  } else {
    s += `Qo'shimcha xavf omillari kiritilmagan yoki past. `;
  }

  const tail: Record<RiskLevel, string> = {
    low: "Umumiy kombinatsiya jihatidan holat barqaror ko'rinadi; kuzatuv va profilaktika muhim.",
    medium:
      "Belgilar va omillar birgalikda konservativ boshqaruv yoki chuqurlashtirilgan tekshiruv ehtiyojini bildiradi.",
    high: "Belgilar yurak-qon tomir yoki boshqa tizimlarga oid jiddiy patologiyani istisno qilish uchun tezkor baholash zarur.",
    critical:
      "Mavjud alomatlar favqulodda holatni istisno qilmaslikka asos beradi; darhol klinik protokol va monitoring talab etiladi.",
  };
  s += tail[patient.riskLevel];
  return s;
}

/** Salbiy klinik/topilmalar — qizil; ijobiy (yo'q / yaxshi) — yashil */
function buildJavoblarTableRows(patient: DocPatient): { question: string; answer: string; tone: "good" | "bad" }[] {
  const rows: { question: string; answer: string; tone: "good" | "bad" }[] = [];

  patient.symptoms.forEach((s) => {
    rows.push({
      question: `«${s}» klinik belgisi qayd etilganmi?`,
      answer: "Ha",
      tone: "bad",
    });
  });
  if (patient.symptoms.length === 0) {
    rows.push({
      question: "Navbatga kelishda yangi klinik belgilar qayd etilganmi?",
      answer: "Yo'q",
      tone: "good",
    });
  }

  patient.riskFactors.forEach((r) => {
    rows.push({
      question: `«${r}» xavf omili aniqlanganmi?`,
      answer: "Ha",
      tone: "bad",
    });
  });
  if (patient.riskFactors.length === 0) {
    rows.push({
      question: "Qo'shimcha xavf omillari kiritilganmi?",
      answer: "Yo'q",
      tone: "good",
    });
  }

  return rows;
}

export function JavoblarTahliliCard(p: PatientDetailBlocksProps) {
  const { patient, cardBase, sectionTitle, textBody, pageMuted, darkMode } = p;

  const toneAnswerCls = (tone: "good" | "bad") =>
    tone === "good"
      ? darkMode
        ? "text-emerald-400 font-semibold"
        : "text-emerald-600 font-semibold"
      : darkMode
        ? "text-red-400 font-semibold"
        : "text-red-600 font-semibold";

  const tableBorder = darkMode ? "border-[#30363D]" : "border-gray-200";
  const tableRowBg = darkMode ? "bg-[#0D1117]/80" : "bg-gray-50/80";

  const rows = buildJavoblarTableRows(patient);
  const ijobiyRows = rows.filter((r) => r.tone === "good");
  const salbiyRows = rows.filter((r) => r.tone === "bad");

  const MiniTable = ({
    rows: tableRows,
    accent,
    title,
    titleIcon,
  }: {
    rows: { question: string; answer: string; tone: "good" | "bad" }[];
    accent: "good" | "bad";
    title: string;
    titleIcon: string;
  }) => (
    <div
      className={`rounded-lg border overflow-hidden flex flex-col min-h-[120px] ${
        accent === "good"
          ? darkMode
            ? "border-emerald-800/50 bg-emerald-950/20"
            : "border-emerald-200 bg-emerald-50/40"
          : darkMode
            ? "border-red-900/50 bg-red-950/15"
            : "border-red-200 bg-red-50/40"
      }`}
    >
      <div
        className={`px-3 py-2.5 flex items-center gap-2 border-b ${
          accent === "good"
            ? darkMode
              ? "border-emerald-800/40 bg-emerald-950/30"
              : "border-emerald-200 bg-emerald-100/60"
            : darkMode
              ? "border-red-900/40 bg-red-950/25"
              : "border-red-200 bg-red-100/60"
        }`}
      >
        <i
          className={`${titleIcon} text-base ${
            accent === "good" ? (darkMode ? "text-emerald-400" : "text-emerald-600") : darkMode ? "text-red-400" : "text-red-600"
          }`}
        ></i>
        <span className={`text-sm font-semibold ${sectionTitle}`}>{title}</span>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-base border-collapse min-w-[240px] leading-snug">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className={`border-b ${tableBorder} ${darkMode ? "bg-[#21262D]/80" : "bg-white/90"}`}>
              <th scope="col" className={`text-left py-2.5 px-2.5 text-sm font-semibold uppercase tracking-wide ${pageMuted}`}>Savol</th>
              <th scope="col" className={`text-right py-2.5 px-2.5 text-sm font-semibold uppercase tracking-wide w-20 ${pageMuted}`}>Javob</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.length === 0 ? (
              <tr>
                <td colSpan={2} className={`py-5 px-2.5 text-center text-base italic ${pageMuted}`}>
                  Ma&apos;lumot yo&apos;q
                </td>
              </tr>
            ) : (
              tableRows.map((row, i) => (
                <tr key={i} className={`border-b ${tableBorder} ${i % 2 === 1 ? tableRowBg : ""}`}>
                  <td className={`py-2.5 px-2.5 align-top ${textBody}`}>{row.question}</td>
                  <td className={`py-2.5 px-2.5 text-right align-top ${toneAnswerCls(row.tone)}`}>{row.answer}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className={`rounded-xl p-5 ${cardBase}`}>
      <h3 className={`text-base font-semibold mb-4 flex items-center gap-2 ${sectionTitle}`}>
        <div className="w-6 h-6 flex items-center justify-center">
          <i className="ri-questionnaire-line text-violet-500"></i>
        </div>
        Javoblar Tahlili
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-stretch">
        <MiniTable rows={ijobiyRows} accent="good" title="Ijobiy savollar" titleIcon="ri-checkbox-circle-line" />
        <MiniTable rows={salbiyRows} accent="bad" title="Salbiy javoblar" titleIcon="ri-close-circle-line" />
      </div>
    </div>
  );
}

export function AiTavsiyaCard(p: PatientDetailBlocksProps) {
  const {
    patient,
    cardBase,
    pageTitle,
    pageMuted,
    textBody,
    labelSm,
    darkMode,
    riskAccent,
    risk,
    disclaimer,
    conditions,
    actions,
    aiTahlilYozuvi,
  } = p;
  return (
    <div className={`rounded-xl border p-5 ${cardBase} border-l-4 ${riskAccent[patient.riskLevel].left}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${darkMode ? "bg-[#21262D]" : "bg-violet-50"}`}>
            <i className="ri-robot-line text-violet-600 text-base"></i>
          </div>
          <div>
            <h3 className={`text-base font-semibold ${pageTitle}`}>AI Tavsiya</h3>
            <p className={`text-xs ${pageMuted}`}>Sun'iy intellekt tahlili</p>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold border ${
            darkMode ? riskAccent[patient.riskLevel].badge : `${risk.bg} ${risk.color} ${risk.border}`
          }`}
        >
          <i className={`${risk.icon} mr-1`}></i>
          {risk.label}
        </span>
      </div>

      <div className={`rounded-lg px-3 py-2 mb-4 flex items-start gap-2 ${disclaimer}`}>
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i className="ri-information-line text-amber-500 text-sm"></i>
        </div>
        <p className="text-xs font-medium">AI tavsiyasi tibbiy tashxis emas. Yakuniy qaror faqat shifokor tomonidan qabul qilinadi.</p>
      </div>

      <p className={`text-sm mb-3 ${textBody}`}>{risk.desc}</p>

      <div className={`rounded-lg px-3 py-3 mb-4 ${darkMode ? "bg-[#0D1117]/80 border border-[#30363D]" : "bg-slate-50 border border-slate-100"}`}>
        <p className={`text-xs font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Tahlil yozuvi</p>
        <p className={`text-sm leading-relaxed ${textBody}`}>{aiTahlilYozuvi}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className={`text-xs font-semibold mb-2 uppercase tracking-wide ${labelSm}`}>Mumkin bo'lgan holatlar</p>
          <div className="space-y-1.5">
            {conditions.map((c, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm ${textBody}`}>
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-arrow-right-s-line text-violet-500"></i>
                </div>
                {c}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className={`text-xs font-semibold mb-2 uppercase tracking-wide ${labelSm}`}>Tavsiya etilgan harakatlar</p>
          <div className="space-y-1.5">
            {actions.map((a, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm ${textBody}`}>
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-checkbox-circle-line text-green-500"></i>
                </div>
                {a}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShifokorIzohlariCard(p: PatientDetailBlocksProps) {
  const { cardBase, sectionTitle, pageMuted, darkMode, textareaCls, notes, setNotes } = p;
  return (
    <div className={`rounded-xl p-5 ${cardBase}`}>
      <h3 className={`text-base font-semibold mb-3 flex items-center gap-2 ${sectionTitle}`}>
        <div className="w-6 h-6 flex items-center justify-center">
          <i className="ri-edit-2-line text-violet-500"></i>
        </div>
        Shifokor Izohlari
      </h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Bemor haqida izoh yozing..."
        rows={4}
        maxLength={500}
        className={textareaCls}
      />
      <div className="flex justify-between items-center mt-1">
        <span className={`text-xs ${pageMuted}`}>{notes.length}/500 belgi</span>
        <button
          type="button"
          disabled
          title="Tez orada"
          className={`text-xs font-medium whitespace-nowrap opacity-60 cursor-not-allowed ${darkMode ? "text-violet-400" : "text-violet-600"}`}
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}

export function BemorVaAmallarGrid(p: PatientDetailBlocksProps) {
  const { patient, cardBase, sectionTitle, pageMuted, darkMode, iconBox, showDoctorActions, onAction, patientStatus } = p;
  return (
    <div className={`grid grid-cols-1 ${showDoctorActions ? "lg:grid-cols-2 lg:items-stretch" : ""} gap-5`}>
      <div className={`rounded-xl p-4 ${cardBase} ${showDoctorActions ? "lg:h-full lg:min-h-0" : ""}`}>
        <h4 className={`text-sm font-semibold mb-3 ${sectionTitle}`}>Bemor Ma'lumoti</h4>
        <div className="space-y-2.5">
          {[
            { icon: "ri-user-line", label: "Ism", value: patient.name },
            { icon: "ri-phone-line", label: "Telefon", value: patient.phone },
            { icon: "ri-calendar-line", label: "Sana", value: patient.date },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${iconBox}`}>
                <i className={`${row.icon} text-gray-500 text-sm`}></i>
              </div>
              <div>
                <p className={`text-xs ${pageMuted}`}>{row.label}</p>
                <p className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{row.value}</p>
              </div>
            </div>
          ))}
          {patient.consultationDuration > 0 && (
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${iconBox}`}>
                <i className="ri-timer-line text-gray-500 text-sm"></i>
              </div>
              <div>
                <p className={`text-xs ${pageMuted}`}>Ko'rik davomiyligi</p>
                <p className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{patient.consultationDuration} daqiqa</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDoctorActions && (
        <div className={`rounded-xl p-4 ${cardBase} lg:h-full lg:min-h-0`}>
          <h4 className={`text-sm font-semibold mb-3 ${sectionTitle}`}>Shifokor Amallari</h4>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onAction("diagnosed")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors cursor-pointer text-sm font-medium whitespace-nowrap"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-green-600"></i>
              </div>
              Ko&apos;rikni tugatish
            </button>
            {patientStatus === "queue" && (
              <button
                type="button"
                onClick={() => onAction("test")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer text-sm font-medium whitespace-nowrap"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-flask-line text-blue-600"></i>
                </div>
                Tahlilga yuborish
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function patientDetailBlockProps(
  patient: DocPatient,
  styles: BlockStyles,
  risk: RiskCfg,
  riskAccent: Record<RiskLevel, { left: string; badge: string }>,
  conditions: string[],
  actions: string[],
  notes: string,
  setNotes: (v: string) => void,
  showDoctorActions: boolean,
  onAction: (a: string) => void,
  extras?: {
    aiAnalysisStructured?: FinalAiSummary | null;
    aiStatus?: AiSummaryStatus | string | null;
    aiRiskLevel?: "low" | "medium" | "high" | null;
    aiMessages?: AiCheckinMessageDto[];
  },
): PatientDetailBlocksProps {
  return {
    patient,
    ...styles,
    risk,
    riskAccent,
    conditions,
    actions,
    aiTahlilYozuvi: buildAiTahlilYozuvi(patient),
    notes,
    setNotes,
    showDoctorActions,
    onAction,
    patientStatus: patient.status,
    aiAnalysisStructured: extras?.aiAnalysisStructured ?? patient.aiAnalysisStructured ?? null,
    aiStatus: extras?.aiStatus ?? patient.aiStatus ?? null,
    aiRiskLevel: extras?.aiRiskLevel ?? patient.aiRiskLevel ?? null,
    aiMessages: extras?.aiMessages ?? patient.aiMessages ?? [],
  };
}

const RISK_BADGE: Record<"low" | "medium" | "high", { label: string; cls: string; icon: string }> = {
  low: { label: "Past xavf", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "ri-shield-check-line" },
  medium: { label: "O'rta xavf", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: "ri-shield-line" },
  high: { label: "Yuqori xavf", cls: "bg-red-50 text-red-700 border-red-200", icon: "ri-shield-flash-line" },
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  completed: { label: "Tayyor", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  in_progress: { label: "Davom etyapti", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  failed: { label: "AI xato", cls: "bg-red-50 text-red-700 border-red-200" },
  not_started: { label: "Boshlanmagan", cls: "bg-gray-50 text-gray-600 border-gray-200" },
  high_risk: { label: "Yuqori xavf", cls: "bg-red-50 text-red-700 border-red-200" },
  incomplete: { label: "To'liq emas", cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

function ChipList({ items, accent }: { items: string[]; accent?: "good" | "bad" | "warn" | "muted" }) {
  if (!items.length) return null;
  const cls =
    accent === "bad"
      ? "bg-red-50 text-red-700 border-red-200"
      : accent === "good"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : accent === "warn"
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className={`text-sm px-2 py-1 rounded-md border ${cls}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function SectionRow({
  label,
  value,
  muted,
  dark,
}: {
  label: string;
  value: React.ReactNode;
  muted?: string;
  dark?: boolean;
}) {
  const unknownTokens = new Set([
    "unknown",
    "aniqlanmagan",
    "not_applicable",
    "not applicable",
    "n/a",
    "none",
    "null",
    "undefined",
  ]);
  let normalizedValue: React.ReactNode = value;
  if (typeof value === "string") {
    const lowered = value.trim().toLowerCase();
    const humanizedMap: Record<string, string> = {
      yes: "Ha",
      no: "Yo'q",
      other: "Boshqa",
      out_of_scope: "Bo'limga aloqasiz",
      low: "Past",
      medium: "O'rta",
      high: "Yuqori",
      mild: "Yengil",
      moderate: "O'rtacha",
      severe: "Og'ir",
    };
    if (unknownTokens.has(lowered)) {
      normalizedValue = "—";
    } else if (humanizedMap[lowered]) {
      normalizedValue = humanizedMap[lowered];
    }
  }
  return (
    <div className={`grid grid-cols-[140px_minmax(0,1fr)] gap-3 items-start py-1.5 border-b ${dark ? "border-[#30363D]" : "border-gray-100"}`}>
      <span className={`text-sm uppercase tracking-wide ${muted ?? ""}`}>{label}</span>
      <span className={`text-base ${dark ? "text-gray-200" : "text-gray-800"}`}>{normalizedValue || "—"}</span>
    </div>
  );
}

export function AiXulosaCard(p: PatientDetailBlocksProps) {
  const {
    cardBase,
    pageTitle,
    pageMuted,
    textBody,
    labelSm,
    darkMode,
    aiTahlilYozuvi,
    aiAnalysisStructured,
    aiStatus,
    aiRiskLevel,
  } = p;

  const subBox = darkMode ? "bg-[#0D1117]/80 border border-[#30363D]" : "bg-slate-50 border border-slate-100";
  if (!aiAnalysisStructured) {
    const legacyText = (p.patient.aiSummary?.trim() || p.patient.aiSummaryText?.trim() || aiTahlilYozuvi || "").trim();
    return (
      <div className={`rounded-xl p-5 ${cardBase}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${darkMode ? "bg-[#21262D]" : "bg-emerald-50"}`}>
            <i className="ri-robot-line text-emerald-600 text-base"></i>
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${pageTitle}`}>AI Xulosa</h3>
            <p className={`text-sm ${pageMuted}`}>Strukturalangan ma'lumot mavjud emas</p>
          </div>
        </div>
        <div className={`rounded-lg px-3 py-3 ${subBox}`}>
          <p className={`text-sm font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Eski formatdagi xulosa</p>
          <p className={`text-base leading-relaxed ${textBody}`}>
            {legacyText || "AI xulosa hali tayyor emas"}
          </p>
        </div>
      </div>
    );
  }

  const s = aiAnalysisStructured;
  const risk = aiRiskLevel && RISK_BADGE[aiRiskLevel] ? RISK_BADGE[aiRiskLevel] : RISK_BADGE[s.risk_level] ?? RISK_BADGE.medium;
  const statusKey = aiStatus && typeof aiStatus === "string" ? aiStatus : s.summary_status;
  const status = STATUS_BADGE[statusKey] ?? STATUS_BADGE[s.summary_status] ?? STATUS_BADGE.incomplete;

  return (
    <div className={`rounded-xl p-5 ${cardBase}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${darkMode ? "bg-[#21262D]" : "bg-emerald-50"}`}>
            <i className="ri-robot-line text-emerald-600 text-base"></i>
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${pageTitle}`}>AI Xulosa</h3>
            <p className={`text-sm ${pageMuted}`}>Strukturalangan klinik intake xulosasi</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm px-2.5 py-1 rounded-full font-semibold border ${risk.cls}`}>
            <i className={`${risk.icon} mr-1`} /> {risk.label}
          </span>
          <span className={`text-sm px-2.5 py-1 rounded-full font-semibold border ${status.cls}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className={`rounded-lg px-3 py-3 mb-4 ${subBox}`}>
        <p className={`text-sm font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Bir qatorlik xulosa</p>
        <p className={`text-base font-medium ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          {s.doctor_brief.one_line_summary || s.summary_for_doctor || "—"}
        </p>
        {s.doctor_brief.priority_note ? (
          <p className={`text-sm mt-2 ${textBody}`}>
            <span className="font-semibold">Eslatma: </span>
            {s.doctor_brief.priority_note}
          </p>
        ) : null}
        {s.doctor_brief.what_to_check_first?.length ? (
          <div className="mt-2">
            <p className={`text-base uppercase tracking-wide ${labelSm}`}>Birinchi navbatda tekshirish</p>
            <ChipList items={s.doctor_brief.what_to_check_first} accent="warn" />
          </div>
        ) : null}
      </div>

      <div className={`rounded-lg px-3 py-3 mb-4 ${subBox}`}>
        <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Asosiy shikoyat</p>
        <SectionRow label="Matn" value={s.chief_complaint.text} muted={pageMuted} dark={darkMode} />
        <SectionRow label="Soha" value={s.chief_complaint.body_area} muted={pageMuted} dark={darkMode} />
        {s.chief_complaint.original_phrase ? (
          <SectionRow label="Bemor iborasi" value={`"${s.chief_complaint.original_phrase}"`} muted={pageMuted} dark={darkMode} />
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className={`rounded-lg px-3 py-3 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Vaqt jadvali</p>
          <SectionRow label="Davomiyligi" value={s.clinical_timeline.duration} muted={pageMuted} dark={darkMode} />
          <SectionRow label="Boshlangani" value={s.clinical_timeline.onset} muted={pageMuted} dark={darkMode} />
          <SectionRow label="Dinamika" value={s.clinical_timeline.progression} muted={pageMuted} dark={darkMode} />
        </div>
        <div className={`rounded-lg px-3 py-3 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Og'irlik / lokalizatsiya</p>
          <SectionRow
            label="Og'irlik bali"
            value={
              s.severity.score_1_to_10 != null
                ? `${s.severity.score_1_to_10} / 10 (${s.severity.label})`
                : s.severity.label
            }
            muted={pageMuted}
            dark={darkMode}
          />
          <SectionRow label="Manba" value={s.severity.source} muted={pageMuted} dark={darkMode} />
          <SectionRow label="Tomon" value={s.location.side} muted={pageMuted} dark={darkMode} />
          <SectionRow label="Tafsilot" value={s.location.details} muted={pageMuted} dark={darkMode} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className={`rounded-lg px-3 py-3 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Bor simptomlar</p>
          {s.positive_symptoms.length === 0 ? (
            <p className={`text-sm ${pageMuted}`}>Belgilanmagan</p>
          ) : (
            <ul className="space-y-1.5">
              {s.positive_symptoms.map((row, i) => (
                <li key={i} className="text-base">
                  <span className={darkMode ? "text-gray-100 font-medium" : "text-gray-900 font-medium"}>{row.symptom}</span>
                  {row.details ? <span className={`ml-1 ${textBody}`}>— {row.details}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={`rounded-lg px-3 py-3 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Inkor qilingan</p>
          {s.negative_symptoms.length === 0 ? (
            <p className={`text-sm ${pageMuted}`}>Belgilanmagan</p>
          ) : (
            <ul className="space-y-1.5">
              {s.negative_symptoms.map((row, i) => (
                <li key={i} className="text-base">
                  <span className={darkMode ? "text-gray-100 font-medium" : "text-gray-900 font-medium"}>{row.symptom}</span>
                  {row.details ? <span className={`ml-1 ${textBody}`}>— {row.details}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {s.red_flags.length > 0 && (
        <div className="rounded-lg px-3 py-3 mb-4 border border-red-200 bg-red-50/60 dark:bg-red-950/30 dark:border-red-900/60">
          <p className="text-base font-semibold mb-1.5 uppercase tracking-wide text-red-700 dark:text-red-300">Xavfli belgilar</p>
          <ul className="space-y-1.5">
            {s.red_flags.map((row, i) => (
              <li key={i} className="text-base flex items-start gap-2">
                <i className={`mt-0.5 ${row.present ? "ri-alarm-warning-line text-red-600" : "ri-checkbox-blank-circle-line text-gray-400"}`} />
                <span className={textBody}>
                  <span className={darkMode ? "text-gray-100 font-medium" : "text-gray-900 font-medium"}>{row.flag}</span>
                  {row.details ? <span> — {row.details}</span> : null}
                  {!row.present ? <span className={`ml-1 ${pageMuted}`}>(yo'q)</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className={`rounded-lg px-3 py-3 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Dorilar</p>
          <SectionRow label="Qabul qilgan" value={s.medications_taken.has_taken} muted={pageMuted} dark={darkMode} />
          {s.medications_taken.details ? (
            <SectionRow label="Tafsilot" value={s.medications_taken.details} muted={pageMuted} dark={darkMode} />
          ) : null}
        </div>
        <div className={`rounded-lg px-3 py-3 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Allergiya</p>
          <SectionRow label="Bormi" value={s.allergies.has_allergies} muted={pageMuted} dark={darkMode} />
          {s.allergies.details ? (
            <SectionRow label="Tafsilot" value={s.allergies.details} muted={pageMuted} dark={darkMode} />
          ) : null}
        </div>
        <div className={`rounded-lg px-3 py-3 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Surunkali kasalliklar</p>
          <SectionRow label="Bormi" value={s.chronic_conditions.has_chronic_conditions} muted={pageMuted} dark={darkMode} />
          {s.chronic_conditions.details ? (
            <SectionRow label="Tafsilot" value={s.chronic_conditions.details} muted={pageMuted} dark={darkMode} />
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className={`rounded-lg px-3 py-3 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Oldingi tarix</p>
          <SectionRow label="Avval bo'lgan" value={s.previous_history.similar_episode_before} muted={pageMuted} dark={darkMode} />
          {s.previous_history.details ? (
            <SectionRow label="Tafsilot" value={s.previous_history.details} muted={pageMuted} dark={darkMode} />
          ) : null}
        </div>
        <div className={`rounded-lg px-3 py-3 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Jarohat / yot jism</p>
          <SectionRow label="Mavjud" value={s.injury_or_foreign_body.present} muted={pageMuted} dark={darkMode} />
          {s.injury_or_foreign_body.details ? (
            <SectionRow label="Tafsilot" value={s.injury_or_foreign_body.details} muted={pageMuted} dark={darkMode} />
          ) : null}
        </div>
      </div>

      {s.out_of_scope_complaints.length > 0 && (
        <div className={`rounded-lg px-3 py-3 mb-4 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Bo'limga aloqasiz shikoyatlar</p>
          <ul className="space-y-2">
            {s.out_of_scope_complaints.map((row, i) => (
              <li key={i} className="text-base">
                <p className={darkMode ? "text-gray-100 font-medium" : "text-gray-900 font-medium"}>{row.original_text}</p>
                {row.possible_area ? <p className={`text-sm ${pageMuted}`}>Soha: {row.possible_area}</p> : null}
                {row.note_for_doctor ? <p className={`text-sm ${textBody}`}>{row.note_for_doctor}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {s.contradictions.length > 0 && (
        <div className={`rounded-lg px-3 py-3 mb-4 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Qarama-qarshiliklar</p>
          <ul className="space-y-2">
            {s.contradictions.map((row, i) => (
              <li key={i} className="text-base">
                <p className={darkMode ? "text-gray-100 font-medium" : "text-gray-900 font-medium"}>{row.field}</p>
                <p className={`text-sm ${pageMuted}`}>Avval: {row.earlier_answer || "—"}</p>
                <p className={`text-sm ${pageMuted}`}>Keyin: {row.later_answer || "—"}</p>
                {row.resolution ? <p className={`text-sm ${textBody}`}>Yechim: {row.resolution}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {s.missing_important_information.length > 0 && (
        <div className={`rounded-lg px-3 py-3 mb-4 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Yetishmayotgan ma'lumotlar</p>
          <ChipList items={s.missing_important_information} accent="warn" />
        </div>
      )}

      {s.recommended_followup_questions.length > 0 && (
        <div className={`rounded-lg px-3 py-3 mb-4 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Tavsiya etiladigan savollar</p>
          <ul className="space-y-2 list-decimal pl-5">
            {s.recommended_followup_questions.map((row, i) => (
              <li key={i} className="text-base">
                <p className={darkMode ? "text-gray-100" : "text-gray-900"}>{row.question}</p>
                {row.reason ? <p className={`text-sm ${pageMuted}`}>{row.reason}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {s.summary_for_doctor ? (
        <div className={`rounded-lg px-3 py-3 mb-4 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Shifokor uchun xulosa</p>
          <p className={`text-base leading-relaxed ${textBody}`}>{s.summary_for_doctor}</p>
        </div>
      ) : null}

      {s.original_patient_phrases.length > 0 && (
        <div className={`rounded-lg px-3 py-3 mb-4 ${subBox}`}>
          <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Bemor iboralari</p>
          <ChipList items={s.original_patient_phrases} accent="muted" />
        </div>
      )}

      <div className={`rounded-lg px-3 py-3 ${subBox}`}>
        <p className={`text-base font-semibold mb-1.5 uppercase tracking-wide ${labelSm}`}>Ma'lumot sifati</p>
        <SectionRow label="Tugallanganlik" value={s.data_quality.completion_level} muted={pageMuted} dark={darkMode} />
        <SectionRow label="Ishonchlilik" value={s.data_quality.confidence_in_summary} muted={pageMuted} dark={darkMode} />
        {s.data_quality.reason ? (
          <SectionRow label="Sabab" value={s.data_quality.reason} muted={pageMuted} dark={darkMode} />
        ) : null}
      </div>
    </div>
  );
}

export function SuhbatTarixiCard(p: PatientDetailBlocksProps) {
  const { cardBase, sectionTitle, pageMuted, textBody, darkMode, aiMessages = [] } = p;
  const ordered = [...aiMessages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`rounded-xl p-5 ${cardBase}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center gap-2 cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 flex items-center justify-center">
          <i className="ri-chat-3-line text-emerald-500"></i>
        </div>
        <h3 className={`text-base font-semibold ${sectionTitle}`}>Suhbat tarixi</h3>
        <span className={`text-xs font-normal ${pageMuted}`}>{ordered.length} ta xabar</span>
        <span className="ml-auto">
          <i
            className={`${
              isOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"
            } text-lg ${darkMode ? "text-gray-300" : "text-gray-500"}`}
          />
        </span>
      </button>

      {isOpen && (
        <div className="mt-4">
          {ordered.length === 0 ? (
            <p className={`text-sm ${pageMuted}`}>Bu bemor bilan AI suhbat yozuvi topilmadi.</p>
          ) : (
            <ul className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {ordered.map((msg) => {
                const isPatient = msg.role === "patient";
                const time = new Date(msg.createdAt);
                const ts = isNaN(time.getTime())
                  ? ""
                  : time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                const meta = msg.metadata as { question_ui?: { options?: Array<{ value: string; label: string }> } } | null;
                const options = meta?.question_ui?.options ?? [];
                return (
                  <li key={msg.id} className={`flex ${isPatient ? "justify-end" : "justify-start"}`}>
                    <div
                      className={[
                        "max-w-[80%] rounded-2xl px-3 py-2 border",
                        isPatient
                          ? darkMode
                            ? "bg-emerald-950/40 border-emerald-900/50 text-emerald-100"
                            : "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : darkMode
                            ? "bg-[#0D1117]/80 border-[#30363D] text-gray-200"
                            : "bg-white border-slate-200 text-gray-800",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] uppercase tracking-wide font-semibold ${
                            isPatient ? (darkMode ? "text-emerald-300" : "text-emerald-700") : pageMuted
                          }`}
                        >
                          {isPatient ? "Bemor" : msg.role === "assistant" ? "AI" : "Tizim"}
                        </span>
                        {msg.messageType && msg.messageType !== "text" ? (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${darkMode ? "bg-[#21262D] text-gray-400" : "bg-slate-100 text-slate-600"}`}>
                            {msg.messageType}
                          </span>
                        ) : null}
                        {ts ? <span className={`ml-auto text-[10px] ${pageMuted}`}>{ts}</span> : null}
                      </div>
                      <p className={`text-sm whitespace-pre-wrap leading-relaxed ${textBody}`}>{msg.text}</p>
                      {options.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {options.map((o, i) => (
                            <span
                              key={`${o.value}-${i}`}
                              className={`text-[11px] px-2 py-0.5 rounded border ${
                                darkMode
                                  ? "bg-[#161B22] border-[#30363D] text-gray-300"
                                  : "bg-slate-50 border-slate-200 text-slate-700"
                              }`}
                            >
                              {o.label}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
