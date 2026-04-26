import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import PhoneStep from './components/PhoneStep';
import LanguageStep from './components/LanguageStep';
import type { CheckinLang } from './components/LanguageStep';
import QuestionsFlow from './components/QuestionsFlow';
import AIAssistStep from './components/AIAssistStep';
import ResultStep from './components/ResultStep';
import { clearCheckinDraft, submitCheckin } from "@/api/checkin";
import { getDoctors } from "@/api/doctor";
import type { DoctorDto } from "@/api/types/doctor.types";

type FlowStep = 'phone' | 'language' | 'questions' | 'ai' | 'result';
type SubmissionState = "idle" | "submitting" | "success" | "error";

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-xs">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-teal-50 mx-auto mb-4">
          <i className="ri-loader-4-line text-teal-500 text-2xl always-spin"></i>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Yuklanmoqda...</h2>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-xs">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-50 mx-auto mb-4">
          <i className="ri-error-warning-line text-red-500 text-2xl"></i>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Yuklashda xatolik</h2>
        <p className="text-sm text-gray-500 mb-4">Iltimos, qayta urinib ko'ring.</p>
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium cursor-pointer transition-colors"
        >
          Qayta urinish
        </button>
      </div>
    </div>
  );
}

function NotFoundState({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-xs">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-50 mx-auto mb-4">
          <i className="ri-error-warning-line text-red-500 text-2xl"></i>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function SubmittingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-xs">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-teal-50 mx-auto mb-4">
          <i className="ri-loader-4-line text-teal-500 text-2xl always-spin" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">So'rov yuborilmoqda...</h2>
        <p className="text-sm text-gray-500">Iltimos, biroz kuting.</p>
      </div>
    </div>
  );
}

