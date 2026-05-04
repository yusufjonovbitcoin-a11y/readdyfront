import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { generateCheckinAiPreview } from '@/api/checkin';
import type {
  CheckinAiPreviewResult,
  CheckinFollowUpPollDto,
  CheckinInteractiveQuestionDto,
} from '@/api/types/checkin.types';

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
  onFinish: (usedAI: boolean, aiSummary?: string) => void;
}

function buildConversationPayload(list: Message[]): string {
  return list.map((m) => `${m.role === 'ai' ? 'AI' : 'Bemor'}: ${m.text}`).join('\n');
}

function normalizePoll(p: CheckinFollowUpPollDto | null | undefined): CheckinFollowUpPollDto | null {
  if (!p?.question?.trim()) return null;
  const raw = (p.options ?? []) as unknown[];
  const options: Array<{ id: number; text: string }> = [];
  raw.forEach((o, idx) => {
    if (typeof o === 'string' && o.trim()) {
      options.push({ id: idx + 1, text: o.trim() });
    } else if (o && typeof o === 'object' && o !== null && 'text' in o) {
      const rec = o as unknown as { id?: number; text?: string };
      const text = typeof rec.text === 'string' ? rec.text.trim() : '';
      if (!text) return;
      const id =
        typeof rec.id === 'number' && Number.isFinite(rec.id) ? Math.floor(rec.id) : idx + 1;
      options.push({ id, text });
    }
  });
  if (options.length < 2) return null;
  return { question: p.question.trim(), options: options.slice(0, 6) };
}

