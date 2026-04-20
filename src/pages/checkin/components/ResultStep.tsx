import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { CHECKIN_SYMPTOMS } from "@/pages/checkin/constants/symptoms";

type ResultCase = 'queue' | 'busy' | 'info';

interface ResultStepProps {
  phone: string;
  doctorName: string;
  doctorSpecialty: string;
  answers: Record<string, string | string[]>;
  usedAI: boolean;
  onRestart: () => void;
}

function getResultCase(answers: Record<string, string | string[]>): ResultCase {
  const isYes = (key: string) => answers[key] === "yes";
  const hasSymptom = (value: string) => {
    return Object.values(answers).some((v) => {
      if (Array.isArray(v)) return v.includes(value);
      return v === value;
    });
  };

  // High-priority patterns always go to queue.
  const criticalPattern =
    hasSymptom(CHECKIN_SYMPTOMS.CHEST_PAIN) ||
    isYes("q8") || // severe warning symptom in flow
    isYes("q11"); // emergency indicator
  if (criticalPattern) return "queue";

  // Medium risk patterns produce busy state.
  const mediumPattern =
    isYes("q4") ||
    isYes("q15") ||
    hasSymptom(CHECKIN_SYMPTOMS.FEVER) ||
    hasSymptom(CHECKIN_SYMPTOMS.BREATH_SHORTNESS);
  if (mediumPattern) return "busy";

  // Otherwise informational follow-up.
  return "info";
}

function getRiskLevel(answers: Record<string, string | string[]>): 'low' | 'medium' | 'high' | 'critical' {
  let score = 0;
  if (answers['q4'] === 'yes') score += 1;
  if (answers['q8'] === 'yes') score += 2;
  if (answers['q1'] === CHECKIN_SYMPTOMS.CHEST_PAIN) score += 2;
  if (answers['q11'] === 'yes') score += 2;
  if (answers['q15'] === 'yes') score += 1;
  return score >= 5 ? 'critical' : score >= 3 ? 'high' : score >= 1 ? 'medium' : 'low';
}

