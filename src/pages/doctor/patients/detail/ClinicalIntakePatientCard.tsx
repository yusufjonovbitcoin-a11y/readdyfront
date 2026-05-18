import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ClipboardList,
  FlaskConical,
  ShieldAlert,
  User,
} from "lucide-react";
import type { DoctorDashboardJson } from "@/api/services/medicalIntake.service";
import type { DoctorPatientRiskLevel } from "@/api/types/doctor.types";
import type { ClinicalIntakeViewModel, ClinicalRiskTone } from "./clinicalIntakeViewModel";
import { buildClinicalIntakeViewModel } from "./clinicalIntakeViewModel";
import type { PatientDetailBlocksProps } from "./PatientDetailBlocks";
import { AiIntakeDashboardPanel } from "./AiIntakeDashboardPanel";

type DetailTab = "clinical" | "responses" | "transcript" | "notes";

const toneStyles = {
  light: {
    safe: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-900 border-amber-200",
    critical: "bg-red-50 text-red-800 border-red-200",
    ai: "bg-violet-50 text-violet-800 border-violet-200",
  },
  dark: {
    safe: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
    warning: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    critical: "bg-red-500/10 text-red-300 border-red-500/25",
    ai: "bg-violet-500/10 text-violet-300 border-violet-500/25",
  },
} as const;

function Badge({ children, tone, darkMode }: { children: React.ReactNode; tone: ClinicalRiskTone; darkMode: boolean }) {
  const p = darkMode ? toneStyles.dark : toneStyles.light;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${p[tone]}`}>
      {children}
    </span>
  );
}

function Card({
  children,
  className = "",
  darkMode,
  header,
  headerClassName = "",
  embedded = false,
}: {
  children: React.ReactNode;
  className?: string;
  darkMode: boolean;
  header?: React.ReactNode;
  headerClassName?: string;
  embedded?: boolean;
}) {
  const shell = embedded
    ? darkMode
      ? "overflow-hidden rounded-xl border border-white/[0.06] bg-[#0D1117]/60"
      : "overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
    : darkMode
      ? "overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#161B22] shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
      : "overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]";

  return (
    <div className={[shell, className].join(" ")}>
      {header ? (
        <div className={["border-b px-4 py-3", darkMode ? "border-white/[0.06]" : "border-slate-100", headerClassName].join(" ")}>
          {header}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function SectionLabel({ children, darkMode }: { children: React.ReactNode; darkMode: boolean }) {
  return (
    <p className={`text-[11px] font-bold uppercase tracking-[0.12em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
      {children}
    </p>
  );
}

