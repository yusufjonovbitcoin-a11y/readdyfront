import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { useDocPatients } from "@/context/DocPatientsContext";
import type { DoctorPatientDto as DocPatient } from "@/api/types/doctor.types";
import {
  AiTavsiyaCard,
  BemorVaAmallarGrid,
  JavoblarTahliliCard,
  ShifokorIzohlariCard,
  patientDetailBlockProps,
} from "./PatientDetailBlocks";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type RiskLevel = DocPatient["riskLevel"];

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string; border: string; icon: string; desc: string }> = {
  low: {
    label: "Past Xavf",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "ri-shield-check-line",
    desc: "Bemor holati barqaror. Oddiy ko'rik va kuzatuv tavsiya etiladi.",
  },
  medium: {
    label: "O'rta Xavf",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "ri-shield-line",
    desc: "Bir nechta xavf omillari aniqlandi. Qo'shimcha tekshiruvlar tavsiya etiladi.",
  },
  high: {
    label: "Yuqori Xavf",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: "ri-shield-flash-line",
    desc: "Jiddiy xavf omillari mavjud. Zudlik bilan tibbiy aralashuv talab etiladi.",
  },
  critical: {
    label: "Kritik Xavf",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "ri-alarm-warning-line",
    desc: "SHOSHILINCH! Darhol tibbiy yordam ko'rsatilishi shart.",
  },
};

/** AI kartasi fonini boshqa kartalar bilan bir xil qilish; xavf rangi faqat chap border + badge */
const riskAccent: Record<RiskLevel, { left: string; badge: string }> = {
  low: {
    left: "border-l-green-500",
    badge: "bg-green-900/35 text-green-200 border-green-700/40",
  },
  medium: {
    left: "border-l-amber-500",
    badge: "bg-amber-900/35 text-amber-200 border-amber-700/40",
  },
  high: {
    left: "border-l-orange-500",
    badge: "bg-orange-900/35 text-orange-200 border-orange-700/40",
  },
  critical: {
    left: "border-l-red-500",
    badge: "bg-red-900/35 text-red-200 border-red-700/40",
  },
};

type PatientDetailTab = "javoblar" | "ai" | "izohlar" | "bemor";
type DoctorPatientsTab = "queue" | "in_progress" | "completed";

const PATIENT_DETAIL_TAB_DEFS: { key: PatientDetailTab; label: string; icon: string }[] = [
  { key: "javoblar", label: "Javoblar", icon: "ri-questionnaire-line" },
  { key: "ai", label: "AI tavsiya", icon: "ri-robot-line" },
  { key: "izohlar", label: "Izohlar", icon: "ri-edit-2-line" },
  { key: "bemor", label: "Bemor", icon: "ri-user-line" },
];

const CANONICAL_DOCTOR_PATIENTS_TAB = "in_progress";
const DEFAULT_DOCTOR_PATIENTS_TAB: DoctorPatientsTab = "queue";

function normalizeDoctorPatientsTab(raw: string | null): DoctorPatientsTab {
  if (raw === "taxlil") return "in_progress";
  if (raw === "queue" || raw === "in_progress" || raw === "completed") return raw;
  return DEFAULT_DOCTOR_PATIENTS_TAB;
}

export function DocPatientDetailRouteContent() {
  const { id } = useParams<{ id: string }>();
  const { patients } = useDocPatients();
  const patient = patients.find((p) => p.id === id);

  if (!patient) {
    return <PatientNotFoundContent />;
  }

  return <PatientDetailContent patient={patient} />;
}

export default function DocPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { patients } = useDocPatients();
  const patient = patients.find((p) => p.id === id);

  if (!patient) {
    return (
      <DocLayout title="Bemor topilmadi">
        <PatientNotFoundContent />
      </DocLayout>
    );
  }

  return (
    <DocLayout title="Bemor Tafsiloti">
      <PatientDetailContent patient={patient} />
    </DocLayout>
  );
}

export function PatientNotFoundContent() {
  const { darkMode } = useDoctorTheme();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <i className={`ri-user-unfollow-line text-4xl mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`}></i>
      <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Bemor ma'lumotlari topilmadi</p>
      <button
        onClick={() => navigate("/doctor/patients")}
        className={`mt-4 text-sm cursor-pointer ${darkMode ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"}`}
      >
        Orqaga qaytish
      </button>
    </div>
  );
}

