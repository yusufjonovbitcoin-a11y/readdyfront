import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CHECKIN_SYMPTOMS } from "@/pages/checkin/constants/symptoms";

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
  timestamp: Date;
}

interface AIAssistStepProps {
  answers: Record<string, string | string[]>;
  onFinish: (usedAI: boolean) => void;
}

type RiskLevel = "low" | "medium" | "high" | "critical";

function analyzeAnswers(answers: Record<string, string | string[]>, tr: (key: string, def: string) => string) {
  const hasHighTemp = answers["q4"] === "yes";
  const hasBreathing = answers["q8"] === "yes";
  const hasChestPain = answers["q1"] === CHECKIN_SYMPTOMS.CHEST_PAIN;
  const hasHeartIssue = answers["q11"] === "yes";
  const hasChronic = answers["q15"] === "yes";

  let riskScore = 0;
  if (hasHighTemp) riskScore += 1;
  if (hasBreathing) riskScore += 2;
  if (hasChestPain) riskScore += 2;
  if (hasHeartIssue) riskScore += 2;
  if (hasChronic) riskScore += 1;

  const riskLevel: RiskLevel = riskScore >= 5 ? "critical" : riskScore >= 3 ? "high" : riskScore >= 1 ? "medium" : "low";

  const conditions: { name: string; probability: number; description: string }[] = [];
  if (hasChestPain || hasHeartIssue) {
    conditions.push({
      name: tr("checkin:ai.conditions.cardiovascular.name", "Yurak-qon tomir muammolari"),
      probability: 65,
      description: tr("checkin:ai.conditions.cardiovascular.description", "Ko'krak og'rig'i va yurak urishi o'zgarishi kuzatilgan"),
    });
  }
  if (hasHighTemp) {
    conditions.push({
      name: tr("checkin:ai.conditions.infection.name", "Infeksion kasallik"),
      probability: 55,
      description: tr("checkin:ai.conditions.infection.description", "Harorat ko'tarilishi infeksiya belgisi bo'lishi mumkin"),
    });
  }
  if (hasBreathing) {
    conditions.push({
      name: tr("checkin:ai.conditions.respiratory.name", "Nafas yo'llari muammosi"),
      probability: 45,
      description: tr("checkin:ai.conditions.respiratory.description", "Nafas qisishi kuzatilgan"),
    });
  }
  if (conditions.length === 0) {
    conditions.push({
      name: tr("checkin:ai.conditions.general.name", "Umumiy holsizlik"),
      probability: 40,
      description: tr("checkin:ai.conditions.general.description", "Aniq simptomlar kuzatilmagan, shifokor ko'rigi tavsiya etiladi"),
    });
  }

  const actions: string[] = [];
  if (riskLevel === "critical" || riskLevel === "high") {
    actions.push(tr("checkin:ai.actions.urgent", "Zudlik bilan shifokorga murojaat qiling"));
    actions.push(tr("checkin:ai.actions.informFamily", "Yolg'iz qolmang, yaqinlaringizni xabardor qiling"));
  }
  actions.push(tr("checkin:ai.actions.waitDoctor", "Shifokor ko'rigini kuting"));
  actions.push(tr("checkin:ai.actions.medication", "Dori qabul qilishdan oldin shifokor bilan maslahatlashing"));
  if (hasHighTemp) actions.push(tr("checkin:ai.actions.hydration", "Ko'p suv iching va dam oling"));

  return { riskLevel, conditions, actions };
}

