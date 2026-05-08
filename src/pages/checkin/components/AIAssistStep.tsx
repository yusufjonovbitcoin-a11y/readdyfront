import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { QuestionDto } from '@/api/services/medicalIntake.service';
import { postAiIntakeMessage, postAiIntakeStart } from '@/api/services/medicalIntake.service';
import type { CheckinChatMessageInput, CheckinInteractiveQuestionDto } from '@/api/types/checkin.types';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

interface AIAssistStepProps {
  doctorId: string;
  checkinToken?: string;
  answers: Record<string, string | string[]>;
  patientLanguage?: string;
  doctorLanguage?: string;
  visitId?: string;
  potientResponseId?: string;
  onFinish: (
    usedAI: boolean,
    aiSummary?: string,
    chatMessages?: CheckinChatMessageInput[],
  ) => void;
}

/** Map QuestionRules-linked DB question (+ options) to dock single-choice widget. */
function mapDbQuestionToDock(q: QuestionDto | null | undefined): CheckinInteractiveQuestionDto | null {
  if (!q?.text?.trim()) return null;
  const qt = String(q.type ?? 'TEXT').toUpperCase();
  const qAny = q as QuestionDto & {
    allow_custom_input?: boolean;
    custom_placeholder?: string;
  };
  const rawOpts = q.question_options ?? [];
  const opts = [...rawOpts]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((o) => {
      const label = (o.text ?? '').trim();
      const value = ((o.value ?? o.text ?? '') as string).trim() || label;
      return { value, label };
    })
    .filter((o) => o.label.length > 0 && o.value.length > 0);

  if ((qt === 'SELECT' || qt === 'RADIO') && opts.length >= 2) {
    return {
      type: 'question',
      message: q.text.trim(),
      inputType: 'single_choice',
      options: opts.slice(0, 12),
      allowCustomAnswer: Boolean(qAny.allow_custom_input),
      customPlaceholder: qAny.custom_placeholder?.trim() || undefined,
    };
  }
  return null;
}

function getAiErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const message = (error as { message: string }).message.trim();
    if (message) return message;
  }
  return fallback;
}

function toCompactChatQuestion(text: string): string {
  const raw = text.trim();
  if (!raw) return raw;
  const normalized = raw.replace(/\s+/g, ' ').trim();
  const firstSentence = normalized.split('?')[0]?.trim();
  if (firstSentence && firstSentence.length >= 12) {
    const compact = `${firstSentence}?`;
    return compact.length > 95 ? `${compact.slice(0, 92).trim()}...` : compact;
  }
  return normalized.length > 95 ? `${normalized.slice(0, 92).trim()}...` : normalized;
}