export default function ResultStep({ phone, doctorName, doctorSpecialty, answers, usedAI, onRestart }: ResultStepProps) {
  const { t, i18n } = useTranslation("checkin");
  const tr = (key: Parameters<typeof t>[0], defaultValue: string) => t(key, { defaultValue });

  const riskConfig = {
    low: { label: tr("checkin:result.risk.low", "Past xavf"), color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    medium: { label: tr("checkin:result.risk.medium", "O'rta xavf"), color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    high: { label: tr("checkin:result.risk.high", "Yuqori xavf"), color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    critical: { label: tr("checkin:result.risk.critical", "Kritik xavf"), color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  };

  const [resultCase] = useState<ResultCase>(() => getResultCase(answers));
  const [notifSent, setNotifSent] = useState(false);
  const riskLevel = getRiskLevel(answers);
  const risk = riskConfig[riskLevel];
  const hasOperationalQueueData = false;

  const handleNotify = () => {
    setNotifSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* CASE 1: Queue available */}
        {resultCase === 'queue' && (
          <>
            <div className="text-center mb-6">
              <div className="relative inline-flex">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-teal-200 mx-auto">
                  <i className="ri-hourglass-line text-white text-4xl"></i>
                </div>
                {(riskLevel === 'high' || riskLevel === 'critical') && (
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center border-2 border-white">
                    <i className="ri-alarm-warning-line text-white text-xs"></i>
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-4 mb-1">{tr("checkin:result.queueAccepted", "So'rov qabul qilindi!")}</h2>
              <p className="text-sm text-gray-500">
                {tr("checkin:result.queueAcceptedDesc", "So'rovingiz yuborildi. Aniq navbat ma'lumoti hozircha mavjud emas.")}
              </p>
            </div>

            {!hasOperationalQueueData && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 mb-4">
                <p className="text-xs font-medium text-amber-700">
                  {tr("checkin:result.demoQueueNotice", "Demo rejim: navbat raqami va ETA backend navbat xizmati ulangandan keyin chiqadi.")}
                </p>
              </div>
            )}

            {/* Risk badge */}
            {(riskLevel === 'high' || riskLevel === 'critical') && (
              <div className={`rounded-xl border p-3 mb-4 flex items-center gap-3 ${risk.bg} ${risk.border}`}>
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white flex-shrink-0">
                  <i className={`ri-alarm-warning-line ${risk.color} text-base`}></i>
                </div>
                <div>
                  <p className={`text-xs font-bold ${risk.color}`}>{risk.label} {tr("checkin:result.detected", "aniqlandi")}</p>
                  <p className="text-xs text-gray-500">{tr("checkin:result.priorityDesc", "Shifokor siz bilan tezroq ko'rishadi")}</p>
                </div>
              </div>
            )}

            {/* Info card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-sm">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-teal-50 rounded-xl">
                  <p className="text-2xl font-black text-teal-600">—</p>
                  <p className="text-xs text-gray-500 mt-1">{tr("checkin:result.queueNumber", "Navbat raqami (hali mavjud emas)")}</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-2xl font-black text-emerald-600">—</p>
                  <p className="text-xs text-gray-500 mt-1">{tr("checkin:result.waitMinutes", "Kutish vaqti (hali mavjud emas)")}</p>
                </div>
              </div>

              {/* Queue/ETA placeholder */}
              <div className="text-center py-3 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-1">{tr("checkin:result.estimatedWait", "Aniq ETA backend navbat xizmati ulangandan keyin ko'rsatiladi")}</p>
                <p className="text-sm font-semibold text-gray-700">{tr("checkin:result.pendingQueueInfo", "Hozircha navbat holati tasdiqlanmagan")}</p>
              </div>

              <div className="border-t border-gray-50 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{tr("checkin:result.doctor", "Shifokor")}</span>
                  <span className="text-xs font-semibold text-gray-900">{doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{tr("checkin:result.department", "Bo'lim")}</span>
                  <span className="text-xs font-semibold text-gray-900">{doctorSpecialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{tr("checkin:result.phone", "Telefon")}</span>
                  <span className="text-xs font-semibold text-gray-900">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{tr("checkin:result.date", "Sana")}</span>
                  <span className="text-xs font-semibold text-gray-900">{new Date().toLocaleDateString(i18n.language === "ru" ? "ru-RU" : "uz-UZ")}</span>
                </div>
              </div>
            </div>

            {/* Notification */}
            {!notifSent ? (
              <button
                onClick={handleNotify}
                className="w-full h-12 rounded-xl border-2 border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 mb-3"
              >
                <i className="ri-notification-line text-base"></i>
                {tr("checkin:result.notifyWhenTurn", "Navbatim kelganda xabar bering")}
              </button>
            ) : (
              <div className="w-full h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2 mb-3">
                <i className="ri-check-line text-emerald-600 text-base"></i>
                <span className="text-sm font-medium text-emerald-700">{tr("checkin:result.smsSent", "SMS xabar yuboriladi")}</span>
              </div>
            )}
          </>
        )}

        {/* CASE 2: Busy */}
        {resultCase === 'busy' && (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <i className="ri-time-line text-amber-600 text-3xl"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{tr("checkin:result.busyTitle", "Shifokor band")}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {tr("checkin:result.busyDesc", "Hozirda navbat to'liq. Iltimos, biroz kuting yoki keyinroq qayta urinib ko'ring.")}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <i className="ri-calendar-line text-amber-600 text-base"></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{tr("checkin:result.nextAvailable", "Keyingi bo'sh vaqt")}</p>
                  <p className="text-xs text-gray-500">{tr("checkin:result.nextAvailableDesc", "Aniq vaqt backend navbat xizmati mavjud bo'lgach ko'rsatiladi")}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{tr("checkin:result.doctor", "Shifokor")}</span>
                  <span className="text-xs font-semibold text-gray-900">{doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{tr("checkin:result.phone", "Telefon")}</span>
                  <span className="text-xs font-semibold text-gray-900">{phone}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleNotify}
              className={`w-full h-12 rounded-xl border-2 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 mb-3 ${
                notifSent
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700'
              }`}
            >
              {notifSent ? (
                <><i className="ri-check-line text-base"></i>{tr("checkin:result.notificationWillBeSent", "Xabar yuboriladi")}</>
              ) : (
                <><i className="ri-notification-line text-base"></i>{tr("checkin:result.notifyWhenFree", "Bo'sh bo'lganda xabar bering")}</>
              )}
            </button>
          </>
        )}

        {/* CASE 3: Info only */}
        {resultCase === 'info' && (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                <i className="ri-heart-pulse-line text-teal-600 text-3xl"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{tr("checkin:result.thanks", "Rahmat!")}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {tr("checkin:result.infoDesc", "Javoblaringiz qabul qilindi. Shifokor siz bilan bog'lanadi.")}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-700 mb-3">{tr("checkin:result.acceptedData", "Qabul qilingan ma'lumotlar:")}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{tr("checkin:result.phone", "Telefon")}</span>
                  <span className="text-xs font-semibold text-gray-900">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{tr("checkin:result.doctor", "Shifokor")}</span>
                  <span className="text-xs font-semibold text-gray-900">{doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{tr("checkin:result.answersCount", "Javoblar soni")}</span>
                  <span className="text-xs font-semibold text-gray-900">{t("result.answersCountValue", { count: Object.keys(answers).length, defaultValue: "{{count}} ta" })}</span>
                </div>
                {usedAI && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">{tr("checkin:result.aiAnalysis", "AI tahlil")}</span>
                    <span className="text-xs font-semibold text-emerald-600">{tr("checkin:result.completed", "O'tkazildi")}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="w-full h-12 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
        >
          <i className="ri-refresh-line text-base"></i>
          {tr("checkin:result.newRegistration", "Yangi ro'yxat")}
        </button>
      </div>
    </div>
  );
}