export function PatientDetailContent({ patient }: { patient: DocPatient }) {
  const { darkMode, patientDetailLayout } = useDoctorTheme();
  const { transitionPatientStatus, updatePatient } = useDocPatients();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState(patient.notes || "");
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<PatientDetailTab>("javoblar");
  const canShowNotes = patient.status === "in_progress";
  const rawListTab = searchParams.get("tab");
  const canonicalListTab = normalizeDoctorPatientsTab(rawListTab);

  useEffect(() => {
    if (rawListTab === canonicalListTab) return;
    const next = new URLSearchParams(searchParams);
    next.set("tab", canonicalListTab);
    setSearchParams(next, { replace: true });
  }, [rawListTab, canonicalListTab, searchParams, setSearchParams]);

  useEffect(() => {
    setDetailTab("javoblar");
  }, [patient.id]);
  useEffect(() => {
    if (!canShowNotes && detailTab === "izohlar") {
      setDetailTab("javoblar");
    }
  }, [canShowNotes, detailTab]);

  const cardBase = darkMode ? "bg-[#161B22] border border-[#30363D]" : "bg-white border border-gray-100";
  const pageTitle = darkMode ? "text-white" : "text-gray-900";
  const pageMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const textBody = darkMode ? "text-gray-300" : "text-gray-700";
  const sectionTitle = darkMode ? "text-gray-200" : "text-gray-900";
  const labelSm = darkMode ? "text-gray-500" : "text-gray-600";
  const backBtn = darkMode
    ? "bg-[#161B22] border border-[#30363D] text-gray-300 hover:bg-[#21262D]"
    : "bg-white border border-gray-200 text-gray-500 hover:text-gray-700";
  const iconBox = darkMode ? "bg-[#21262D]" : "bg-gray-100";
  const textareaCls = darkMode
    ? "w-full text-sm border border-[#30363D] rounded-lg px-3 py-2.5 bg-[#0D1117] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
    : "w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-violet-400 resize-none text-gray-700 placeholder-gray-400";
  const disclaimer = darkMode
    ? "bg-amber-950/40 border border-amber-800/50 text-amber-200"
    : "bg-white/70 border border-amber-200 text-amber-700";

  const risk = riskConfig[patient.riskLevel];

  const showDoctorActions = !actionDone && (patient.status === "queue" || patient.status === "in_progress");

  const handleAction = (action: string) => {
    setShowConfirm(action);
  };

  const confirmAction = async () => {
    if (!showConfirm) return;
    if (showConfirm === "test") {
      await transitionPatientStatus(patient.id, "in_progress");
      setShowConfirm(null);
      navigate(`/doctor/patients?tab=${CANONICAL_DOCTOR_PATIENTS_TAB}`);
      return;
    }
    if (showConfirm === "diagnosed") {
      await transitionPatientStatus(patient.id, "completed", {
        notes,
        diagnosis: patient.diagnosis || "Ko'rik yakunlandi",
        consultationDuration: patient.consultationDuration > 0 ? patient.consultationDuration : 15,
      });
      if (notes !== patient.notes) updatePatient(patient.id, { notes });
      navigate("/doctor/patients?tab=completed");
    }
    setActionDone(showConfirm);
    setShowConfirm(null);
  };

  const blockProps = patientDetailBlockProps(
    patient,
    {
      cardBase,
      pageTitle,
      pageMuted,
      textBody,
      sectionTitle,
      labelSm,
      darkMode,
      iconBox,
      textareaCls,
      disclaimer,
    },
    risk,
    riskAccent,
    patient.aiSummary ?? "",
    notes,
    setNotes,
    showDoctorActions,
    handleAction,
  );

  return (
    <div className="w-full min-w-0 space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/doctor/patients?tab=${canonicalListTab}`)}
          aria-label="Bemorlar ro'yxatiga qaytish"
          className={`w-11 h-11 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${backBtn}`}
        >
          <i className="ri-arrow-left-line text-base" aria-hidden="true"></i>
        </button>
        <div>
          <h2 className={`text-xl font-bold ${pageTitle}`}>{patient.name}</h2>
          <p className={`text-sm ${pageMuted}`}>
            {patient.age} yosh • {patient.gender === "male" ? "Erkak" : "Ayol"} • {patient.phone}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-semibold border ${risk.bg} ${risk.color} ${risk.border}`}>
            <i className={`${risk.icon} text-sm`}></i>
            {risk.label}
          </span>
        </div>
      </div>

      {actionDone && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100">
            <i className="ri-checkbox-circle-line text-green-600"></i>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">
              {actionDone === "diagnosed" && "Ko'rikni tugatish deb belgilandi"}
              {actionDone === "test" && "Bemor tahlilga yuborildi"}
            </p>
            <p className="text-xs text-green-600">Holat muvaffaqiyatli yangilandi</p>
          </div>
        </div>
      )}

      {patientDetailLayout === "scroll" ? (
        <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-3">
            <JavoblarTahliliCard {...blockProps} />
          </div>

          <div className="min-w-0 space-y-5 lg:col-span-3">
            <AiTavsiyaCard {...blockProps} />
            {canShowNotes && <ShifokorIzohlariCard {...blockProps} />}
            <BemorVaAmallarGrid {...blockProps} />
          </div>
        </div>
      ) : (
        <>
          <div
            className={`flex items-center gap-1 border-b ${darkMode ? "border-[#30363D]" : "border-gray-200"} overflow-x-auto`}
          >
            {PATIENT_DETAIL_TAB_DEFS.filter((t) => canShowNotes || t.key !== "izohlar").map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setDetailTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  detailTab === t.key
                    ? "border-violet-500 text-violet-400"
                    : `border-transparent ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`
                }`}
              >
                <span className="w-4 h-4 flex items-center justify-center" aria-hidden>
                  <i className={`${t.icon} text-sm`}></i>
                </span>
                {t.label}
              </button>
            ))}
          </div>

          {detailTab === "javoblar" && <JavoblarTahliliCard {...blockProps} />}
          {detailTab === "ai" && <AiTavsiyaCard {...blockProps} />}
          {detailTab === "izohlar" && canShowNotes && <ShifokorIzohlariCard {...blockProps} />}
          {detailTab === "bemor" && <BemorVaAmallarGrid {...blockProps} />}
        </>
      )}

      <ConfirmDialog
        open={Boolean(showConfirm)}
        title="Tasdiqlash"
        description={showConfirm === "test" ? "Bemor tahlilga yuborilsinmi?" : "Ko'rikni tugatish deb belgilansinmi?"}
        confirmText="Tasdiqlash"
        cancelText="Bekor qilish"
        onConfirm={() => void confirmAction()}
        onCancel={() => setShowConfirm(null)}
        darkMode={darkMode}
      />
    </div>
  );
}
