import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import DocLayout from "@/pages/doctor/components/DocLayout";
import { useDoctorTheme } from "@/context/DoctorThemeContext";
import { useDocPatients } from "@/context/DocPatientsContext";
import { getDoctorPatientById } from "@/api/doctor";
import { getAiIntakeDashboard, type DoctorDashboardJson } from "@/api/services/medicalIntake.service";
import type { DoctorPatientDto as DocPatient } from "@/api/types/doctor.types";
import { ClinicalIntakePatientCard } from "./ClinicalIntakePatientCard";
import {
  JavoblarTahliliCard,
  ShifokorIzohlariCard,
  SuhbatTarixiCard,
  patientDetailBlockProps,
} from "./PatientDetailBlocks";

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

const aiConditions: Record<RiskLevel, string[]> = {
  low: ["Umumiy charchoq", "Stress reaktsiyasi", "Vitamin yetishmovchiligi"],
  medium: ["Arterial gipertenziya", "Vegetovascular distoniya", "Surunkali stress"],
  high: ["Yurak ishemik kasalligi", "Gipertenziv kriz", "Metabolik sindrom"],
  critical: ["Miokard infarkti (shubhali)", "O'tkir koronar sindrom", "Gipertenziv favqulodda holat"],
};

const aiActions: Record<RiskLevel, string[]> = {
  low: ["Qon tahlili buyurish", "Umumiy ko'rik o'tkazish", "1 oydan keyin qayta ko'rik"],
  medium: ["EKG o'tkazish", "Qon bosimini kuzatish", "Kardiolog konsultatsiyasi", "2 haftadan keyin qayta ko'rik"],
  high: ["Darhol EKG va EXO-KG", "Kardiolog konsultatsiyasi (bugun)", "Qon tahlillari (troponin, BNP)", "Kasalxonaga yotqizish ko'rib chiqilsin"],
  critical: ["DARHOL reanimatsiya bo'limiga", "Troponin, D-dimer tahlillari", "EKG monitoring", "Kardiolog va reanimatolog chaqirish"],
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

type DoctorPatientsTab = "queue" | "in_progress" | "completed";

const CANONICAL_DOCTOR_PATIENTS_TAB = "in_progress";
const DEFAULT_DOCTOR_PATIENTS_TAB: DoctorPatientsTab = "queue";

function normalizeDoctorPatientsTab(raw: string | null): DoctorPatientsTab {
  if (raw === "taxlil") return "in_progress";
  if (raw === "queue" || raw === "in_progress" || raw === "completed") return raw;
  return DEFAULT_DOCTOR_PATIENTS_TAB;
}

export function DocPatientDetailRouteContent() {
  return <PatientDetailGate withLayout={false} />;
}

export default function DocPatientDetailPage() {
  return <PatientDetailGate withLayout />;
}

function PatientDetailGate({ withLayout }: { withLayout: boolean }) {
  const { id } = useParams<{ id: string }>();
  const { patients } = useDocPatients();
  const patient = patients.find((p) => p.id === id);
  const [serverPatient, setServerPatient] = useState<DocPatient | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || patient) {
      setServerPatient(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setServerPatient(null);

    void (async () => {
      try {
        const detail = await getDoctorPatientById(id);
        if (!cancelled) setServerPatient(detail);
      } catch (err) {
        if (!cancelled) {
          console.warn("[doctor-detail] direct load failed", err);
          setServerPatient(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, patient]);

  const resolvedPatient = patient ?? serverPatient;
  const content = resolvedPatient ? (
    <PatientDetailContent patient={resolvedPatient} />
  ) : loading ? (
    <PatientDetailLoadingContent />
  ) : (
    <PatientNotFoundContent />
  );

  if (!withLayout) return content;

  return (
    <DocLayout title={resolvedPatient ? "Bemor Tafsiloti" : "Bemor topilmadi"}>
      {content}
    </DocLayout>
  );
}

function PatientDetailLoadingContent() {
  const { darkMode } = useDoctorTheme();
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div
        className={`h-10 w-10 animate-spin rounded-full border-2 border-t-transparent ${
          darkMode ? "border-violet-400" : "border-violet-600"
        }`}
      />
      <p className={`mt-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        Bemor ma'lumotlari yuklanmoqda...
      </p>
    </div>
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
  const { darkMode } = useDoctorTheme();
  const { transitionPatientStatus, updatePatient } = useDocPatients();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState(patient.notes || "");
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [detailFromServer, setDetailFromServer] = useState<DocPatient | null>(null);
  const [doctorDashboard, setDoctorDashboard] = useState<DoctorDashboardJson | null>(null);
  const rawListTab = searchParams.get("tab");
  const canonicalListTab = normalizeDoctorPatientsTab(rawListTab);

  useEffect(() => {
    if (rawListTab === canonicalListTab) return;
    const next = new URLSearchParams(searchParams);
    next.set("tab", canonicalListTab);
    setSearchParams(next, { replace: true });
  }, [rawListTab, canonicalListTab, searchParams, setSearchParams]);

  useEffect(() => {
    setDetailFromServer(null);
    setDoctorDashboard(null);
  }, [patient.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const detail = await getDoctorPatientById(patient.id);
        if (cancelled) return;
        setDetailFromServer(detail);
      } catch (err) {
        if (!cancelled) {
          console.warn("[doctor-detail] hydrate failed", err);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patient.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dashboard = await getAiIntakeDashboard(patient.id);
        if (!cancelled) setDoctorDashboard(dashboard);
      } catch (err) {
        if (!cancelled) console.warn("[doctor-detail] ai-intake dashboard failed", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patient.id]);

  const cardBase = darkMode ? "bg-[#21262D] border border-[#30363D]" : "bg-white border border-gray-100";
  const pageTitle = darkMode ? "text-white" : "text-gray-900";
  const pageMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const textBody = darkMode ? "text-gray-300" : "text-gray-700";
  const sectionTitle = darkMode ? "text-gray-200" : "text-gray-900";
  const labelSm = darkMode ? "text-gray-500" : "text-gray-600";
  const backBtn = darkMode
    ? "bg-[#21262D] border border-[#30363D] text-gray-300 hover:bg-[#21262D]"
    : "bg-white border border-gray-200 text-gray-500 hover:text-gray-700";
  const iconBox = darkMode ? "bg-[#21262D]" : "bg-gray-100";
  const textareaCls = darkMode
    ? "w-full text-sm border border-[#30363D] rounded-lg px-3 py-2.5 bg-[#0D1117] text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
    : "w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-violet-400 resize-none text-gray-700 placeholder-gray-400";
  const modalPanel = darkMode ? "bg-[#21262D] border border-[#30363D]" : "bg-white";
  const modalTitle = darkMode ? "text-white" : "text-gray-900";
  const btnSecondary = darkMode
    ? "border border-[#30363D] text-gray-200 hover:bg-[#21262D]"
    : "border border-gray-200 text-gray-600 hover:bg-gray-50";
  const disclaimer = darkMode
    ? "bg-amber-950/40 border border-amber-800/50 text-amber-200"
    : "bg-white/70 border border-amber-200 text-amber-700";

  const risk = riskConfig[patient.riskLevel];
  const conditions = aiConditions[patient.riskLevel];
  const actions = aiActions[patient.riskLevel];

  const showDoctorActions = !actionDone && (patient.status === "queue" || patient.status === "in_progress");

  const handleAction = (action: string) => {
    setShowConfirm(action);
  };

  const confirmAction = () => {
    if (!showConfirm) return;
    if (showConfirm === "test") {
      transitionPatientStatus(patient.id, "in_progress");
      setShowConfirm(null);
      navigate(`/doctor/patients?tab=${CANONICAL_DOCTOR_PATIENTS_TAB}`);
      return;
    }
    if (showConfirm === "diagnosed") {
      transitionPatientStatus(patient.id, "completed");
      if (notes !== patient.notes) {
        updatePatient(patient.id, { notes });
      }
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
    conditions,
    actions,
    notes,
    setNotes,
    showDoctorActions,
    handleAction,
    {
      aiAnalysisStructured: detailFromServer?.aiAnalysisStructured ?? patient.aiAnalysisStructured ?? null,
      aiStatus: detailFromServer?.aiStatus ?? patient.aiStatus ?? null,
      aiRiskLevel: detailFromServer?.aiRiskLevel ?? patient.aiRiskLevel ?? null,
      aiMessages: detailFromServer?.aiMessages ?? patient.aiMessages ?? [],
      doctorDashboard,
    },
  );

  return (
    <div className="w-full min-w-0 space-y-5">
      {actionDone && (
        <div className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${
            darkMode ? "border-emerald-500/30 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"
          }`}>
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full ${
              darkMode ? "bg-emerald-500/20" : "bg-emerald-100"
            }`}
          >
            <i className={`ri-checkbox-circle-line ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}></i>
          </div>
          <div>
            <p className={`text-sm font-semibold ${darkMode ? "text-emerald-200" : "text-emerald-800"}`}>
              {actionDone === "diagnosed" && "Ko'rikni tugatish deb belgilandi"}
              {actionDone === "test" && "Bemor tahlilga yuborildi"}
            </p>
            <p className={`text-xs ${darkMode ? "text-emerald-400/80" : "text-emerald-600"}`}>
              Holat muvaffaqiyatli yangilandi
            </p>
          </div>
        </div>
      )}

      <ClinicalIntakePatientCard
        blockProps={blockProps}
        onBack={() => navigate(`/doctor/patients?tab=${canonicalListTab}`)}
      >
        {(tab) => {
          if (tab === "responses") return <JavoblarTahliliCard {...blockProps} />;
          if (tab === "transcript") return <SuhbatTarixiCard {...blockProps} />;
          if (tab === "notes") return <ShifokorIzohlariCard {...blockProps} />;
          return null;
        }}
      </ClinicalIntakePatientCard>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className={`rounded-2xl p-6 w-full max-w-sm mx-4 ${modalPanel}`}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full ${
                  showConfirm === "test" ? "bg-blue-100" : "bg-green-100"
                }`}
              >
                <i
                  className={`text-lg ${
                    showConfirm === "test" ? "ri-flask-line text-blue-600" : "ri-checkbox-circle-line text-green-600"
                  }`}
                ></i>
              </div>
              <div>
                <h3 className={`text-base font-semibold ${modalTitle}`}>Tasdiqlash</h3>
                <p className={`text-sm ${pageMuted}`}>
                  {showConfirm === "diagnosed" && "Ko'rikni tugatish deb belgilansinmi?"}
                  {showConfirm === "test" && "Bemor tahlilga yuborilsinmi?"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(null)}
                className={`flex-1 py-2.5 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap ${btnSecondary}`}
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 py-2.5 rounded-lg text-sm text-white font-medium cursor-pointer transition-colors whitespace-nowrap ${
                  showConfirm === "test" ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"
                }`}
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