function normalizeQuestionUi(res: CheckinAiPreviewResult): CheckinInteractiveQuestionDto | null {
  const q = res.question_ui;
  if (
    q?.type === 'question' &&
    q.inputType === 'single_choice' &&
    Array.isArray(q.options) &&
    q.options.length >= 2
  ) {
    const opts = q.options
      .filter((o) => o && typeof o.value === 'string' && typeof o.label === 'string' && o.label.trim())
      .map((o) => ({ value: o.value.trim(), label: o.label.trim() }));
    if (opts.length < 2) return null;
    const message = (q.message ?? '').trim() || 'Savol';
    return {
      type: 'question',
      message,
      inputType: 'single_choice',
      options: opts.slice(0, 12),
      allowCustomAnswer: Boolean(q.allowCustomAnswer),
      customPlaceholder: typeof q.customPlaceholder === 'string' ? q.customPlaceholder : undefined,
    };
  }
  const legacy = normalizePoll(res.follow_up_poll ?? null);
  if (!legacy) return null;
  return {
    type: 'question',
    message: legacy.question,
    inputType: 'single_choice',
    options: legacy.options.map((o) => ({ value: `legacy_${o.id}`, label: o.text })),
  };
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
  const reversed = [...question.options].reverse();
  return (
    <div
      className={[
        'border border-teal-100 bg-gradient-to-b from-teal-50/90 via-emerald-50/40 to-white touch-manipulation',
        embedded ? 'rounded-xl p-3 shadow-sm shadow-teal-500/5' : 'rounded-2xl p-4 shadow-sm shadow-teal-500/5',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide pt-0.5">{t('ai.poll.widgetTitle')}</p>
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
      <p className="text-sm font-medium text-gray-900 mb-3 leading-snug">{question.message}</p>
      <ul className="m-0 flex w-full list-none flex-col gap-2 p-0" role="list" aria-label={question.message}>
        {reversed.map((opt, idx) => {
          const num = question.options.length - idx;
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
  onFinish,
}: AIAssistStepProps) {
  const { t: tCheckin } = useTranslation('checkin');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [dockQuestion, setDockQuestion] = useState<CheckinInteractiveQuestionDto | null>(null);
  const [dockSelectedValue, setDockSelectedValue] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triageSummaryForDoctorRef = useRef<string | undefined>(undefined);
  const fetchGenRef = useRef(0);

  /** Suhbat oxirida yuboriladigan xulosa: oxirgi muvaffaqiyatli AI matni (shifokor paneli `aiSummary`). */
  const setLatestDoctorSummary = (text: string) => {
    const t = text.trim();
    if (t) triageSummaryForDoctorRef.current = t;
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, initialLoading, sending, dockQuestion, scrollToBottom]);

  useEffect(() => {
    if (initialLoading) return;
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [initialLoading]);

  const runPreview = useCallback(
    async (nextMessages: Message[]) => {
      const payload = buildConversationPayload(nextMessages);
      const res = await generateCheckinAiPreview({
        doctorId,
        checkinToken,
        answers,
        message: payload || undefined,
        patientLanguage,
        doctorLanguage,
        visitId,
      });
      const aiText = res.ai_analysis?.trim() ?? '';
      if (aiText) setLatestDoctorSummary(aiText);

      const qUi = normalizeQuestionUi(res);

      if (aiText) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'ai',
            text: aiText,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-empty-${Date.now()}`,
            role: 'ai',
            text: "AI aniq javob qaytara olmadi. Qisqaroq yozib qayta urinib ko'ring.",
            timestamp: new Date(),
          },
        ]);
      }

      setDockQuestion(qUi);
      setDockSelectedValue(null);
    },
    [doctorId, checkinToken, answers, patientLanguage, doctorLanguage, visitId],
  );

  useEffect(() => {
    const id = ++fetchGenRef.current;
    let cancelled = false;

    void (async () => {
      setInitialLoading(true);
      setDockQuestion(null);
      setDockSelectedValue(null);
      try {
        const res = await generateCheckinAiPreview({
          doctorId,
          checkinToken,
          answers,
          message: undefined,
          patientLanguage,
          doctorLanguage,
          visitId,
        });
        if (cancelled || id !== fetchGenRef.current) return;
        const text = res.ai_analysis?.trim() ?? '';
        if (!text) {
          setMessages([
            {
              id: `ai-${Date.now()}`,
              role: 'ai',
              text: "AI javob qaytarmadi. Iltimos, qayta urinib ko'ring yoki chatsiz davom eting.",
              timestamp: new Date(),
            },
          ]);
          setDockQuestion(null);
          return;
        }
        setLatestDoctorSummary(text);
        setMessages([
          {
            id: `ai-main-${Date.now()}`,
            role: 'ai',
            text,
            timestamp: new Date(),
          },
        ]);
        setDockQuestion(normalizeQuestionUi(res));
      } catch (error) {
        if (cancelled || id !== fetchGenRef.current) return;
        setMessages([
          {
            id: `ai-err-${Date.now()}`,
            role: 'ai',
            text: getAiErrorMessage(
              error,
              "AI serverga ulanib bo'lmadi. Internetni tekshiring yoki keyinroq qayta urinib ko'ring.",
            ),
            timestamp: new Date(),
          },
        ]);
        setDockQuestion(null);
      } finally {
        if (!cancelled && id === fetchGenRef.current) setInitialLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [doctorId, checkinToken, answers, patientLanguage, doctorLanguage, visitId]);

  const sendMessage = async () => {
    const text = userInput.trim();
    if (!text || sending || initialLoading) return;

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
      await runPreview(nextMessages);
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
    if (sending || initialLoading || !dockQuestion) return;
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
      await runPreview(nextMessages);
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

  const busy = initialLoading || sending;

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-[#f7f7f8]">
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
            onClick={() => onFinish(true, triageSummaryForDoctorRef.current)}
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
            ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-[min(52vh,26rem)] scroll-pb-28'
            : 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-28 scroll-pb-28'
        }
      >
        <div className="max-w-lg mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === 'ai' ? (
                <div className="flex gap-3">
                  <AiAvatar className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="inline-block max-w-full rounded-2xl rounded-tl-md bg-white border border-slate-200/90 px-4 py-3.5 shadow-md shadow-slate-200/50">
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 ml-0.5">
                      {msg.timestamp.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 justify-end">
                  <div className="flex flex-col items-end max-w-[min(100%,20rem)]">
                    <div className="rounded-2xl rounded-tr-md bg-gradient-to-br from-teal-500 to-emerald-600 text-white px-4 py-3.5 shadow-lg shadow-teal-500/25 ring-1 ring-white/10">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
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
              disabled={busy}
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
              disabled={busy}
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
            disabled={!userInput.trim() || busy}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center cursor-pointer transition-all shadow-lg shadow-teal-500/25 ring-1 ring-white/10 active:scale-95 flex-shrink-0"
          >
            <i className="ri-send-plane-fill text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}