function ClinicalIntakeBody({
  vm,
  darkMode,
  doctorDashboard,
  patientRiskLevel,
  showDoctorActions,
  onAction,
  patientStatus,
}: {
  vm: ClinicalIntakeViewModel;
  darkMode: boolean;
  doctorDashboard?: DoctorDashboardJson | null;
  patientRiskLevel: DoctorPatientRiskLevel;
  showDoctorActions: boolean;
  onAction: (a: string) => void;
  patientStatus: string;
}) {
  const muted = darkMode ? "text-slate-400" : "text-slate-500";
  const title = darkMode ? "text-white" : "text-slate-900";
  const body = darkMode ? "text-slate-600" : "text-slate-600";
  const questions = vm.recommendedQuestions.length ? vm.recommendedQuestions : vm.checkFirst;

  const clinicalCardsGrid = (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card embedded darkMode={darkMode} header={<SectionLabel darkMode={darkMode}>Tavsiya etiladigan savollar</SectionLabel>} className="px-3 py-3">
            {questions.length === 0 ? (
              <p className={`text-sm ${muted}`}>Savollar hali shakllanmagan</p>
            ) : (
              <ul className="space-y-3">
                {questions.map((q, i) => (
                  <li key={i} className="flex items-start justify-between gap-2">
                    <span className={`text-sm ${darkMode ? "text-slate-300" : body}`}>{q}</span>
                    <button
                      type="button"
                      className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-medium ${
                        darkMode
                          ? "border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                          : "border-violet-200 text-violet-700 hover:bg-violet-50"
                      }`}
                    >
                      So&apos;rash
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

      <Card
        embedded
        darkMode={darkMode}
        headerClassName={darkMode ? "bg-red-950/40 border-red-500/20" : "bg-red-50 border-red-100"}
            header={
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-red-300" : "text-red-700"}`}>
                  Xavfli belgilar
                </span>
              </div>
            }
            className="px-3 py-3"
          >
            {vm.redFlags.length === 0 ? (
              <p className={`text-sm ${muted}`}>Xavfli belgi qayd etilmagan</p>
            ) : (
              <ul className="space-y-2.5">
                {vm.redFlags.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
            {vm.isUrgent ? (
              <p
                className={`mt-4 rounded-xl border px-3 py-2.5 text-xs leading-relaxed ${
                  darkMode ? "border-red-500/25 bg-red-500/10 text-red-200" : "border-red-200 bg-red-50/80 text-red-800"
                }`}
              >
                {vm.risk.desc}
              </p>
            ) : null}
          </Card>


      <Card embedded darkMode={darkMode} header={<SectionLabel darkMode={darkMode}>Tibbiy tarix</SectionLabel>} className="px-3 py-3">
        <dl className="space-y-2 text-sm">
              {[
                { label: "Oldingi kasalliklar", value: vm.chronic.join(", ") || "—" },
                { label: "Dorilar", value: vm.medications.join(", ") || "—" },
                { label: "Allergiya", value: vm.allergies.join(", ") || "Yo'q" },
                { label: "Operatsiyalar", value: vm.surgeries.join(", ") || "—" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-2">
                  <dt className={muted}>{row.label}</dt>
                  <dd className={`text-right font-medium ${title}`}>{row.value}</dd>
                </div>
              ))}
        </dl>
      </Card>
    </div>
  );

  return (
    <div className="space-y-5">
      <AiIntakeDashboardPanel
        dashboard={doctorDashboard}
        vm={vm}
        darkMode={darkMode}
        patientRiskLevel={patientRiskLevel}
        footer={clinicalCardsGrid}
      />

      {vm.isUrgent ? (
            <div
              className={`flex gap-3 rounded-[20px] border p-4 ${
                darkMode ? "border-amber-500/30 bg-amber-500/10" : "border-amber-200 bg-amber-50"
              }`}
            >
              <ShieldAlert className={`h-5 w-5 shrink-0 ${darkMode ? "text-amber-400" : "text-amber-600"}`} />
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-amber-300" : "text-amber-800"}`}>
                  Eslatma
                </p>
                <p className={`mt-1 text-sm leading-relaxed ${darkMode ? "text-amber-100/90" : "text-amber-900"}`}>
                  Bemor yuqori xavf guruhi. AI tavsiyasi tibbiy tashxis emas — yakuniy qaror shifokorda.
                </p>
              </div>
            </div>
          ) : null}

          {showDoctorActions && patientStatus === "queue" ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onAction("diagnosed")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                <ClipboardList className="h-4 w-4" />
                Ko&apos;rikni tugatish
              </button>
              <button
                type="button"
                onClick={() => onAction("test")}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold ${
                  darkMode ? "border-sky-500/30 text-sky-300" : "border-sky-200 text-sky-700"
                }`}
              >
                <FlaskConical className="h-4 w-4" />
                Tahlilga yuborish
              </button>
            </div>
      ) : null}
    </div>
  );
}

export function ClinicalIntakePatientCard({
  blockProps,
  onBack,
  children,
}: {
  blockProps: PatientDetailBlocksProps;
  onBack: () => void;
  children?: (tab: DetailTab) => React.ReactNode;
}) {
  const { patient, darkMode, risk, showDoctorActions, onAction } = blockProps;
  const [tab, setTab] = useState<DetailTab>("clinical");

  const vm = useMemo(
    () =>
      buildClinicalIntakeViewModel({
        patient,
        riskLabel: risk.label,
        riskDesc: risk.desc,
        riskLevel: patient.riskLevel,
        aiAnalysisStructured: blockProps.aiAnalysisStructured,
        doctorDashboard: blockProps.doctorDashboard,
        aiMessages: blockProps.aiMessages,
      }),
    [patient, risk, blockProps.aiAnalysisStructured, blockProps.doctorDashboard, blockProps.aiMessages],
  );

  const muted = darkMode ? "text-slate-400" : "text-slate-500";
  const title = darkMode ? "text-white" : "text-slate-900";
  const initials = vm.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const tabs: { id: DetailTab; label: string }[] = [
    { id: "clinical", label: "Klinik xulosa" },
    { id: "responses", label: "Javoblar tahlili" },
    { id: "transcript", label: "Suhbat" },
    { id: "notes", label: "Izohlar" },
  ];

  const btnGhost = darkMode
    ? "border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
    : "border-slate-200 text-slate-600 hover:bg-slate-50";

  return (
    <div className="w-full min-w-0 space-y-5">
      {/* Patient header — mockup style */}
      <div
        className={[
          "rounded-[20px] border p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]",
          darkMode ? "border-white/[0.06] bg-[#161B22]" : "border-slate-200/80 bg-white",
        ].join(" ")}
      >
        <div className="flex min-w-0 items-start gap-3">
          <button
              type="button"
              onClick={onBack}
              aria-label="Orqaga"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${btnGhost}`}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold ${
                darkMode ? "bg-violet-500/20 text-violet-200" : "bg-violet-100 text-violet-800"
              }`}
            >
              {initials || <User className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-medium ${muted}`}>Bemor #{vm.patientId.slice(0, 5).toUpperCase()}</p>
              <h1 className={`truncate text-xl font-bold tracking-tight ${title}`}>{vm.name}</h1>
              <p className={`text-sm ${muted}`}>
                {vm.age} yosh, {vm.genderLabel} · ID {vm.patientId.slice(0, 8).toUpperCase()}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone={vm.intakeStatus.tone} darkMode={darkMode}>
                  {vm.intakeStatus.label}
                </Badge>
                <Badge tone={vm.risk.tone} darkMode={darkMode}>
                  {vm.risk.label}
                </Badge>
              </div>
            </div>
        </div>
      </div>

      <div
        className={`flex gap-1 overflow-x-auto rounded-2xl border p-1 scrollbar-hide ${
          darkMode ? "border-white/[0.06] bg-[#161B22]/80" : "border-slate-200/80 bg-white"
        }`}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? darkMode
                  ? "bg-violet-500/20 text-violet-200"
                  : "bg-violet-600 text-white"
                : darkMode
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "clinical" ? (
        <ClinicalIntakeBody
          vm={vm}
          darkMode={darkMode}
          doctorDashboard={blockProps.doctorDashboard}
          patientRiskLevel={patient.riskLevel}
          showDoctorActions={showDoctorActions}
          onAction={onAction}
          patientStatus={patient.status}
        />
      ) : (
        children?.(tab)
      )}
    </div>
  );
}
