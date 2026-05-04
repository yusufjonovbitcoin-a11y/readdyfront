import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export type OnboardingAnswers = Record<number, string>;

export type OnboardingStepDef = {
  question: string;
  options: string[];
};

export interface OnboardingWidgetProps {
  /** Bo‘sh qoldirilsa, tibbiy check-in uchun 3 qadam (i18n) ishlatiladi. */
  steps?: OnboardingStepDef[];
  onComplete: (answers: OnboardingAnswers) => void;
  onClose: () => void;
  className?: string;
}

function useDefaultSteps(t: (k: string, o?: object) => string): OnboardingStepDef[] {
  return useMemo(
    () => [
      {
        question: t("checkin:ai.onboarding.q0", { defaultValue: "Bugungi tashrif maqsadingiz nima?" }),
        options: [
          t("checkin:ai.onboarding.q0o0", { defaultValue: "Konsultatsiya / maslahat" }),
          t("checkin:ai.onboarding.q0o1", { defaultValue: "Navbat / qabul" }),
          t("checkin:ai.onboarding.q0o2", { defaultValue: "Boshqa" }),
        ],
      },
      {
        question: t("checkin:ai.onboarding.q1", { defaultValue: "Alomatlar qachon boshlangan?" }),
        options: [
          t("checkin:ai.onboarding.q1o0", { defaultValue: "Bugun" }),
          t("checkin:ai.onboarding.q1o1", { defaultValue: "So'nggi 1-3 kun" }),
          t("checkin:ai.onboarding.q1o2", { defaultValue: "Bir haftadan ko'proq" }),
        ],
      },
      {
        question: t("checkin:ai.onboarding.q2", { defaultValue: "Qanday yordam kutmoqdasiz?" }),
        options: [
          t("checkin:ai.onboarding.q2o0", { defaultValue: "AI tahlili va tushuntirish" }),
          t("checkin:ai.onboarding.q2o1", { defaultValue: "Navbat holati" }),
          t("checkin:ai.onboarding.q2o2", { defaultValue: "Umumiy savol" }),
        ],
      },
    ],
    [t],
  );
}

/**
 * AI bosqichidagi qisqa onboarding: har bosqichda bitta tanlov, yakunda `onComplete({ 0: "...", 1: "...", 2: "..." })`.
 */
export default function OnboardingWidget({
  steps: stepsProp,
  onComplete,
  onClose,
  className = "",
}: OnboardingWidgetProps) {
  const { t } = useTranslation("checkin");
  const defaultSteps = useDefaultSteps(t);
  const steps = stepsProp?.length ? stepsProp : defaultSteps;

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});

  const current = steps[stepIndex];
  const total = steps.length;
  const isLast = stepIndex >= total - 1;

  const pick = (option: string) => {
    const next = { ...answers, [stepIndex]: option };
    setAnswers(next);
    if (isLast) {
      onComplete(next);
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const skipAll = () => {
    onComplete({});
  };

  if (!current || total === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50/80 to-white p-4 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
            {t("checkin:ai.onboarding.title", { defaultValue: "Qisqa so'rovnoma" })}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={skipAll}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            {t("checkin:ai.onboarding.skip", { defaultValue: "O'tkazib yuborish" })}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
            aria-label={t("checkin:ai.onboarding.close", { defaultValue: "Yopish" })}
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>
      </div>

      <p className="text-sm font-medium text-gray-900 mb-3 leading-snug">{current.question}</p>

      <div className="flex flex-col gap-2">
        {current.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => pick(opt)}
            className="w-full text-left px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 hover:border-violet-300 hover:bg-violet-50/60 transition-colors cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex gap-1 justify-center mt-4">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${i === stepIndex ? "w-6 bg-violet-500" : "w-1.5 bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
}