export default function AIAssistStep({ answers, onFinish }: AIAssistStepProps) {
  const { t } = useTranslation("checkin");
  const tr = useCallback(
    (key: Parameters<typeof t>[0], defaultValue: string) => t(key, { defaultValue }),
    [t],
  );

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [chatStep, setChatStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showResultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const analysis = useMemo(() => analyzeAnswers(answers, tr), [answers, tr]);
  const riskColors = useMemo(
    () => ({
      low: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", label: tr("checkin:ai.risk.low", "Past xavf") },
      medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", label: tr("checkin:ai.risk.medium", "O'rta xavf") },
      high: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", badge: "bg-orange-100 text-orange-700", label: tr("checkin:ai.risk.high", "Yuqori xavf") },
      critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", badge: "bg-red-100 text-red-700", label: tr("checkin:ai.risk.critical", "Kritik xavf") },
    }),
    [tr],
  );
  const risk = riskColors[analysis.riskLevel];

  const aiMessages = useMemo(
    () => [
      tr("checkin:ai.chat.start", "Salom! Men sizning javoblaringizni tahlil qildim. Bir nechta qo'shimcha savollarim bor."),
      tr("checkin:ai.chat.follow1", "Og'riq doimiy yoki vaqti-vaqti bilan bo'ladimi?"),
      tr("checkin:ai.chat.follow2", "Og'riq kuchaygan paytlarda qanday holat bo'ladi? Masalan, harakat qilganda yoki dam olganda?"),
      tr("checkin:ai.chat.result", "Rahmat! Barcha ma'lumotlarni tahlil qildim. Quyida dastlabki baholash natijalarini ko'rishingiz mumkin."),
    ],
    [tr],
  );

  useEffect(() => {
    if (showChat && messages.length === 0) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        setMessages([{
          id: '1',
          role: 'ai',
          text: aiMessages[0],
          timestamp: new Date(),
        }]);
        setChatStep(1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showChat, aiMessages, messages.length]);

  useEffect(() => {
    return () => {
      if (sendTimerRef.current) {
        clearTimeout(sendTimerRef.current);
      }
      if (showResultTimerRef.current) {
        clearTimeout(showResultTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!userInput.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userInput.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    if (chatStep < aiMessages.length - 1) {
      setIsTyping(true);
      sendTimerRef.current = setTimeout(() => {
        sendTimerRef.current = null;
        setIsTyping(false);
        const nextStep = chatStep + 1;
        setChatStep(nextStep);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: aiMessages[nextStep],
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMsg]);
        if (nextStep === aiMessages.length - 1) {
          showResultTimerRef.current = setTimeout(() => {
            showResultTimerRef.current = null;
            setShowResult(true);
          }, 500);
        }
      }, 1200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!showChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200">
              <i className="ri-robot-line text-white text-3xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{tr("checkin:ai.title", "AI Yordamchi")}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {tr("checkin:ai.subtitle", "Javoblaringiz asosida qo'shimcha tahlil o'tkazishni xohlaysizmi?")}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 flex-shrink-0 mt-0.5">
                <i className="ri-information-line text-amber-600 text-sm"></i>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">{tr("checkin:ai.noticeTitle", "Muhim eslatma")}</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {tr("checkin:ai.noticeText", "AI tavsiyasi tibbiy tashxis emas. Bu faqat dastlabki baholash bo'lib, shifokor ko'rigini almashtirmaydi.")}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowChat(true)}
              className="w-full h-13 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-md shadow-violet-200"
              style={{ height: '52px' }}
            >
              <i className="ri-robot-line text-base"></i>
              {tr("checkin:ai.startButton", "AI Yordamchi")}
            </button>
            <button
              onClick={() => onFinish(false)}
              className="w-full h-13 rounded-xl border-2 border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              style={{ height: '52px' }}
            >
              {tr("checkin:ai.skip", "O'tkazib yuborish")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Chat header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <i className="ri-robot-line text-white text-base"></i>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">{tr("checkin:ai.title", "AI Yordamchi")}</p>
          <p className="text-xs text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            {tr("checkin:ai.active", "Faol")}
          </p>
        </div>
        <div className="text-xs text-gray-400 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
          {tr("checkin:ai.notDiagnosis", "Tibbiy tashxis emas")}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
            {msg.role === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                <i className="ri-robot-line text-white text-xs"></i>
              </div>
            )}
            <div
              className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-teal-500 text-white rounded-tr-sm'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <i className="ri-robot-line text-white text-xs"></i>
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* AI Result */}
        {showResult && (
          <div className={`rounded-2xl border p-4 ${risk.bg} ${risk.border}`}>
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-shield-check-line text-base"></i>
              <span className={`text-sm font-bold ${risk.text}`}>{tr("checkin:ai.resultTitle", "Tahlil natijasi")}</span>
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${risk.badge}`}>
                {risk.label}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              {analysis.conditions.map((c, i) => (
                <div key={i} className="bg-white/70 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-800">{c.name}</span>
                    <span className="text-xs font-bold text-gray-600">{c.probability}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mb-1">
                    <div className="bg-teal-500 h-1 rounded-full" style={{ width: `${c.probability}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500">{c.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/70 rounded-xl p-3 mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">{tr("checkin:ai.recommendedActions", "Tavsiya etilgan harakatlar:")}</p>
              <ul className="space-y-1">
                {analysis.actions.map((a, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <i className="ri-checkbox-circle-line text-teal-500 flex-shrink-0 mt-0.5"></i>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-amber-700 flex items-start gap-1.5">
                <i className="ri-error-warning-line flex-shrink-0 mt-0.5"></i>
                <span><strong>{tr("checkin:ai.note", "Eslatma")}:</strong> {tr("checkin:ai.noticeText", "AI tavsiyasi tibbiy tashxis emas. Bu faqat dastlabki baholash bo'lib, shifokor ko'rigini almashtirmaydi.")}</span>
              </p>
            </div>

            <button
              onClick={() => onFinish(true)}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
            >
              <i className="ri-check-line text-base"></i>
              {tr("checkin:ai.finish", "Tugatish")}
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!showResult && (
        <div className="bg-white border-t border-gray-100 px-4 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 h-11 rounded-xl border border-gray-200 focus:border-teal-500 text-sm outline-none transition-colors"
              placeholder={tr("checkin:ai.inputPlaceholder", "Javob yozing...")}
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={sendMessage}
              disabled={!userInput.trim()}
              className="w-11 h-11 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
              aria-label={tr("checkin:ai.sendMessage", "Xabar yuborish")}
            >
              <i className="ri-send-plane-line text-base" aria-hidden="true"></i>
            </button>
          </div>
          <button
            onClick={() => onFinish(false)}
            className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer py-1 transition-colors"
          >
            {tr("checkin:ai.continueWithoutChat", "Chatsiz davom etish")}
          </button>
        </div>
      )}
    </div>
  );
}
