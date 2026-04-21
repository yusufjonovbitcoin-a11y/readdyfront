import type { DoctorPatientDto as DocPatient, DoctorPatientRiskLevel as RiskLevel } from "@/api/types/doctor.types";

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
  };
}
