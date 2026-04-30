import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback, useMemo, useReducer, useRef } from "react";
import {
  getCheckinDraft,
  getCheckinQuestions,
  saveCheckinDraft,
} from "@/api/checkin";
import type { CheckinQuestionDto as CheckinQuestion } from "@/api/types/checkin.types";
import BodyMap from "./BodyMap";

interface QuestionsFlowProps {
  phone: string;
  doctorId: string;
  resumeDraft: boolean;
  onComplete: (answers: Record<string, string | string[]>) => void;
}

type FlowState = {
  answers: Record<string, string | string[]>;
  currentQuestionId: string | null;
  textInput: string;
};

type FlowAction =
  | { type: "restore"; answers: Record<string, string | string[]>; currentQuestionId: string | null }
  | { type: "set_question"; questionId: string | null }
  | { type: "set_answer"; questionId: string; answer: string | string[] }
  | { type: "set_text"; value: string }
  | { type: "clear_text" };

const initialFlowState: FlowState = {
  answers: {},
  currentQuestionId: null,
  textInput: "",
};

function clampIndex(index: number, length: number) {
  const maxIndex = Math.max(length - 1, 0);
  return Math.min(Math.max(index, 0), maxIndex);
}

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  if (action.type === "restore") {
    return {
      answers: action.answers,
      currentQuestionId: action.currentQuestionId,
      textInput: "",
    };
  }

  if (action.type === "set_question") {
    if (state.currentQuestionId === action.questionId) return state;
    return { ...state, currentQuestionId: action.questionId };
  }

  if (action.type === "set_answer") {
    return {
      ...state,
      answers: { ...state.answers, [action.questionId]: action.answer },
    };
  }

  if (action.type === "set_text") {
    return { ...state, textInput: action.value };
  }

  return { ...state, textInput: "" };
}