function AiAvatar({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm ring-1 ring-white/20 ${className}`}
    >
      <i className="ri-sparkling-2-line text-white text-sm" />
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="inline-flex items-center rounded-2xl rounded-tl-md bg-slate-100/90 border border-slate-200/60 shadow-sm px-4 py-3.5 min-w-[52px]">
      <div className="flex items-center gap-[5px] py-0.5">
        <span className="inline-block w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-duration:1.05s]" />
        <span
          className="inline-block w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-duration:1.05s]"
          style={{ animationDelay: '160ms' }}
        />
        <span
          className="inline-block w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-duration:1.05s]"
          style={{ animationDelay: '320ms' }}
        />
      </div>
    </div>
  );
}

/** Strukturalangan savol (value/label), raqamlar pastdan yuqoriga (n…1). `embedded` — pastki bar ichida. */
function StructuredQuestionCard({
  question,
  disabled,
  selectedValue,
  onSelectOption,
  embedded,
  onDismiss,
}: {
  question: CheckinInteractiveQuestionDto;
  disabled: boolean;
  selectedValue: string | null;
  onSelectOption: (value: string, label: string) => void;
  embedded?: boolean;
  onDismiss?: () => void;
}) {
  const { t } = useTranslation('checkin');
  const visibleOptions = question.options.slice(0, 3);
  const reversed = [...visibleOptions].reverse();
  return (
    <div
      className={[
        'relative overflow-hidden border border-teal-100 bg-gradient-to-b from-teal-50/95 via-white to-emerald-50/70 touch-manipulation',
        embedded ? 'rounded-2xl p-3.5 shadow-lg shadow-teal-500/10 ring-1 ring-white/60' : 'rounded-2xl p-4 shadow-lg shadow-teal-500/10',
      ].join(' ')}
    >
      <div className="pointer-events-none absolute -top-16 -right-14 h-36 w-36 rounded-full bg-teal-200/35 blur-2xl" />
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-700 uppercase tracking-wide pt-0.5">
          <i className="ri-survey-line text-sm" />
          {t('ai.poll.widgetTitle')}
        </p>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            disabled={disabled}
            className="shrink-0 -mr-1 -mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-teal-100/90 hover:text-teal-800 disabled:opacity-40"
            aria-label={t('ai.poll.dismiss')}
          >
            <i className="ri-close-line text-lg" />
          </button>
        ) : null}
      </div>
      <p className="text-base font-medium text-gray-900 mb-3 leading-snug">{question.message}</p>
      <ul className="m-0 flex w-full list-none flex-col gap-2 p-0" role="list" aria-label={question.message}>
        {reversed.map((opt, idx) => {
          const num = visibleOptions.length - idx;
          const selected = selectedValue === opt.value;
          const locked = Boolean(selectedValue) && !selected;
          return (
            <li key={`${opt.value}-${num}`} className="w-full">
              <button
                type="button"
                disabled={disabled || locked}
                onClick={() => !selectedValue && !disabled && onSelectOption(opt.value, opt.label)}
                className={[
                  'w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors min-h-[44px] flex items-start gap-2.5',
                  selected
                    ? 'border-teal-500 bg-teal-50/95 text-teal-950 shadow-sm ring-1 ring-teal-500/25'
                    : locked
                      ? 'border-gray-100 bg-slate-50/50 text-slate-400 cursor-not-allowed opacity-70'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-teal-300 hover:bg-teal-50/70 cursor-pointer active:scale-[0.99]',
                ].join(' ')}
              >
                <span className="flex h-7 min-w-[1.75rem] shrink-0 items-center justify-center rounded-lg bg-teal-100 text-xs font-semibold text-teal-800 tabular-nums">
                  {num}
                </span>
                <span className="flex-1 pt-0.5 leading-snug">{opt.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {!embedded ? (
        <div className="flex gap-1 justify-center mt-4" aria-hidden>
          <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600" />
        </div>
      ) : null}
    </div>
  );
}

export default function AIAssistStep({
  doctorId,
  checkinToken,
  answers,
  patientLanguage,
  doctorLanguage,
  visitId,
  potientResponseId,
  onFinish,
}: AIAssistStepProps) {
  const { t: tCheckin } = useTranslation('checkin');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [intakeComplete, setIntakeComplete] = useState(false);
  const [dockQuestion, setDockQuestion] = useState<CheckinInteractiveQuestionDto | null>(null);
  const [dockSelectedValue, setDockSelectedValue] = useState<string | null>(null);

  void visitId;
  void doctorLanguage;
  void answers;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triageSummaryForDoctorRef = useRef<string | undefined>(undefined);
  const fetchGenRef = useRef(0);
  const busy = initialLoading || sending;
  const composerLocked = intakeComplete;
  const preferInlineCustomInput =
    Boolean(dockQuestion?.allowCustomAnswer) && (dockQuestion?.options.length ?? 0) >= 4;

  /**
   * Build a backend-shaped transcript from the local chat state. Always sent
   * along with onFinish; the backend only uses it when the DB transcript is
   * empty (i.e. when /session/start failed or the chat ran in legacy mode).
   */
  const buildChatMessagesPayload = useCallback((): CheckinChatMessageInput[] => {
    return messages
      .filter((m) => m.text?.trim())
      .map((m) => ({
        role: m.role === 'user' ? 'patient' : 'assistant',
        text: m.text,
        messageType: 'text',
        language: patientLanguage,
      }));
  }, [messages, patientLanguage]);

  /** Suhbat oxirida yuboriladigan xulosa: oxirgi muvaffaqiyatli AI matni (shifokor paneli `aiSummary`). */
  const setLatestDoctorSummary = (text: string) => {
    const t = text.trim();
    if (t) triageSummaryForDoctorRef.current = t;
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  const focusComposerInput = useCallback(() => {
    const input = inputRef.current;
    if (!input || input.disabled) return;
    if (document.activeElement === input) return;
    input.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, initialLoading, sending, dockQuestion, scrollToBottom]);

  useEffect(() => {
    if (preferInlineCustomInput) return;
    if (initialLoading) return;
    const raf = globalThis.requestAnimationFrame(() => {
      focusComposerInput();
    });
    return () => globalThis.cancelAnimationFrame(raf);
  }, [initialLoading, focusComposerInput, preferInlineCustomInput]);

  useEffect(() => {
    if (preferInlineCustomInput) return;
    if (busy) return;
    const raf = globalThis.requestAnimationFrame(() => {
      focusComposerInput();
    });
    return () => globalThis.cancelAnimationFrame(raf);
  }, [messages, sending, dockQuestion, busy, focusComposerInput, preferInlineCustomInput]);

  const runIntakeTurn = useCallback(
    async (nextMessages: Message[]) => {
      if (!potientResponseId?.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-no-session-${Date.now()}`,
            role: 'ai',
            text: "Sessiya hali tayyor emas. Bir oz kutib, sahifani yangilang yoki telefon qadamidan qayta kiring.",
            timestamp: new Date(),
          },
        ]);
        return;
      }
      if (!checkinToken?.trim()) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-token-${Date.now()}`,
            role: 'ai',
            text: "Check-in xavfsizlik kaliti topilmadi. Sahifani yangilab ko'ring.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const lastUser = [...nextMessages].reverse().find((m) => m.role === 'user');
      const outgoing = lastUser?.text?.trim();
      if (!outgoing) return;

      const res = await postAiIntakeMessage({
        session_id: potientResponseId,
        message: outgoing,
        language: patientLanguage,
        doctor_id: doctorId,
        checkin_token: checkinToken,
      });

      const aiText = res.assistant_reply?.trim() ?? '';
      const nextQuestion = mapDbQuestionToDock(res.next_question);
      const sameAsStructuredQuestion =
        Boolean(nextQuestion) && nextQuestion?.message.trim() === aiText;
      const bubbleText = sameAsStructuredQuestion ? toCompactChatQuestion(aiText) : aiText;
      const shouldRenderAiBubble = Boolean(bubbleText);
      if (aiText) setLatestDoctorSummary(aiText);
      if (res.intake_complete) setIntakeComplete(true);

      if (shouldRenderAiBubble) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'ai',
            text: bubbleText,
            timestamp: new Date(),
          },
        ]);
      } else if (!aiText) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-empty-${Date.now()}`,
            role: 'ai',
            text: "Javob boʻsh. Matnni qisqaroq yozib qayta yuboring.",
            timestamp: new Date(),
          },
        ]);
      }

      setDockQuestion(nextQuestion);
      setDockSelectedValue(null);
    },
    [doctorId, checkinToken, patientLanguage, potientResponseId],
  );

  useEffect(() => {
    const id = ++fetchGenRef.current;
    let cancelled = false;

    void (async () => {
      setInitialLoading(true);
      setIntakeComplete(false);
      setDockQuestion(null);
      setDockSelectedValue(null);
      try {
        if (!checkinToken?.trim()) {
          if (cancelled || id !== fetchGenRef.current) return;
          setMessages([
            {
              id: `ai-err-token-${Date.now()}`,
              role: 'ai',
              text: "Check-in kaliti yoʻq — AI sessiyasi ochilmadi.",
              timestamp: new Date(),
            },
          ]);
          return;
        }

        if (!potientResponseId?.trim()) {
          return;
        }

        const res = await postAiIntakeStart({
          session_id: potientResponseId,
          doctor_id: doctorId,
          checkin_token: checkinToken,
        });
        if (cancelled || id !== fetchGenRef.current) return;

        const text = res.assistant_reply?.trim() ?? '';
        const nextQuestion = mapDbQuestionToDock(res.next_question);
        const sameAsStructuredQuestion =
          Boolean(nextQuestion) && nextQuestion?.message.trim() === text;
        const bubbleText = sameAsStructuredQuestion ? toCompactChatQuestion(text) : text;
        const shouldRenderAiBubble = Boolean(bubbleText);
        if (text) setLatestDoctorSummary(text);
        if (shouldRenderAiBubble) {
          setMessages([
            {
              id: `ai-bootstrap-${Date.now()}`,
              role: 'ai',
              text: bubbleText,
              timestamp: new Date(),
            },
          ]);
        } else if (!text) {
          setMessages([
            {
              id: `ai-empty-bootstrap-${Date.now()}`,
              role: 'ai',
              text: "Intake boshlanmadi — qayta urinib ko'ring.",
              timestamp: new Date(),
            },
          ]);
        }
        setDockQuestion(nextQuestion);
      } catch (error) {
        if (cancelled || id !== fetchGenRef.current) return;
        setMessages([
          {
            id: `ai-err-${Date.now()}`,
            role: 'ai',
            text: getAiErrorMessage(
              error,
              "AI intake serverga ulanib bo‘lmadi. Internetni tekshiring yoki keyinroq qayta urinib ko‘ring.",
            ),
            timestamp: new Date(),
          },
        ]);
        setDockQuestion(null);
      } finally {
        if (cancelled || id !== fetchGenRef.current) return;
        /** Keep spinner until `patient_response_id` exists — parent opens session async after AI step mounts. */
        const waitingForSession =
          Boolean(checkinToken?.trim()) && !potientResponseId?.trim();
        if (!waitingForSession) {
          setInitialLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [doctorId, checkinToken, patientLanguage, potientResponseId]);

  /** Parent opens `/checkin/session/start` async; if it never completes, stop infinite spinner. */
  useEffect(() => {
    if (!checkinToken?.trim() || potientResponseId?.trim()) return;
    const t = globalThis.setTimeout(() => {
      setMessages((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            id: `session-timeout-${Date.now()}`,
            role: 'ai',
            text: "Sessiya ochilmadi. Sahifani yangilang yoki keyinroq qayta urinib ko‘ring.",
            timestamp: new Date(),
          },
        ];
      });
      setInitialLoading(false);
    }, 25000);
    return () => globalThis.clearTimeout(t);
  }, [checkinToken, potientResponseId]);

  const sendMessage = async () => {
    const text = userInput.trim();
    if (!text || sending || initialLoading || composerLocked) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setUserInput('');
    setSending(true);
    setDockQuestion(null);
    setDockSelectedValue(null);

    try {
      await runIntakeTurn(nextMessages);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'ai',
          text: getAiErrorMessage(error, "So'rov yuborilmadi. Qayta urinib ko'ring."),
          timestamp: new Date(),
        },
      ]);
      setDockQuestion(null);
    } finally {
      setSending(false);
    }
  };

  const onStructuredOptionPick = async (_value: string, label: string) => {
    if (sending || initialLoading || composerLocked || !dockQuestion) return;
    setDockSelectedValue(_value);
    setDockQuestion(null);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: label,
      timestamp: new Date(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setSending(true);

    try {
      await runIntakeTurn(nextMessages);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'ai',
          text: getAiErrorMessage(error, "So'rov yuborilmadi. Qayta urinib ko'ring."),
          timestamp: new Date(),
        },
      ]);
      setDockQuestion(null);
      setDockSelectedValue(null);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-[5] flex min-h-0 flex-col overflow-hidden bg-[#f7f7f8]">
      <header className="shrink-0 border-b border-slate-200/70 bg-white/75 backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-white/65 px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="max-w-lg mx-auto flex items-start gap-3">
          <div className="relative shrink-0 pt-0.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/15 ring-1 ring-black/5">
              <i className="ri-sparkling-2-line text-white text-lg" />
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${busy ? 'bg-amber-400' : 'bg-emerald-400'} shadow-sm`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-slate-900 tracking-tight truncate">AI asistent</p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span
                className={`inline-flex h-1.5 w-1.5 rounded-full ${busy ? 'bg-amber-400' : 'bg-emerald-500'} motion-safe:animate-pulse`}
              />
              {busy ? 'Javob yozilmoqda…' : 'Tayyor'}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onFinish(
                true,
                triageSummaryForDoctorRef.current,
                buildChatMessagesPayload(),
              )
            }
            disabled={busy}
            aria-label={tCheckin('ai.finishGroupAria')}
            className="shrink-0 self-start pt-0.5 max-w-[11.5rem] rounded-xl border border-teal-200/90 bg-gradient-to-r from-teal-50 via-white to-emerald-50/90 px-2.5 py-2 text-center text-[11px] font-semibold leading-snug text-teal-900 shadow-sm ring-1 ring-teal-500/10 transition-all hover:from-teal-100/70 hover:to-emerald-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 whitespace-normal"
          >
            {tCheckin('ai.finishComplaintCta')}
          </button>
        </div>
      </header>

      <div
        className={
          dockQuestion && dockQuestion.options.length >= 2
            ? 'min-h-0 flex-1 select-text overflow-y-auto overscroll-contain px-4 py-5 pb-[min(46vh,24rem)] scroll-pb-28 [-webkit-user-select:text]'
            : 'min-h-0 flex-1 select-text overflow-y-auto overscroll-contain px-4 py-5 pb-28 scroll-pb-28 [-webkit-user-select:text]'
        }
      >
        <div className="max-w-lg mx-auto space-y-6 select-text">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === 'ai' ? (
                <div className="flex gap-3">
                  <AiAvatar className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="inline-block max-w-full rounded-2xl rounded-tl-md bg-white border border-slate-200/90 px-4 py-3.5 shadow-md shadow-slate-200/50 select-text">
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap select-text cursor-text">
                        {msg.text}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 ml-0.5">
                      {msg.timestamp.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 justify-end">
                  <div className="flex flex-col items-end max-w-[min(100%,20rem)]">
                    <div className="rounded-2xl rounded-tr-md bg-gradient-to-br from-teal-500 to-emerald-600 text-white px-4 py-3.5 shadow-lg shadow-teal-500/25 ring-1 ring-white/10 select-text">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap select-text cursor-text">
                        {msg.text}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 mr-0.5">
                      {msg.timestamp.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {initialLoading && messages.length === 0 && (
            <div className="flex gap-3">
              <AiAvatar />
              <TypingBubble />
            </div>
          )}

          {sending && (
            <div className="flex gap-3">
              <AiAvatar />
              <TypingBubble />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200/70 bg-white/90 backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-white/80 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-3 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
        {dockQuestion && dockQuestion.options.length >= 2 ? (
          <div className="max-w-lg mx-auto w-full max-h-[min(38vh,300px)] overflow-y-auto overflow-x-hidden overscroll-y-contain">
            <StructuredQuestionCard
              embedded
              question={dockQuestion}
              disabled={busy || composerLocked}
              selectedValue={dockSelectedValue}
              onSelectOption={(v, label) => void onStructuredOptionPick(v, label)}
              onDismiss={() => {
                setDockQuestion(null);
                setDockSelectedValue(null);
              }}
            />
          </div>
        ) : null}
        <div className="max-w-lg mx-auto flex gap-2.5 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              className="w-full px-4 pr-10 h-12 rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-500/15 text-sm outline-none transition-all disabled:opacity-50"
              placeholder={
                dockQuestion?.allowCustomAnswer
                  ? dockQuestion.customPlaceholder?.trim() || tCheckin('ai.poll.customPlaceholder')
                  : tCheckin('ai.inputPlaceholder')
              }
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (busy || preferInlineCustomInput) return;
                globalThis.requestAnimationFrame(() => {
                  focusComposerInput();
                });
              }}
              disabled={busy || composerLocked}
            />
            {userInput ? (
              <button
                type="button"
                onClick={() => setUserInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-sm" />
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!userInput.trim() || busy || composerLocked}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center cursor-pointer transition-all shadow-lg shadow-teal-500/25 ring-1 ring-white/10 active:scale-95 flex-shrink-0"
          >
            <i className="ri-send-plane-fill text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}