function SubmitErrorState({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-xs">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-50 mx-auto mb-4">
          <i className="ri-error-warning-line text-red-500 text-2xl" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">So'rov yuborilmadi</h2>
        <p className="text-sm text-gray-500 mb-5">Ulanishda xatolik yuz berdi. Ma'lumotlaringiz saqlab qolindi.</p>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium cursor-pointer transition-colors"
          >
            Ortga
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium cursor-pointer transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckInPage() {
  const { t } = useTranslation("checkin");
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const doctorId =
    searchParams.get("doctor_id")?.trim() ??
    searchParams.get("doctorId")?.trim() ??
    searchParams.get("id")?.trim() ??
    "";
  const hasValidDoctorParam = doctorId.length > 0;
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const currentPathWithQuery = `${location.pathname}${location.search}`;
  const normalizeRouteToUrl = (value: string): URL | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      if (/^https?:\/\//i.test(trimmed)) {
        return new URL(trimmed);
      }
      const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
      return new URL(withLeadingSlash, "https://local.checkin");
    } catch {
      return null;
    }
  };
  const normalizeRouteLike = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const parsed = new URL(trimmed);
        return `${parsed.pathname}${parsed.search}`;
      } catch {
        return trimmed;
      }
    }
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  };
  const routeMatchesCurrent = (candidateRoute: string): boolean => {
    const candidateUrl = normalizeRouteToUrl(candidateRoute);
    const currentUrl = normalizeRouteToUrl(currentPathWithQuery);
    if (!candidateUrl || !currentUrl) return false;
    if (candidateUrl.pathname !== currentUrl.pathname) return false;

    const candidateDoctorId =
      candidateUrl.searchParams.get("doctor_id") ??
      candidateUrl.searchParams.get("doctorId") ??
      candidateUrl.searchParams.get("id");
    const currentDoctorId =
      currentUrl.searchParams.get("doctor_id") ??
      currentUrl.searchParams.get("doctorId") ??
      currentUrl.searchParams.get("id");

    if (candidateDoctorId) {
      return currentDoctorId === candidateDoctorId;
    }
    return true;
  };
  const doctorByRoute = doctors.find((candidate) => {
    const candidatePath = normalizeRouteLike(candidate.qrCode);
    return candidatePath.length > 0 && routeMatchesCurrent(candidatePath);
  });
  const doctor = hasValidDoctorParam
    ? doctors.find((d) => d.id === doctorId)
    : doctorByRoute;
  const resolvedDoctorId = doctor?.id ?? doctorId;
  const hasValidDoctorIdentifier = resolvedDoctorId.length > 0;

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await getDoctors();
        if (!active) return;
        setDoctors(data);
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Unknown load error");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const [step, setStep] = useState<FlowStep>('language');
  const [phone, setPhone] = useState('');
  const [resumeDraft, setResumeDraft] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [usedAI, setUsedAI] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");

  const submitFlow = async () => {
    if (!resolvedDoctorId) {
      setSubmissionState("error");
      return;
    }
    setSubmissionState("submitting");
    try {
      await submitCheckin({ phone, doctorId: resolvedDoctorId, answers });
      try {
        await clearCheckinDraft(phone);
      } catch {
        // Submission already succeeded; do not downgrade UX to error.
      }
      setSubmissionState("success");
      setStep('result');
    } catch {
      setSubmissionState("error");
    }
  };

  if (isLoading) return <LoadingState />;
  if (loadError) return <ErrorState onRetry={() => setLoadAttempt((prev) => prev + 1)} />;
  if (!hasValidDoctorIdentifier) {
    return (
      <NotFoundState
        title={t("notFound.title")}
        description={t("notFound.invalidDoctorParam", { defaultValue: "Noto'g'ri yoki yetishmayotgan shifokor identifikatori." })}
      />
    );
  }
  if (!doctor) return <NotFoundState title={t("notFound.title")} description={t("notFound.desc")} />;
  if (submissionState === "submitting") return <SubmittingState />;
  if (submissionState === "error") {
    return (
      <SubmitErrorState
        onRetry={() => {
          void submitFlow();
        }}
        onBack={() => {
          setSubmissionState("idle");
          setStep("ai");
        }}
      />
    );
  }

  const handleLanguageContinue = (_: CheckinLang) => {
    setStep('phone');
  };

  const handlePhoneContinue = (p: string, resume: boolean) => {
    setPhone(p);
    setResumeDraft(resume);
    setStep('questions');
  };

  const handleQuestionsComplete = (ans: Record<string, string | string[]>) => {
    setAnswers(ans);
    setStep('ai');
  };

  const handleAIFinish = (ai: boolean) => {
    setUsedAI(ai);
    void submitFlow();
  };

  const handleRestart = () => {
    setStep('language');
    setPhone('');
    setResumeDraft(false);
    setAnswers({});
    setUsedAI(false);
    setSubmissionState("idle");
  };

  return (
    <>
      {step === 'language' && (
        <LanguageStep
          onContinue={handleLanguageContinue}
          doctorName={doctor.name}
          doctorSpecialty={doctor.specialty}
          doctorAvatar={doctor.avatar}
        />
      )}
      {step === 'phone' && (
        <PhoneStep
          onContinue={handlePhoneContinue}
          onBack={() => setStep('language')}
          doctorName={doctor.name}
          doctorSpecialty={doctor.specialty}
          doctorAvatar={doctor.avatar}
        />
      )}
      {step === 'questions' && (
        <QuestionsFlow
          phone={phone}
          doctorId={resolvedDoctorId}
          resumeDraft={resumeDraft}
          onComplete={handleQuestionsComplete}
        />
      )}
      {step === 'ai' && (
        <AIAssistStep
          answers={answers}
          onFinish={handleAIFinish}
        />
      )}
      {step === 'result' && submissionState === "success" && (
        <ResultStep
          phone={phone}
          doctorName={doctor.name}
          doctorSpecialty={doctor.specialty}
          answers={answers}
          usedAI={usedAI}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