export default function QuestionsFlow({ phone, doctorId, resumeDraft, onComplete }: QuestionsFlowProps) {
  const { t, i18n } = useTranslation("checkin");
  const [checkinQuestions, setCheckinQuestions] = useState<CheckinQuestion[]>([]);
  const [questionsLoadStatus, setQuestionsLoadStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [state, dispatch] = useReducer(flowReducer, initialFlowState);
  const { answers, currentQuestionId, textInput } = state;
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const navigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoForwardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noVisibleQuestionsHandledRef = useRef(false);
  const visibleQuestionsRef = useRef<CheckinQuestion[]>([]);
  const currentIndexRef = useRef(0);
  const answersRef = useRef<Record<string, string | string[]>>({});

  useEffect(() => {
    let mounted = true;
    void (async () => {
      setQuestionsLoadStatus("loading");
      try {
        const questions = await getCheckinQuestions(doctorId, t);
        if (!mounted) return;
        setCheckinQuestions(questions);
        setQuestionsLoadStatus("ready");
      } catch {
        if (!mounted) return;
        setCheckinQuestions([]);
        setQuestionsLoadStatus("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [doctorId, t, i18n.language, loadAttempt]);

  const getVisibleQuestions = useCallback((ans: Record<string, string | string[]>): CheckinQuestion[] => {
    return checkinQuestions.filter(q => {
      if (!q.conditionalOn) return true;
      const depAnswer = ans[q.conditionalOn.questionId];
      return depAnswer === q.conditionalOn.answer;
    });
  }, [checkinQuestions]);

  const visibleQuestions = useMemo(() => getVisibleQuestions(answers), [answers, getVisibleQuestions]);
  const currentIndex = useMemo(() => {
    if (visibleQuestions.length === 0) return 0;
    if (!currentQuestionId) return 0;
    const index = visibleQuestions.findIndex((q) => q.id === currentQuestionId);
    return index === -1 ? 0 : index;
  }, [currentQuestionId, visibleQuestions]);
  const currentQuestion = visibleQuestions[currentIndex] ?? null;
  // Keep denominator >= 1 to avoid NaN when dynamic filtering returns no visible questions.
  const total = Math.max(visibleQuestions.length, 1);
  const progress = Math.round((currentIndex / total) * 100);

  useEffect(() => {
    visibleQuestionsRef.current = visibleQuestions;
  }, [visibleQuestions]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (questionsLoadStatus !== "ready") return;
    if (checkinQuestions.length === 0) return;
    if (visibleQuestions.length > 0) {
      noVisibleQuestionsHandledRef.current = false;
      return;
    }
    if (noVisibleQuestionsHandledRef.current) return;
    noVisibleQuestionsHandledRef.current = true;
    onComplete(answers);
  }, [answers, checkinQuestions.length, onComplete, questionsLoadStatus, visibleQuestions.length]);

  // Load draft on mount
  useEffect(() => {
    if (resumeDraft) {
      void (async () => {
        try {
          const parsed = await getCheckinDraft(phone);
          if (!parsed || parsed.doctorId !== doctorId) return;
          const restoredAnswers = parsed.answers || {};
          const restoredVisible = getVisibleQuestions(restoredAnswers);
          const persistedQuestionId =
            typeof parsed.currentQuestionId === "string" ? parsed.currentQuestionId : null;
          const hasPersistedQuestionId =
            persistedQuestionId !== null && restoredVisible.some((q) => q.id === persistedQuestionId);
          const rawStep = Number(parsed.currentStep);
          const restoredStep = Number.isFinite(rawStep) ? rawStep : 0;
          const restoredIndex = clampIndex(restoredStep, restoredVisible.length);
          const fallbackQuestionId = restoredVisible[restoredIndex]?.id ?? restoredVisible[0]?.id ?? null;
          dispatch({
            type: "restore",
            answers: restoredAnswers,
            currentQuestionId: hasPersistedQuestionId ? persistedQuestionId : fallbackQuestionId,
          });
        } catch {
          // ignore
        }
      })();
    }
  }, [resumeDraft, phone, doctorId, getVisibleQuestions]);

  useEffect(() => {
    if (visibleQuestions.length === 0) {
      if (currentQuestionId !== null) {
        dispatch({ type: "set_question", questionId: null });
      }
      return;
    }

    const stillVisible =
      currentQuestionId !== null && visibleQuestions.some((question) => question.id === currentQuestionId);

    if (!stillVisible) {
      dispatch({ type: "set_question", questionId: visibleQuestions[0].id });
    }
  }, [visibleQuestions, currentQuestionId]);

  // Auto-save draft
  useEffect(() => {
    if (Object.keys(answers).length === 0 && currentIndex === 0) return;
    const draft = {
      phone,
      doctorId,
      answers,
      currentQuestionId,
      currentStep: currentIndex,
      answersCount: Object.keys(answers).length,
      updatedAt: new Date().toISOString(),
    };
    void saveCheckinDraft(draft);
  }, [answers, currentIndex, phone, doctorId, currentQuestionId]);

  const navigate = useCallback((dir: 'forward' | 'back') => {
    if (navigateTimerRef.current) {
      clearTimeout(navigateTimerRef.current);
    }

    setDirection(dir);
    setAnimating(true);
    navigateTimerRef.current = setTimeout(() => {
      navigateTimerRef.current = null;
      const latestVisibleQuestions = visibleQuestionsRef.current;
      const latestIndex = currentIndexRef.current;

      if (dir === 'forward') {
        if (latestIndex < latestVisibleQuestions.length - 1) {
          dispatch({ type: "set_question", questionId: latestVisibleQuestions[latestIndex + 1].id });
        } else {
          onComplete(answersRef.current);
        }
      } else {
        if (latestIndex > 0) {
          dispatch({ type: "set_question", questionId: latestVisibleQuestions[latestIndex - 1].id });
        }
      }
      dispatch({ type: "clear_text" });
      setAnimating(false);
    }, 200);
  }, [onComplete]);

  useEffect(() => {
    return () => {
      if (navigateTimerRef.current) {
        clearTimeout(navigateTimerRef.current);
      }
      if (autoForwardTimerRef.current) {
        clearTimeout(autoForwardTimerRef.current);
      }
    };
  }, []);

  const handleAnswer = (answer: string | string[]) => {
    if (!currentQuestion) return;

    dispatch({ type: "set_answer", questionId: currentQuestion.id, answer });

    if (currentQuestion.type !== 'text' && currentQuestion.type !== 'body_map') {
      if (autoForwardTimerRef.current) {
        clearTimeout(autoForwardTimerRef.current);
      }
      autoForwardTimerRef.current = setTimeout(() => {
        autoForwardTimerRef.current = null;
        navigate('forward');
      }, 300);
    }
  };

  const handleTextSubmit = () => {
    if (!currentQuestion) return;

    if (textInput.trim() || !currentQuestion.required) {
      if (textInput.trim()) {
        dispatch({ type: "set_answer", questionId: currentQuestion.id, answer: textInput.trim() });
      }
      navigate('forward');
    }
  };

  const handleSkip = () => {
    navigate('forward');
  };

  if (questionsLoadStatus === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="text-center">
          <i className="ri-loader-4-line text-teal-500 text-2xl always-spin" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-gray-600">{t("questions.loading")}</p>
        </div>
      </div>
    );
  }

  if (questionsLoadStatus === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="text-center max-w-xs">
          <i className="ri-error-warning-line text-red-500 text-2xl" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-gray-700">{t("questions.loadErrorTitle")}</p>
          <p className="mt-1 text-xs text-gray-500">{t("questions.loadErrorDesc")}</p>
          <button
            type="button"
            onClick={() => setLoadAttempt((prev) => prev + 1)}
            className="mt-4 px-4 min-h-[44px] rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            {t("questions.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (checkinQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <p className="text-sm font-medium text-gray-600">{t("questions.empty")}</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <p className="text-sm font-medium text-gray-600">{t("questions.emptyVisible")}</p>
      </div>
    );
  }

  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex flex-col">
      {/* Progress header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => currentIndex > 0 && navigate('back')}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                currentIndex > 0 ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <i className="ri-arrow-left-line text-base"></i>
            </button>
            <div className="text-center">
              <span className="text-xs font-semibold text-gray-900">{currentIndex + 1} / {visibleQuestions.length}</span>
              <p className="text-xs text-gray-400">{currentQuestion.category}</p>
            </div>
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-xs font-bold text-teal-600">{progress}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 flex flex-col justify-center px-4 py-6">
        <div
          className={`max-w-sm mx-auto w-full transition-all duration-200 ${
            animating
              ? direction === 'forward' ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4'
              : 'opacity-100 translate-x-0'
          }`}
        >
          {/* Question */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-600 text-xs font-medium mb-3">
              <i className="ri-question-line text-xs"></i>
              {currentQuestion.category}
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{currentQuestion.text}</h2>
            {!currentQuestion.required && (
              <p className="text-xs text-gray-400 mt-1">{t("questions.optional")}</p>
            )}
          </div>

          {/* Answer options */}
          <div className="space-y-3">
            {/* YES/NO */}
            {currentQuestion.type === 'yes_no' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "yes", label: t("questions.yes"), icon: "ri-check-line", color: "teal" },
                  { value: "no", label: t("questions.no"), icon: "ri-close-line", color: "gray" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    className={`h-16 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      currentAnswer === opt.value
                        ? opt.color === 'teal'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-400 bg-gray-50 text-gray-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <i className={`${opt.icon} text-xl`}></i>
                    <span className="text-sm font-semibold">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* SELECT */}
            {currentQuestion.type === 'select' && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((opt) => {
                  const normalized = typeof opt === "string" ? { value: opt, label: opt } : opt;
                  return (
                  <button
                    key={normalized.value}
                    onClick={() => handleAnswer(normalized.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${
                      currentAnswer === normalized.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span>{normalized.label}</span>
                    {currentAnswer === normalized.value && (
                      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-teal-500">
                        <i className="ri-check-line text-white text-xs"></i>
                      </div>
                    )}
                  </button>
                )})}
              </div>
            )}

            {/* TEXT */}
            {currentQuestion.type === 'text' && (
              <div className="space-y-3">
                <textarea
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 text-sm outline-none transition-colors resize-none bg-white"
                  rows={4}
                  placeholder={t("questions.answerPlaceholder")}
                  value={textInput}
                  onChange={e => dispatch({ type: "set_text", value: e.target.value })}
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{textInput.length}/500</span>
                  <div className="flex gap-2">
                    {!currentQuestion.required && (
                      <button
                        onClick={handleSkip}
                        className="px-4 min-h-[44px] rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {t("questions.skip")}
                      </button>
                    )}
                    <button
                      onClick={handleTextSubmit}
                      className="px-5 min-h-[44px] rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t("questions.continue")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* BODY MAP */}
            {currentQuestion.type === 'body_map' && (
              <div className="space-y-4">
                <BodyMap
                  selected={Array.isArray(currentAnswer) ? currentAnswer as string[] : []}
                  onChange={parts => dispatch({ type: "set_answer", questionId: currentQuestion.id, answer: parts })}
                />
                <div className="flex gap-2">
                  {!currentQuestion.required && (
                    <button
                      onClick={handleSkip}
                      className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t("questions.skip")}
                    </button>
                  )}
                  <button
                    onClick={() => navigate('forward')}
                    className="flex-1 h-11 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {t("questions.continue")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="px-4 pb-6">
        <div className="max-w-sm mx-auto">
          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
            <i className="ri-save-line text-xs"></i>
            {t("questions.autosave")}
          </p>
        </div>
      </div>
    </div>
  );
}
