import { useState, useEffect, useCallback } from 'react';
import { checkinQuestions, CheckinQuestion } from '@/mocks/checkin_questions';
import BodyMap from './BodyMap';

interface QuestionsFlowProps {
  phone: string;
  doctorId: string;
  resumeDraft: boolean;
  onComplete: (answers: Record<string, string | string[]>) => void;
}

export default function QuestionsFlow({ phone, doctorId, resumeDraft, onComplete }: QuestionsFlowProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const getVisibleQuestions = useCallback((ans: Record<string, string | string[]>): CheckinQuestion[] => {
    return checkinQuestions.filter(q => {
      if (!q.conditionalOn) return true;
      const depAnswer = ans[q.conditionalOn.questionId];
      return depAnswer === q.conditionalOn.answer;
    });
  }, []);

  const visibleQuestions = getVisibleQuestions(answers);
  const currentQuestion = visibleQuestions[currentIndex];
  const progress = Math.round(((currentIndex) / visibleQuestions.length) * 100);

  // Load draft on mount
  useEffect(() => {
    if (resumeDraft) {
      try {
        const key = `draft_${phone}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.doctorId === doctorId) {
            setAnswers(parsed.answers || {});
            setCurrentIndex(parsed.currentStep || 0);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [resumeDraft, phone, doctorId]);

  // Auto-save draft
  useEffect(() => {
    if (Object.keys(answers).length === 0 && currentIndex === 0) return;
    const key = `draft_${phone}`;
    const draft = {
      phone,
      doctorId,
      answers,
      currentStep: currentIndex,
      answersCount: Object.keys(answers).length,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(draft));
  }, [answers, currentIndex, phone, doctorId]);

  const navigate = (dir: 'forward' | 'back') => {
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      if (dir === 'forward') {
        if (currentIndex < visibleQuestions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          // Clear draft on completion
          localStorage.removeItem(`draft_${phone}`);
          onComplete(answers);
        }
      } else {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
      }
      setTextInput('');
      setAnimating(false);
    }, 200);
  };

  const handleAnswer = (answer: string | string[]) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);
    if (currentQuestion.type !== 'text' && currentQuestion.type !== 'body_map') {
      setTimeout(() => navigate('forward'), 300);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim() || !currentQuestion.required) {
      if (textInput.trim()) {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: textInput.trim() }));
      }
      navigate('forward');
    }
  };

  const handleSkip = () => {
    navigate('forward');
  };

  if (!currentQuestion) return null;

  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex flex-col">
      {/* Progress header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => currentIndex > 0 && navigate('back')}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
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
              <p className="text-xs text-gray-400 mt-1">Ixtiyoriy savol</p>
            )}
          </div>

          {/* Answer options */}
          <div className="space-y-3">
            {/* YES/NO */}
            {currentQuestion.type === 'yes_no' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'yes', label: 'Ha', icon: 'ri-check-line', color: 'teal' },
                  { value: 'no', label: 'Yo\'q', icon: 'ri-close-line', color: 'gray' },
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
                {currentQuestion.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full px-4 py-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${
                      currentAnswer === opt
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span>{opt}</span>
                    {currentAnswer === opt && (
                      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-teal-500">
                        <i className="ri-check-line text-white text-xs"></i>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* TEXT */}
            {currentQuestion.type === 'text' && (
              <div className="space-y-3">
                <textarea
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 text-sm outline-none transition-colors resize-none bg-white"
                  rows={4}
                  placeholder="Javobingizni yozing..."
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{textInput.length}/500</span>
                  <div className="flex gap-2">
                    {!currentQuestion.required && (
                      <button
                        onClick={handleSkip}
                        className="px-4 h-10 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        O'tkazib yuborish
                      </button>
                    )}
                    <button
                      onClick={handleTextSubmit}
                      className="px-5 h-10 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Davom etish
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
                  onChange={parts => setAnswers(prev => ({ ...prev, [currentQuestion.id]: parts }))}
                />
                <div className="flex gap-2">
                  {!currentQuestion.required && (
                    <button
                      onClick={handleSkip}
                      className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      O'tkazib yuborish
                    </button>
                  )}
                  <button
                    onClick={() => navigate('forward')}
                    className="flex-1 h-11 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Davom etish
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
            Javoblaringiz avtomatik saqlanmoqda
          </p>
        </div>
      </div>
    </div>
  );
}
