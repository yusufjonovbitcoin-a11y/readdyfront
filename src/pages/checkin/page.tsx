import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import PhoneStep from './components/PhoneStep';
import LanguageStep from './components/LanguageStep';
import type { CheckinLang } from './components/LanguageStep';
import QuestionsFlow from './components/QuestionsFlow';
import AIAssistStep from './components/AIAssistStep';
import ResultStep from './components/ResultStep';
import { clearCheckinDraft, getCheckinDoctorProfile, submitCheckin } from "@/api/checkin";
import type { SubmitCheckinResult } from "@/api/types/checkin.types";

type FlowStep = 'phone' | 'language' | 'questions' | 'ai' | 'result';
type SubmissionState = "idle" | "submitting" | "success" | "error";

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
  const params = useParams<{ doctorId?: string }>();
  const [searchParams] = useSearchParams();
  const doctorId =
    params.doctorId?.trim() ??
    searchParams.get("doctor_id")?.trim() ??
    searchParams.get("doctorId")?.trim() ??
    searchParams.get("id")?.trim() ??
    "";
  const resolvedDoctorId = doctorId;
  const hasValidDoctorIdentifier = resolvedDoctorId.length > 0;
  const [doctor, setDoctor] = useState({
    id: resolvedDoctorId,
    name: searchParams.get("doctor_name")?.trim() || "Shifokor",
    specialty:
      searchParams.get("department")?.trim() ||
      searchParams.get("department_name")?.trim() ||
      searchParams.get("specialty")?.trim() ||
      params.departmentSlug?.trim() ||
      "Mutaxassis",
    specialization: searchParams.get("specialization")?.trim() || "",
    experience:
      searchParams.get("experience")?.trim() ||
      searchParams.get("tajriba")?.trim() ||
      "",
    avatar: searchParams.get("doctor_avatar")?.trim() || "",
  });

  const [step, setStep] = useState<FlowStep>('language');
  const [phone, setPhone] = useState('');
  const [resumeDraft, setResumeDraft] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [usedAI, setUsedAI] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [submissionResult, setSubmissionResult] = useState<SubmitCheckinResult | null>(null);

  useEffect(() => {
    if (!resolvedDoctorId) return;
    let cancelled = false;
    void (async () => {
      const profile = await getCheckinDoctorProfile(resolvedDoctorId);
      if (!profile || cancelled) return;
      setDoctor((prev) => ({
        ...prev,
        id: profile.id,
        name: profile.full_name?.trim() || prev.name,
        specialty: profile.department_name?.trim() || profile.specialization?.trim() || prev.specialty,
        specialization: profile.specialization?.trim() || prev.specialization,
        avatar: profile.avatar?.trim() || prev.avatar,
      }));
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedDoctorId]);

  const submitFlow = async () => {
    if (!resolvedDoctorId) {
      setSubmissionState("error");
      return;
    }
    setSubmissionState("submitting");
    try {
      const result = await submitCheckin({ phone, doctorId: resolvedDoctorId, answers });
      setSubmissionResult(result);
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

  if (!hasValidDoctorIdentifier) {
    return (
      <NotFoundState
        title={t("notFound.title")}
        description={t("notFound.invalidDoctorParam", { defaultValue: "Noto'g'ri yoki yetishmayotgan shifokor identifikatori." })}
      />
    );
  }
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
    setSubmissionResult(null);
    setSubmissionState("idle");
  };

  return (
    <>
      {step === 'language' && (
        <LanguageStep
          onContinue={handleLanguageContinue}
          doctorName={doctor.name}
          doctorSpecialty={doctor.specialty}
          doctorSpecialization={doctor.specialization}
          doctorExperience={doctor.experience}
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
          submissionResult={submissionResult}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
