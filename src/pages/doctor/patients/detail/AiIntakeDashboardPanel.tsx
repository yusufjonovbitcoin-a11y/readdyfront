import { Brain } from "lucide-react";
import type { DoctorDashboardJson } from "@/api/services/medicalIntake.service";
import type { DoctorPatientRiskLevel } from "@/api/types/doctor.types";
import type { ClinicalIntakeViewModel } from "./clinicalIntakeViewModel";

function DashboardRow({
  label,
  value,
  darkMode,
}: {
  label: string;
  value: React.ReactNode;
  darkMode: boolean;
}) {
  const display =
    value == null || value === "" || value === "unknown" || value === "not_applicable" ? "—" : value;
  return (
    <div className={`flex items-start justify-between gap-3 py-1.5 text-sm ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
      <span className="text-slate-500">{label}</span>
      <span className={`text-right font-medium ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{display}</span>
    </div>
  );
}

function DashboardChipList({ items, darkMode }: { items: string[]; darkMode: boolean }) {
  if (!items.length) {
    return <p className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-400"}`}>—</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className={`rounded-md border px-2 py-1 text-xs font-medium ${
            darkMode ? "border-white/[0.08] bg-white/[0.04] text-slate-300" : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function riskBadgeClass(level: string, darkMode: boolean): string {
  const base = "text-xs px-2.5 py-1 rounded-full font-semibold border shrink-0";
  if (level === "urgent" || level === "critical") {
    return `${base} ${darkMode ? "bg-red-500/15 text-red-300 border-red-500/30" : "bg-red-50 text-red-700 border-red-200"}`;
  }
  if (level === "high") {
    return `${base} ${darkMode ? "bg-orange-500/15 text-orange-300 border-orange-500/30" : "bg-orange-50 text-orange-700 border-orange-200"}`;
  }
  if (level === "medium") {
    return `${base} ${darkMode ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200"}`;
  }
  return `${base} ${darkMode ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`;
}

export function AiIntakeDashboardPanel({
  dashboard,
  vm,
  darkMode,
  patientRiskLevel,
  footer,
}: {
  dashboard: DoctorDashboardJson | null | undefined;
  vm: ClinicalIntakeViewModel;
  darkMode: boolean;
  patientRiskLevel: DoctorPatientRiskLevel;
  footer?: React.ReactNode;
}) {
  const muted = "text-slate-500";
  const title = darkMode ? "text-white" : "text-slate-900";
  const body = darkMode ? "text-slate-300" : "text-slate-700";
  const subBox = darkMode
    ? "rounded-xl border border-white/[0.06] bg-[#0D1117]/60 px-3 py-3"
    : "rounded-xl border border-slate-100 bg-slate-50 px-3 py-3";
  const sectionLabel = `text-xs font-bold uppercase tracking-wide ${muted}`;
  const cardShell = [
    "overflow-hidden rounded-[20px] border shadow-[0_8px_30px_rgba(15,23,42,0.06)] p-5",
    darkMode ? "border-white/[0.06] bg-[#161B22]" : "border-slate-200/80 bg-white",
  ].join(" ");

  const patientComplaint =
    dashboard?.bir_qatorlik_xulosa?.trim() ||
    dashboard?.asosiy_shikoyat?.matn?.trim() ||
    (vm.patientComplaintLine !== "—" ? vm.patientComplaintLine : "");
  const oneLine = patientComplaint || "Shikoyat hali kiritilmagan";
  const riskLevel = dashboard?.xavf?.level ?? patientRiskLevel ?? "low";
  const borSimptomlar = dashboard?.bor_simptomlar ?? vm.suggestedFindings ?? [];
  const yetishmayotgan = dashboard?.yetishmayotgan_malumotlar ?? [];
  const doctorSummary = dashboard?.shifokor_uchun_ai_xulosa?.trim() || (vm.aiSummary !== "—" ? vm.aiSummary : "—");
  const qualityScore = dashboard?.malumot_sifati?.score ?? vm.dataCompletenessPct ?? 0;
  const qualityLevel =
    dashboard?.malumot_sifati?.level ?? (vm.dataCompletenessPct != null && vm.dataCompletenessPct < 50 ? "low" : "medium");
  const riskReason = dashboard?.xavf?.sababi?.trim() || vm.risk.desc || "—";

  return (
    <div className={cardShell}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              darkMode ? "bg-emerald-500/15" : "bg-emerald-50"
            }`}
          >
            <Brain className={`h-5 w-5 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`} />
          </div>
          <div>
            <h2 className={`text-lg font-semibold tracking-tight ${title}`}>AI Intake Dashboard</h2>
            <p className={`text-sm ${muted}`}>Yangi klinik JSON format</p>
          </div>
        </div>
        <span className={riskBadgeClass(riskLevel, darkMode)}>{riskLevel}</span>
      </div>

      <div className={`mb-4 ${subBox}`}>
        <p className={`mb-1.5 ${sectionLabel}`}>Bir qatorlik xulosa</p>
        <p className={`text-base font-medium leading-snug ${title}`}>{oneLine}</p>
        {dashboard?.eslatma?.trim() ? <p className={`mt-2 text-sm ${body}`}>{dashboard.eslatma}</p> : null}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className={subBox}>
          <p className={`mb-2 ${sectionLabel}`}>Asosiy shikoyat</p>
          <DashboardRow
            label="Matn"
            value={dashboard?.asosiy_shikoyat?.matn ?? (patientComplaint || vm.chiefComplaint)}
            darkMode={darkMode}
          />
          <DashboardRow label="Soha" value={dashboard?.asosiy_shikoyat?.soha ?? vm.complaintArea} darkMode={darkMode} />
          <DashboardRow label="Questionnaire" value={dashboard?.asosiy_shikoyat?.questionnaire} darkMode={darkMode} />
        </div>
        <div className={subBox}>
          <p className={`mb-2 ${sectionLabel}`}>Vaqt va og&apos;irlik</p>
          <DashboardRow label="Davomiyligi" value={dashboard?.vaqt_jadvali?.davomiyligi ?? vm.duration} darkMode={darkMode} />
          <DashboardRow
            label="Og'irlik"
            value={dashboard?.ogirlik_lokalizatsiya?.ogirlik_bali ?? (vm.painScore != null ? `${vm.painScore} / 10` : "—")}
            darkMode={darkMode}
          />
          <DashboardRow label="Lokalizatsiya" value={dashboard?.ogirlik_lokalizatsiya?.tafsilot ?? vm.localization} darkMode={darkMode} />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className={subBox}>
          <p className={`mb-2 ${sectionLabel}`}>Bor simptomlar</p>
          <DashboardChipList items={borSimptomlar} darkMode={darkMode} />
        </div>
        <div className={subBox}>
          <p className={`mb-2 ${sectionLabel}`}>Yetishmayotgan ma&apos;lumotlar</p>
          <DashboardChipList items={yetishmayotgan} darkMode={darkMode} />
        </div>
      </div>

      {footer ? <div className="mb-4">{footer}</div> : null}

      <div className={subBox}>
        <p className={`mb-2 ${sectionLabel}`}>Shifokor uchun AI xulosa</p>
        <p className={`text-sm leading-relaxed ${body}`}>{doctorSummary}</p>
        <div className="mt-3 grid grid-cols-1 gap-1 md:grid-cols-2">
          <DashboardRow label="Ma'lumot sifati" value={`${qualityScore} / ${qualityLevel}`} darkMode={darkMode} />
          <DashboardRow label="Xavf sababi" value={riskReason} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}
